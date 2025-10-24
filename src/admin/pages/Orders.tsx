/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";

type Order = {
  id: string;
  totalAmount?: number;
  status?: string;
  createdAt?: any;
  deliveryDetails?: any;
  paymentDetails?: any;
  userEmail?: string;
  items?: any[];
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const list: Order[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        if (mounted) setOrders(list);
      } catch (err: any) {
        console.error("Failed to load orders", err);
        if (mounted)
          setError(
            err?.message || "Failed to load orders (check rules / auth)"
          );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Link to="/admin/orders" className="text-sm text-gray-500 hidden" />
      </div>

      {loading && <div>Loading orders…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="grid gap-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold text-lg">Order #{o.id.slice(0, 8)}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(
                    o.createdAt?.seconds ? o.createdAt.seconds * 1000 : Date.now()
                  ).toLocaleString()}
                </div>
              </div>
              <div
                className={`text-xs px-3 py-1 rounded-full font-medium ${
                  o.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : o.status === "processing"
                    ? "bg-blue-100 text-blue-700"
                    : o.status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : o.status === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : o.status === "refunded"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {o.status ?? "pending"}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-muted-foreground">Customer</div>
                <div className="font-medium">{o.deliveryDetails?.fullName ?? "—"}</div>
                <div className="text-sm text-muted-foreground">{o.deliveryDetails?.email ?? o.userEmail ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Amount</div>
                <div className="text-xl font-bold">
                  ₦{Number(o.totalAmount ?? 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Items</div>
                <div className="font-medium">{o.items?.length ?? 0} items</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to={`/admin/orders/${o.id}`}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-lg">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
