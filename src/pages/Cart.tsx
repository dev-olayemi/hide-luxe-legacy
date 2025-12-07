/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Gift, MapPin, Package } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db, saveSharedCartSnapshot as saveSharedCartSnapshotToFirebase, getUserProfile, setUserStorePoints as setUserStorePointsFirebase, createNotification } from "@/firebase/firebaseUtils";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { calculateStorePointsValue, calculatePointsFromNGN } from "@/config/storePointsConfig";
import { calculateDeliveryFee, formatDeliveryFee, PICKUP_LOCATION, DeliveryOption, getNigerianStates } from "@/config/deliveryConfig";

interface DeliveryDetails {
  id?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country?: string;
  additionalInfo?: string;
}

const WHATSAPP_NUMBER = "+2349031976895";
const SHARED_CART_PREFIX = "shared_cart_";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [countries, setCountries] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [countryLoading, setCountryLoading] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState<DeliveryDetails[]>(
    () => {
      try {
        if (!user) return [];
        const raw = localStorage.getItem(`addresses_${user.uid}`);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn("failed to parse saved addresses", e);
        return [];
      }
    }
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    () => {
      try {
        if (!user) return null;
        const rawLast = localStorage.getItem(`lastDeliveryDetails_${user.uid}`);
        const parsedLast = rawLast ? JSON.parse(rawLast) : null;
        if (parsedLast && parsedLast.id) return parsedLast.id;
        // fallback will be set after savedAddresses loads via effect below
        return null;
      } catch (e) {
        console.warn("failed to parse lastDeliveryDetails", e);
        return null;
      }
    }
  );

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(
    () => {
      const base = {
        fullName: user?.displayName || "",
        email: user?.email || "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        country: "Nigeria",
        additionalInfo: "",
      } as DeliveryDetails;

      // prefer lastDeliveryDetails if present in localStorage (safe parse)
      try {
        if (user) {
          const rawLast = localStorage.getItem(
            `lastDeliveryDetails_${user.uid}`
          );
          const parsedLast = rawLast ? JSON.parse(rawLast) : null;
          if (parsedLast && typeof parsedLast === "object") {
            return { ...base, ...parsedLast };
          }
        }
      } catch (e) {
        /* ignore parse errors, fall back to base */
      }

      return base;
    }
  );

  // when savedAddresses load/update, ensure we have a selectedAddressId and deliveryDetails synced
  useEffect(() => {
    if (!selectedAddressId && savedAddresses.length > 0) {
      const first = savedAddresses[0];
      setSelectedAddressId(first.id ?? null);
      setDeliveryDetails((prev) => ({ ...prev, ...first }));
    }
    // keep deliveryDetails in sync if selectedAddressId is already set but deliveryDetails is empty
     
  }, [savedAddresses]);

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<DeliveryDetails>>({});
  const [editingDeliveryForm, setEditingDeliveryForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Store points state
  const [userStorePoints, setUserStorePointsState] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [showPointsInput, setShowPointsInput] = useState(false);

  // Delivery option state
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('delivery');

  // Fetch user store points
  useEffect(() => {
    if (!user) {
      setUserStorePointsState(0);
      return;
    }
    const loadPoints = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        setUserStorePointsState(profile?.storePoints || 0);
      } catch (err) {
        console.error("Failed to fetch store points:", err);
        setUserStorePointsState(0);
      }
    };
    loadPoints();
  }, [user]);

  const [cartId] = useState(() => localStorage.getItem("cartId") || uuidv4());
  const cartLink = `${window.location.origin}/cart/${cartId}`;

  const { formatPrice, currency } = useCurrency();

  const formatNGN = (n: number) => `₦${n.toLocaleString()}`;

  // Persist a snapshot of the cart + delivery details for seller preview/share
  const saveSharedCartSnapshot = async (items: any[], delivery: DeliveryDetails | null) => {
    const payload = {
      id: cartId,
      items,
      deliveryDetails: delivery || null,
      total: items.reduce((s: number, it: any) => s + it.price * it.quantity, 0),
      createdAt: new Date().toISOString(),
    };

    // Save locally first (fallback/offline)
    try {
      localStorage.setItem(`${SHARED_CART_PREFIX}${cartId}`, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to persist shared snapshot locally", e);
    }

    // Try saving to Firestore so sellers on other devices can access
    try {
      await saveSharedCartSnapshotToFirebase(cartId, payload);
    } catch (err) {
      console.warn("Failed to save shared snapshot to Firestore", err);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // keep shared snapshot up to date whenever cart or delivery changes
  useEffect(() => {
    saveSharedCartSnapshot(cartItems, deliveryDetails);
    // also persist a simple cart copy for CartDetails fallback
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('failed to persist cartItems', e);
    }
    // store cartId so link remains stable across reloads
    try {
      localStorage.setItem('cartId', cartId);
    } catch (e) { /* empty */ }
  }, [cartItems, deliveryDetails, cartId, saveSharedCartSnapshot]);

  // fetch countries list (uses restcountries for readable names) with cache and timeout
  useEffect(() => {
    let mounted = true;
    const CACHE_KEY = "countries_cache_v1";
    const TTL = 1000 * 60 * 60 * 24; // 24h

    const localFallback = [
      "Nigeria",
      "United States",
      "United Kingdom",
      "Ghana",
      "Kenya",
      "South Africa",
    ];

    const loadFromCache = (): string[] | null => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.ts || !parsed.items) return null;
        if (Date.now() - parsed.ts > TTL) return null;
        return parsed.items;
      } catch (e) {
        return null;
      }
    };

    const saveToCache = (items: string[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } catch (e) {
        /* ignore */
      }
    };

    const fetchWithTimeout = (url: string, opts: RequestInit = {}, timeout = 3000) =>
      Promise.race([
        fetch(url, opts),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeout)),
      ]);

    (async () => {
      setCountryLoading(true);
      try {
        const cached = loadFromCache();
        if (cached) {
          if (mounted) setCountries(cached);
          setCountryLoading(false);
          return;
        }

        // Try REST Countries with a short timeout
        try {
          const res = await fetchWithTimeout("https://restcountries.com/v3.1/all", {}, 3000) as Response;
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              const names = data.map((c: any) => c?.name?.common).filter(Boolean);
              const items = Array.from(new Set(["Nigeria", ...names])).sort();
              if (mounted) setCountries(items);
              saveToCache(items);
              setCountryLoading(false);
              return;
            }
          }
        } catch (e) {
          // fallthrough to fallback
        }

        // Secondary attempt: countriesnow (short timeout)
        try {
          const res2 = await fetchWithTimeout("https://countriesnow.space/api/v0.1/countries/", {}, 3000) as Response;
          if (res2.ok) {
            const json2 = await res2.json();
            const data2 = json2?.data || json2?.countries || [];
            if (Array.isArray(data2)) {
              const names = data2.map((c: any) => c.country || c.name || c.countryName).filter(Boolean);
              const items = Array.from(new Set(["Nigeria", ...names])).sort();
              if (mounted) setCountries(items);
              saveToCache(items);
              setCountryLoading(false);
              return;
            }
          }
        } catch (e) {
          // fallthrough to fallback
        }

        // Final fallback
        if (mounted) setCountries(localFallback);
        saveToCache(localFallback);
      } catch (err) {
        console.error("countries fetch error", err);
        if (mounted) setCountries(localFallback);
      } finally {
        if (mounted) setCountryLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  // fetch states for selected country (cached + fast Nigeria path)
  const fetchStatesForCountry = useCallback(async (countryName: string) => {
    if (!countryName) {
      setStates([]);
      return;
    }

    // Fast path: local Nigerian states list
    if (countryName.toLowerCase().includes("nigeria")) {
      try {
        const ns = getNigerianStates();
        setStates(ns);
        return;
      } catch (err) {
        console.warn("failed to load local Nigerian states", err);
      }
    }

    const CACHE_KEY = `states_cache_${countryName.replace(/[^a-z0-9]/gi, '_')}`;
    const TTL = 1000 * 60 * 60 * 24; // 24h

    const loadFromCache = (): string[] | null => {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.ts || !parsed.items) return null;
        if (Date.now() - parsed.ts > TTL) return null;
        return parsed.items;
      } catch (e) {
        return null;
      }
    };

    const saveToCache = (items: string[]) => {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items }));
      } catch (e) {
        /* ignore */
      }
    };

    const fetchWithTimeout = (url: string, opts: RequestInit = {}, timeout = 3000) =>
      Promise.race([
        fetch(url, opts),
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeout)),
      ]);

    try {
      setStates([]);
      const cached = loadFromCache();
      if (cached) {
        setStates(cached);
        return;
      }

      // Try countriesnow API (short timeout)
      try {
        const res = await fetchWithTimeout("https://countriesnow.space/api/v0.1/countries/states", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        }, 3000) as Response;

        if (res.ok) {
          const json = await res.json();
          if (json && json.data && json.data.states) {
            const items = json.data.states.map((s: any) => s.name);
            setStates(items);
            saveToCache(items);
            return;
          }
        }
      } catch (e) {
        console.warn('states api failed or timed out', e);
      }

      // fallback: empty list (other countries not supported live)
      setStates([]);
    } catch (err) {
      console.error("states fetch error", err);
      setStates([]);
    }
  }, []);

  useEffect(() => {
    // if selectedAddressId corresponds to a saved address, load into deliveryDetails
    if (!selectedAddressId) return;
    const found = savedAddresses.find((a) => a.id === selectedAddressId);
    if (found) {
      setDeliveryDetails((prev) => ({ ...prev, ...found }));
      if (found.country) fetchStatesForCountry(found.country);
    }
  }, [selectedAddressId, savedAddresses, fetchStatesForCountry]);

  const handleDeliveryDetailsChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const { name, value } = e.target as HTMLInputElement;
      setDeliveryDetails((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => {
        if (!prev[name as keyof DeliveryDetails]) return prev;
        const copy = { ...prev };
        delete copy[name as keyof DeliveryDetails];
        return copy;
      });

      if (name === "country") {
        // fetch states for new country
        fetchStatesForCountry(value);
        setDeliveryDetails((prev) => ({ ...prev, state: "" }));
      }
    },
    [fetchStatesForCountry]
  );

  const validateDeliveryDetails = (): boolean => {
    const errors: Partial<DeliveryDetails> = {};
    
    // For pickup, only require contact info
    const required = deliveryOption === 'pickup' 
      ? ["fullName", "email", "phoneNumber"]
      : ["fullName", "email", "phoneNumber", "address", "city", "state", "country"];
    
    required.forEach((field) => {
      if (!deliveryDetails[field as keyof DeliveryDetails]) {
        errors[field as keyof DeliveryDetails] = `${field
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} is required`;
      }
    });
    
    // For delivery, validate that country is Nigeria (international not supported)
    if (deliveryOption === 'delivery' && deliveryDetails.country && deliveryDetails.country.toLowerCase() !== 'nigeria') {
      errors.country = 'Only Nigerian delivery is supported. Choose pickup or contact seller.';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAddressesToLocal = (addresses: DeliveryDetails[]) => {
    if (!user) return;
    localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(addresses));
    localStorage.setItem(
      `lastDeliveryDetails_${user.uid}`,
      JSON.stringify(addresses[0] ?? {})
    );
  };

  const addOrUpdateAddress = (addr: DeliveryDetails) => {
    if (!user) return;
    const copy = [...savedAddresses];
    if (!addr.id) addr.id = uuidv4();
    const idx = copy.findIndex((a) => a.id === addr.id);
    if (idx === -1) copy.unshift(addr);
    else copy[idx] = addr;
    const next = copy.slice(0, 10);
    setSavedAddresses(next);
    saveAddressesToLocal(next);
    setSelectedAddressId(addr.id);
    setEditingDeliveryForm(false);
    setShowDeliveryForm(false);
  };

  const deleteAddress = (id?: string) => {
    if (!user || !id) return;
    const next = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(next);
    saveAddressesToLocal(next);
    if (next.length > 0) {
      setSelectedAddressId(next[0].id ?? null);
      setDeliveryDetails(next[0]);
    } else {
      setSelectedAddressId(null);
      setDeliveryDetails({
        fullName: user.displayName || "",
        email: user.email || "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        country: "",
        additionalInfo: "",
      });
    }
  };

  // Payment flow: initiate Flutterwave, create order & payment only after successful payment callback
  const loadFlutterwaveScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).FlutterwaveCheckout) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Flutterwave script"));
      document.body.appendChild(script);
    });
  };

  // create order + payment after successful payment response
  const persistOrderAfterPayment = async (orderMeta: {
    flwRef?: string;
    transaction_id?: string;
    amount?: number;
    status?: string;
    tx_ref?: string;
  }) => {
    if (!user) throw new Error("No authenticated user");
    
    // Calculate delivery fee
    const deliveryFee = deliveryOption === 'pickup' 
      ? 0 
      : (deliveryDetails.state && deliveryDetails.country?.toLowerCase() === 'nigeria'
          ? (calculateDeliveryFee(deliveryDetails.state, deliveryDetails.country || 'Nigeria') || 0)
          : 0);
    
    // Calculate discount from store points
    const discountAmount = calculateStorePointsValue(pointsToRedeem);
    const subtotal = orderMeta.amount || total;
    const finalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);
    
    // build order payload
    const orderPayload = {
      userId: user.uid,
      userEmail: user.email,
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        category: item.category,
      })),
      subtotalAmount: subtotal,
      deliveryFee,
      deliveryOption,
      totalAmount: finalAmount,
      originalAmount: orderMeta.amount ?? total,
      storePointsRedeemed: pointsToRedeem,
      storePointsDiscount: discountAmount,
      deliveryDetails: deliveryOption === 'pickup' 
        ? { 
            ...PICKUP_LOCATION,
            fullName: deliveryDetails.fullName,
            email: deliveryDetails.email,
            phoneNumber: deliveryDetails.phoneNumber,
            createdAt: serverTimestamp(),
          }
        : {
            ...deliveryDetails,
            createdAt: serverTimestamp(),
          },
      status: orderMeta.status === "successful" ? "processing" : "pending",
      paymentStatus: orderMeta.status === "successful" ? "paid" : "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      txRef: orderMeta.tx_ref || null,
      paymentDetails: {
        transactionId: orderMeta.transaction_id || null,
        flwRef: orderMeta.flwRef || null,
        amount: finalAmount,
        status: orderMeta.status || null,
      },
    };

    // write order and payment docs
    const orderRef = await addDoc(collection(db, "orders"), orderPayload);
    // create a user notification about the new order so it appears in their dashboard
    try {
      await createNotification({
        userId: user.uid,
        type: "order",
        title: "Order Received",
        message: `Your order ${orderRef.id} was received. Tap to view details.`,
        actionUrl: `/order-success/${orderRef.id}`,
        actionLabel: "View Order",
        read: false,
        metadata: { orderId: orderRef.id, amount: finalAmount },
      });
    } catch (e) {
      console.warn("Failed to create order notification", e);
    }
    await addDoc(collection(db, "payments"), {
      orderId: orderRef.id,
      transactionId: orderMeta.transaction_id || null,
      flwRef: orderMeta.flwRef || null,
      amount: finalAmount,
      status: orderMeta.status || null,
      createdAt: serverTimestamp(),
      customerEmail: deliveryDetails.email,
      customerPhone: deliveryDetails.phoneNumber,
    });

    // Deduct store points if any were redeemed
    if (pointsToRedeem > 0) {
      try {
        const remainingPoints = userStorePoints - pointsToRedeem;
        await setUserStorePointsFirebase(user.uid, remainingPoints);
        setUserStorePointsState(remainingPoints);
        setPointsToRedeem(0);
      } catch (err) {
        console.error("Failed to deduct store points:", err);
      }
    }

    return orderRef.id;
  };

  const handleInlinePay = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete your purchase",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    // ensure delivery details selected or valid
    if (!validateDeliveryDetails()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required delivery details",
        variant: "destructive",
      });
      setShowDeliveryForm(true);
      return;
    }

    try {
      setLoading(true);
      await loadFlutterwaveScript();

      const txRef = `hxl_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      const flwPublicKey = import.meta.env.VITE_FLW_PUBLIC_KEY;
      if (!flwPublicKey) {
        toast({
          title: "Configuration Error",
          description: "Flutterwave public key not configured. Contact support.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Calculate delivery fee
      const deliveryFee = deliveryOption === 'pickup' 
        ? 0 
        : (deliveryDetails.state && deliveryDetails.country?.toLowerCase() === 'nigeria'
            ? (calculateDeliveryFee(deliveryDetails.state, deliveryDetails.country || 'Nigeria') || 0)
            : 0);
      
      // Calculate final amount after points discount and delivery
      const discountAmount = calculateStorePointsValue(pointsToRedeem);
      const finalAmount = Math.max(0, total + deliveryFee - discountAmount);

      (window as any).FlutterwaveCheckout({
        public_key: flwPublicKey,
        tx_ref: txRef,
        amount: finalAmount,
        currency: "NGN",
        payment_options: "card,ussd,banktransfer,qr",
        customer: {
          email: deliveryDetails.email,
          phonenumber: deliveryDetails.phoneNumber,
          name: deliveryDetails.fullName,
        },
        meta: {
          cartId,
        },
        customizations: {
          title: "28th Hide Luxe",
          description: "Order payment",
        },
        // Fallback redirect: when inline callback isn't fired this ensures
        // the payment provider redirects back to our app with tx_ref
        redirect_url: `${window.location.origin}/order-success?tx_ref=${txRef}`,
        callback: async function (response: any) {
          console.log("Flutterwave callback invoked:", response, { txRef });
          try {
            // Flutterwave returns response.status === "successful" when ok
            const status = response?.status;
            const txId = response?.transaction_id || response?.id || null;
            const flwRef = response?.flw_ref || null;
            const amount = response?.amount || finalAmount;

            if (status !== "successful") {
              toast({
                title: "Payment not completed",
                description:
                  "Payment was not successful. Please try again or contact support.",
                variant: "destructive",
              });
              return;
            }

            // Persist order & payment after successful payment
            const orderId = await persistOrderAfterPayment({
              flwRef,
              transaction_id: txId,
              amount,
              status,
              tx_ref: txRef,
            });

            // save last used address and addresses list
            if (user) {
              // ensure we have an id for the deliveryDetails
              const finalAddr = {
                ...deliveryDetails,
                id: deliveryDetails.id ?? uuidv4(),
              };
              const deduped = [
                finalAddr,
                ...savedAddresses.filter(
                  (a) => a.address !== finalAddr.address
                ),
              ].slice(0, 10);
              setSavedAddresses(deduped);
              saveAddressesToLocal(deduped);
              localStorage.setItem(
                `lastDeliveryDetails_${user.uid}`,
                JSON.stringify(finalAddr)
              );
            }

            // clear cart only after order/pymt persisted
            clearCart();

            toast({
              title: "Order Successful",
              description: "Your payment has been confirmed",
            });

            navigate(`/order-success/${orderId}`);
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Verification Error",
              description:
                "Failed to save order after payment. Contact support.",
              variant: "destructive",
            });
          }
        },
        onclose: function () {
          console.log("Flutterwave modal closed");
          // user closed checkout
        },
      });
      // checkout initialized, clear initiating state
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast({
        title: "Payment Error",
        description: "Could not start payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  function handleWhatsAppCheckout(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();
    const phone = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
    const itemsText = cartItems
      .map((i) => `${i.quantity} x ${i.name} (₦${i.price.toLocaleString()})`)
      .join("\n");
    const message = `Hello, I would like to purchase:\n${itemsText}\n\nTotal: ₦${total.toLocaleString()}\n\nName: ${
      deliveryDetails.fullName
    }\nPhone: ${deliveryDetails.phoneNumber}\nAddress: ${
      deliveryDetails.address
    }`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <BackButton className="mb-6" />
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Start shopping and add items to your cart
            </p>
            <Link to="/new-arrivals">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-24 w-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-playfair font-medium mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.category}
                      </p>
                      <p className="font-semibold">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Chat seller about this item"
                        onClick={() => {
                          // Compose a per-item WhatsApp message and open chat
                          const phone = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
                          const now = new Date().toLocaleString();
                          const msg = `Hello, I'd like information about this product:\n\nProduct: ${item.name}\nCategory: ${item.category}\nPrice: ₦${item.price.toLocaleString()}\nQuantity: ${item.quantity}\nSelected options: ${item.size || 'N/A'} / ${item.color || 'N/A'}\n\nCart link: ${cartLink}\nDate: ${now}`;
                          const url = `https://wa.me/${phone}?text=${encodeURIComponent(
                            msg
                          )}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Button>
                      <div className="flex items-center gap-2 border rounded">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Delivery / addresses manager */}
              <DeliveryManager
                countries={countries}
                countryLoading={countryLoading}
                states={states}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                setSelectedAddressId={setSelectedAddressId}
                deliveryDetails={deliveryDetails}
                onChange={handleDeliveryDetailsChange}
                onAddOrUpdate={addOrUpdateAddress}
                onDelete={deleteAddress}
                showDeliveryForm={showDeliveryForm}
                setShowDeliveryForm={setShowDeliveryForm}
                editingDeliveryForm={editingDeliveryForm}
                setEditingDeliveryForm={setEditingDeliveryForm}
              />
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="font-playfair text-2xl font-bold mb-4">
                  Order Summary
                </h2>

                {/* Delivery Option Selection */}
                <div className="mb-4 space-y-3">
                  <Label className="text-sm font-semibold">Delivery Option</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('delivery')}
                      className={`p-3 rounded border text-left transition-all ${
                        deliveryOption === 'delivery' 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4" />
                        <span className="font-medium text-sm">Delivery</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {deliveryDetails.state && deliveryDetails.country?.toLowerCase() === 'nigeria'
                          ? formatDeliveryFee(calculateDeliveryFee(deliveryDetails.state, deliveryDetails.country || 'Nigeria'))
                          : 'Select state for price'
                        }
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryOption('pickup')}
                      className={`p-3 rounded border text-left transition-all ${
                        deliveryOption === 'pickup' 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium text-sm">Self Pickup</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Free - Lagos</p>
                    </button>
                  </div>
                  
                  {deliveryOption === 'pickup' && (
                    <div className="p-3 bg-muted/50 rounded text-sm">
                      <div className="font-medium mb-1">Pickup Location:</div>
                      <div className="text-muted-foreground">
                        {PICKUP_LOCATION.address}, {PICKUP_LOCATION.city}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {PICKUP_LOCATION.note}
                      </div>
                    </div>
                  )}
                  
                  {deliveryOption === 'delivery' && deliveryDetails.country && deliveryDetails.country.toLowerCase() !== 'nigeria' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                      International shipping requires contacting the seller directly.
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery</span>
                    <span>
                      {deliveryOption === 'pickup' 
                        ? 'Free (Pickup)' 
                        : deliveryDetails.state && deliveryDetails.country?.toLowerCase() === 'nigeria'
                          ? (() => {
                              const fee = calculateDeliveryFee(deliveryDetails.state, deliveryDetails.country || 'Nigeria');
                              return fee === null ? formatDeliveryFee(fee) : formatPrice(fee as number);
                            })()
                          : <span className="text-muted-foreground">Select Nigerian state</span>
                      }
                    </span>
                  </div>
                </div>

                {/* Store Points Redemption */}
                {userStorePoints > 0 && (
                  <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold">Available Points: {userStorePoints}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPointsInput(!showPointsInput)}
                      >
                        {showPointsInput ? "Hide" : "Redeem"}
                      </Button>
                    </div>
                    {showPointsInput && (
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          1 point = {formatPrice(10)} (up to {formatPrice(calculateStorePointsValue(userStorePoints))})
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={userStorePoints}
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Math.max(0, Math.min(userStorePoints, Number(e.target.value) || 0)))}
                            placeholder="Enter points"
                            className="h-8"
                          />
                          <Button
                            size="sm"
                            onClick={() => setPointsToRedeem(userStorePoints)}
                          >
                            Max
                          </Button>
                        </div>
                        {pointsToRedeem > 0 && (
                          <div className="text-xs text-green-600 font-semibold">
                            Discount: {formatPrice(calculateStorePointsValue(pointsToRedeem))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4 mb-6 space-y-2">
                  {pointsToRedeem > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Points Discount</span>
                      <span>-{formatPrice(calculateStorePointsValue(pointsToRedeem))}</span>
                    </div>
                  )}
                  {(() => {
                    const deliveryFee = deliveryOption === 'pickup' 
                      ? 0 
                      : (deliveryDetails.state && deliveryDetails.country?.toLowerCase() === 'nigeria'
                          ? (calculateDeliveryFee(deliveryDetails.state, deliveryDetails.country || 'Nigeria') || 0)
                          : 0);
                    const grandTotal = Math.max(0, total + deliveryFee - calculateStorePointsValue(pointsToRedeem));
                    return (
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(grandTotal)}</span>
                      </div>
                    );
                  })()}
                </div>

                {!showDeliveryForm ? (
                  <Button
                    className="w-full mb-3"
                    size="lg"
                    onClick={() => setShowDeliveryForm(true)}
                  >
                    Proceed to Checkout
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full mb-3"
                      size="lg"
                      onClick={handleInlinePay}
                    >
                      Pay Now
                    </Button>
                    <Button
                      className="w-full mb-3"
                      size="lg"
                      variant="secondary"
                      onClick={(e) => {
                        // For PalmPay we open a WhatsApp request to seller to initiate PalmPay flow
                        e.preventDefault();
                        const phone = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
                        const msg = `Hello, I'd like to pay via PalmPay.\n\nCart: ${cartLink}\nTotal: ₦${total.toLocaleString()}\nName: ${deliveryDetails.fullName || 'N/A'}\nPhone: ${deliveryDetails.phoneNumber || 'N/A'}`;
                        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                        window.open(url, "_blank");
                      }}
                    >
                      Pay with PalmPay
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={handleWhatsAppCheckout}
                    >
                      Ask Seller / Pay via WhatsApp
                    </Button>
                  </>
                )}

                <p className="text-xs text-center text-muted-foreground mt-4">
                  You'll be redirected to the payment gateway or WhatsApp.
                </p>

                <div className="mt-6 text-center">
                  <p className="text-sm mb-2">
                    Share this cart link with the seller:
                  </p>
                  <div className="bg-muted rounded px-3 py-2 break-all inline-block">
                    <a href={cartLink} className="text-blue-600 underline">
                      {cartLink}
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;

