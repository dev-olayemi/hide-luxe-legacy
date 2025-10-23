/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
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
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

interface DeliveryDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  additionalInfo?: string;
}

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const WHATSAPP_NUMBER = "+2348144977227";

  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(
    () => {
      const savedDetails = localStorage.getItem(
        `lastDeliveryDetails_${user?.uid}`
      );
      const parsed = savedDetails ? JSON.parse(savedDetails) : null;

      return {
        fullName: user?.displayName || parsed?.fullName || "",
        email: user?.email || parsed?.email || "",
        phoneNumber: parsed?.phoneNumber || "",
        address: parsed?.address || "",
        city: parsed?.city || "",
        state: parsed?.state || "",
        additionalInfo: parsed?.additionalInfo || "",
      };
    }
  );

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<DeliveryDetails>>({});

  const [cartId] = useState(() => localStorage.getItem("cartId") || uuidv4());
  const cartLink = `${window.location.origin}/cart/${cartId}`;

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleDeliveryDetailsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setDeliveryDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFormErrors((prev) => {
        if (!prev[name as keyof DeliveryDetails]) return prev;
        const copy = { ...prev };
        delete copy[name as keyof DeliveryDetails];
        return copy;
      });
    },
    []
  );

  const validateDeliveryDetails = (): boolean => {
    const errors: Partial<DeliveryDetails> = {};
    const required = [
      "fullName",
      "email",
      "phoneNumber",
      "address",
      "city",
      "state",
    ];

    required.forEach((field) => {
      if (!deliveryDetails[field as keyof DeliveryDetails]) {
        errors[field as keyof DeliveryDetails] = `${field
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [savedAddresses, setSavedAddresses] = useState<DeliveryDetails[]>([]);
  const [editingDeliveryForm, setEditingDeliveryForm] = useState(false);

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`addresses_${user.uid}`);
      if (saved) {
        try {
          const addresses = JSON.parse(saved);
          setSavedAddresses(addresses);
          if (addresses.length > 0 && !deliveryDetails.address) {
            setDeliveryDetails(addresses[0]);
          }
        } catch (e) {
          console.error("Error loading saved addresses:", e);
        }
      }
    }
    // intentionally not including deliveryDetails in deps to avoid overwriting while editing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveDeliveryAddress = useCallback(() => {
    if (!user) return;
    const addresses = [
      deliveryDetails,
      ...savedAddresses.filter(
        (addr) => addr.address !== deliveryDetails.address
      ),
    ].slice(0, 5);
    setSavedAddresses(addresses);
    localStorage.setItem(`addresses_${user.uid}`, JSON.stringify(addresses));
    localStorage.setItem(
      `lastDeliveryDetails_${user.uid}`,
      JSON.stringify(deliveryDetails)
    );
  }, [user, deliveryDetails, savedAddresses]);

  // Payment handler (kept here)
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
      const orderRef = await addDoc(collection(db, "orders"), {
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
        totalAmount: total,
        deliveryDetails,
        status: "pending",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await loadFlutterwaveScript();
      const txRef = `hxl_${orderRef.id}_${Date.now()}`;

      (window as any).FlutterwaveCheckout({
        public_key:
          import.meta.env.VITE_FLW_PUBLIC_KEY ||
          "FLWPUBK_TEST-fd5d2e18c86c2f1f86c82b49242b5d42-X",
        tx_ref: txRef,
        amount: total,
        currency: "NGN",
        payment_options: "card,ussd,banktransfer,qr",
        customer: {
          email: deliveryDetails.email,
          phonenumber: deliveryDetails.phoneNumber,
          name: deliveryDetails.fullName,
        },
        meta: {
          orderId: orderRef.id,
        },
        customizations: {
          title: "28th Hide Luxe",
          description: "Order payment",
        },
        callback: async function (response: any) {
          try {
            if (!response.transaction_id || !response.status) {
              throw new Error("Invalid payment response");
            }

            await Promise.all([
              addDoc(collection(db, "payments"), {
                orderId: orderRef.id,
                transactionId: response.transaction_id,
                flwRef: response.flw_ref || null,
                amount: response.amount || total,
                status: response.status,
                paymentType: response.payment_type || "card",
                createdAt: serverTimestamp(),
                customerEmail: deliveryDetails.email,
                customerPhone: deliveryDetails.phoneNumber,
                deliveryAddress: {
                  ...deliveryDetails,
                  createdAt: serverTimestamp(),
                },
              }),
              updateDoc(doc(db, "orders", orderRef.id), {
                paymentStatus: "paid",
                status: "processing",
                updatedAt: serverTimestamp(),
                paymentDetails: {
                  transactionId: response.transaction_id,
                  flwRef: response.flw_ref || null,
                  amount: response.amount || total,
                  status: response.status,
                  paymentType: response.payment_type || "card",
                  paidAt: serverTimestamp(),
                },
                deliveryDetails: {
                  ...deliveryDetails,
                  updatedAt: serverTimestamp(),
                },
              }),
            ]);

            clearCart();
            localStorage.setItem(
              `lastDeliveryDetails_${user.uid}`,
              JSON.stringify(deliveryDetails)
            );

            toast({
              title: "Order Successful",
              description: "Your payment has been confirmed",
            });

            navigate(`/order-success/${orderRef.id}`);
          } catch (err) {
            console.error("Payment verification error:", err);
            toast({
              title: "Verification Error",
              description: "Please contact support with reference: " + txRef,
              variant: "destructive",
            });
          }
        },
        onclose: function () {},
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not process your order. Please try again.",
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

  const loadFlutterwaveScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).FlutterwaveCheckout) {
        return resolve();
      }
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Flutterwave script"));
      document.body.appendChild(script);
    });
  };

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
                        ₦{item.price.toLocaleString()}
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
              {showDeliveryForm && (
                <DeliveryForm
                  deliveryDetails={deliveryDetails}
                  onChange={handleDeliveryDetailsChange}
                  savedAddresses={savedAddresses}
                  editingDeliveryForm={editingDeliveryForm}
                  setEditingDeliveryForm={setEditingDeliveryForm}
                  saveDeliveryAddress={saveDeliveryAddress}
                  setShowDeliveryForm={setShowDeliveryForm}
                  user={user}
                />
              )}
            </div>

            <div>
              <Card className="p-6 sticky top-24">
                <h2 className="font-playfair text-2xl font-bold mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
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
   DeliveryForm component
   moved outside Cart to avoid remounts
   ========================= */
type DeliveryFormProps = {
  deliveryDetails: DeliveryDetails;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  savedAddresses: DeliveryDetails[];
  editingDeliveryForm: boolean;
  setEditingDeliveryForm: (v: boolean) => void;
  saveDeliveryAddress: () => void;
  setShowDeliveryForm: (v: boolean) => void;
  user: any;
};

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  deliveryDetails,
  onChange,
  savedAddresses,
  editingDeliveryForm,
  setEditingDeliveryForm,
  saveDeliveryAddress,
  setShowDeliveryForm,
  user,
}) => {
  const hasExistingAddress = savedAddresses.length > 0;

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-playfair text-xl font-bold">Delivery Details</h3>
        {hasExistingAddress && !editingDeliveryForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingDeliveryForm(true)}
          >
            Edit Address
          </Button>
        )}
      </div>

      {hasExistingAddress && !editingDeliveryForm ? (
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">{deliveryDetails.fullName}</p>
            <p>{deliveryDetails.email}</p>
            <p>{deliveryDetails.phoneNumber}</p>
            <p className="mt-2">{deliveryDetails.address}</p>
            <p>
              {deliveryDetails.city}
              {deliveryDetails.city && deliveryDetails.state ? ", " : ""}
              {deliveryDetails.state}
            </p>
          </div>
          <Button className="w-full" onClick={() => setShowDeliveryForm(false)}>
            Continue with this address
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setEditingDeliveryForm(true)}
          >
            Use a different address
          </Button>
        </div>
      ) : (
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={deliveryDetails.fullName}
                onChange={onChange}
                placeholder="Enter your full name"
                className="focus:ring-2 focus:ring-primary"
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={deliveryDetails.email}
                onChange={onChange}
                placeholder="Enter your email"
                className="focus:ring-2 focus:ring-primary"
                autoComplete="email"
                readOnly={!!user?.email}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={deliveryDetails.phoneNumber}
              onChange={onChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
              className="focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              name="address"
              value={deliveryDetails.address}
              onChange={onChange}
              placeholder="Enter your delivery address"
              autoComplete="street-address"
              className="focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={deliveryDetails.city}
                onChange={onChange}
                placeholder="Enter your city"
                autoComplete="address-level2"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={(deliveryDetails as any).state || ""}
                onChange={onChange}
                placeholder="State (optional)"
                autoComplete="address-level1"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              type="button"
              onClick={() => {
                saveDeliveryAddress();
                setEditingDeliveryForm(false);
                setShowDeliveryForm(false);
              }}
            >
              Save & Continue
            </Button>
            {hasExistingAddress && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDeliveryForm(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
};
