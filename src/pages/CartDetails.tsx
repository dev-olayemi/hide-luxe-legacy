/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Dummy fetch function (replace with real backend/API call)
const fetchCartById = async (cartId: string) => {
  // For demo: Try to get cart from localStorage (simulate backend)
  const cart = localStorage.getItem("cartItems");
  return cart ? JSON.parse(cart) : [];
};

const CartDetails = () => {
  const { cartId } = useParams();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cartId) {
      fetchCartById(cartId).then((items) => {
        setCartItems(items);
        setLoading(false);
      });
    }
  }, [cartId]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-playfair text-3xl font-bold mb-8">Cart Details</h1>
        <p className="mb-6 text-muted-foreground">
          Cart ID: <span className="font-mono">{cartId}</span>
        </p>
        {loading ? (
          <p>Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Cart is empty or not found
            </h2>
            <p className="text-muted-foreground">
              No items found for this cart.
            </p>
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
                      <p className="text-sm mt-2">
                        Quantity:{" "}
                        <span className="font-bold">{item.quantity}</span>
                      </p>
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
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartDetails;
