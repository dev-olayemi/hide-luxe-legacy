/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/contexts/AuthContext"; // <- added

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth(); // <- added
  const WHATSAPP_NUMBER = "+2348144977227";
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleWhatsAppCheckout = () => {
    const cartDetails = cartItems
      .map(
        (item) =>
          `${item.name} (x${item.quantity}): ₦${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const message = `Hello, kindly confirm this order for me. I want to make payment.\n\nCart details:\n${cartDetails}\n\nTotal: ₦${total.toLocaleString()}\n\nCart link: ${cartLink}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Generate or retrieve cartId from localStorage
  let cartId = localStorage.getItem("cartId");
  if (!cartId) {
    cartId = uuidv4();
    localStorage.setItem("cartId", cartId);
  }
  const cartLink = `${window.location.origin}/cart-details/${cartId}`;

  // --- Flutterwave inline checkout (client-side) ---
  const loadFlutterwaveScript = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).FlutterwaveCheckout) return resolve();
      const s = document.createElement("script");
      s.src = "https://checkout.flutterwave.com/v3.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Flutterwave script failed to load"));
      document.body.appendChild(s);
    });

  const handleInlinePay = async () => {
    try {
      await loadFlutterwaveScript();
      const txRef = `hxl_${cartId}_${Date.now()}`;
      (window as any).FlutterwaveCheckout({
        public_key:
          import.meta.env.VITE_FLW_PUBLIC_KEY ||
          "FLWPUBK_TEST-fd5d2e18c86c2f1f86c82b49242b5d42-X",
        tx_ref: txRef,
        amount: total,
        currency: "NGN",
        payment_options: "card,ussd,banktransfer,qr",
        customer: {
          email: user?.email || "guest@hide-luxe.test",
          phonenumber: user?.phoneNumber || "",
          name: user?.displayName || "Guest",
        },
        meta: {
          cartId,
          items: cartItems.map((i) => ({ id: i.id, qty: i.quantity })),
        },
        customizations: {
          title: "28th Hide Luxe",
          description: "Order payment",
        },
        callback: function (data: any) {
          // data contains payment result; verify on server ideally
          console.log("Flutterwave callback:", data);
          // You may want to POST data to your server to verify and record the order
          alert("Payment finished. Please verify on the server.");
        },
        onclose: function () {
          // user closed the modal
        },
      });
    } catch (err) {
      console.error(err);
      alert("Could not load payment gateway. Try again.");
    }
  };

  // --- Create payment link via server (recommended for production) ---
  // server endpoint will use FLW secret key to create a payment link and return it
  const handleCreatePaymentLink = async () => {
    try {
      const resp = await fetch("/api/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          currency: "NGN",
          tx_ref: `hxl_link_${cartId}_${Date.now()}`,
          cartId,
          customer: {
            email: user?.email || "guest@hide-luxe.test",
            phonenumber: user?.phoneNumber || "",
            name: user?.displayName || "Guest",
          },
        }),
      });
      const data = await resp.json();
      if (data && data.status === "success" && data.data && data.data.link) {
        window.open(data.data.link, "_blank");
      } else {
        console.error("Create link error:", data);
        alert("Could not create payment link.");
      }
    } catch (err) {
      console.error(err);
      alert("Payment link request failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
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

                {/* Pay now (inline) */}
                <Button
                  className="w-full mb-3"
                  size="lg"
                  onClick={handleInlinePay}
                >
                  Pay Now
                </Button>

                {/* Alternative: create payment link (server) */}
                <Button
                  className="w-full mb-3"
                  variant="outline"
                  onClick={handleCreatePaymentLink}
                >
                  Get Pay Link
                </Button>

                {/* Ask seller via WhatsApp */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleWhatsAppCheckout}
                >
                  Ask Seller / Pay via WhatsApp
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  You'll be redirected to the payment gateway or WhatsApp.
                </p>

                {/* Cart link for seller */}
                <div className="mt-6 text-center">
                  <p className="text-sm mb-2">
                    Share this cart link with the seller:
                  </p>
                  <div className="bg-muted rounded px-3 py-2 break-all inline-block">
                    <a
                      href={`/cart-details/${cartId}`}
                      className="text-blue-600 underline"
                    >
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