/* =========================
   DeliveryManager component
   ========================= */

type DeliveryManagerProps = {
  countries: string[];
  countryLoading: boolean;
  states: string[];
  savedAddresses: DeliveryDetails[];
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string | null) => void;
  deliveryDetails: DeliveryDetails;
  onChange: (e: React.ChangeEvent<any>) => void;
  onAddOrUpdate: (addr: DeliveryDetails) => void;
  onDelete: (id?: string) => void;
  showDeliveryForm: boolean;
  setShowDeliveryForm: (v: boolean) => void;
  editingDeliveryForm: boolean;
  setEditingDeliveryForm: (v: boolean) => void;
};

const DeliveryManager: React.FC<DeliveryManagerProps> = ({
  countries,
  countryLoading,
  states,
  savedAddresses,
  selectedAddressId,
  setSelectedAddressId,
  deliveryDetails,
  onChange,
  onAddOrUpdate,
  onDelete,
  showDeliveryForm,
  setShowDeliveryForm,
  editingDeliveryForm,
  setEditingDeliveryForm,
}) => {
  const [localAddr, setLocalAddr] = useState<DeliveryDetails>(deliveryDetails);

  useEffect(() => setLocalAddr(deliveryDetails), [deliveryDetails]);

  return (
    <div>
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair text-xl font-bold">Delivery Details</h3>
          <div className="flex items-center gap-2">
            {savedAddresses.length > 0 && !showDeliveryForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeliveryForm(true)}
              >
                Change / Add
              </Button>
            )}
          </div>
        </div>

        {savedAddresses.length > 0 && !showDeliveryForm ? (
          <div className="space-y-3">
            {savedAddresses.map((addr) => (
              <div
                key={addr.id}
                className={
                  "p-3 rounded border " +
                  (addr.id === selectedAddressId ? "ring-2 ring-accent" : "")
                }
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{addr.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {addr.address}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} — {addr.country}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {addr.phoneNumber}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedAddressId(addr.id || null);
                      }}
                    >
                      Use
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedAddressId(addr.id || null);
                          setShowDeliveryForm(true);
                          setEditingDeliveryForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(addr.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowDeliveryForm(true);
                  setEditingDeliveryForm(false);
                }}
              >
                Add New Address
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAddOrUpdate({ ...localAddr, id: localAddr.id ?? uuidv4() });
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={localAddr.fullName}
                    name="fullName"
                    onChange={(e) => {
                      setLocalAddr({ ...localAddr, fullName: e.target.value });
                      onChange(e);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    value={localAddr.email}
                    name="email"
                    onChange={(e) => {
                      setLocalAddr({ ...localAddr, email: e.target.value });
                      onChange(e);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={localAddr.phoneNumber}
                    name="phoneNumber"
                    onChange={(e) => {
                      setLocalAddr({
                        ...localAddr,
                        phoneNumber: e.target.value,
                      });
                      onChange(e);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country *</Label>
                  <input
                    list="countries-list"
                    name="country"
                    className="input"
                    value={localAddr.country || ""}
                    onChange={(e) => {
                      setLocalAddr({
                        ...localAddr,
                        country: e.target.value,
                        state: "",
                      });
                      onChange(e);
                    }}
                    placeholder={countryLoading ? 'Loading countries...' : 'Select or type a country'}
                  />
                  <datalist id="countries-list">
                    {countries.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label>State / Region *</Label>
                  <input
                    list="states-list"
                    name="state"
                    className="input"
                    value={localAddr.state || ""}
                    onChange={(e) => {
                      setLocalAddr({ ...localAddr, state: e.target.value });
                      onChange(e);
                    }}
                    placeholder={states.length === 0 ? 'Select country first or type state' : 'Select or type a state'}
                  />
                  <datalist id="states-list">
                    {(states || []).map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label>City / Town *</Label>
                  <Input
                    name="city"
                    value={localAddr.city || ""}
                    onChange={(e) => {
                      setLocalAddr({ ...localAddr, city: e.target.value });
                      onChange(e);
                    }}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Address *</Label>
                  <Textarea
                    value={localAddr.address}
                    name="address"
                    onChange={(e) => {
                      setLocalAddr({ ...localAddr, address: e.target.value });
                      onChange(e);
                    }}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Additional Info</Label>
                  <Textarea
                    value={localAddr.additionalInfo || ""}
                    name="additionalInfo"
                    onChange={(e) => {
                      setLocalAddr({
                        ...localAddr,
                        additionalInfo: e.target.value,
                      });
                      onChange(e);
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button type="submit">Save Address</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeliveryForm(false);
                    setEditingDeliveryForm(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};
