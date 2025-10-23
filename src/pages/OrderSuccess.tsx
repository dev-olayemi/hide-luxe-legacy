/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const orderDoc = await getDoc(doc(db, "orders", orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="font-playfair text-3xl font-bold mb-4">
            Order Successful!
          </h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We'll send you updates about your
            delivery.
          </p>

          <div className="text-left mb-8">
            <h2 className="font-semibold mb-2">Order Details:</h2>
            <p>Order ID: {order.id}</p>
            <p>Amount: ₦{order.totalAmount?.toLocaleString()}</p>
            <p>Status: {order.status}</p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/dashboard">View Order Status</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Continue Shopping</Link>
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccess;
