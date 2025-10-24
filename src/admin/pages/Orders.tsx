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

      <div className="space-y-4">
        {orders.map((o) => (
          <div
            key={o.id}
            className="bg-white p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-medium">Order #{o.id}</div>
              <div className="text-sm text-gray-500">
                {o.deliveryDetails?.fullName ?? "—"} •{" "}
                {new Date(
                  o.createdAt?.seconds ? o.createdAt.seconds * 1000 : Date.now()
                ).toLocaleString()}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm font-semibold">
                ₦{Number(o.totalAmount ?? 0).toLocaleString()}
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full ${
                  o.status === "processing"
                    ? "bg-yellow-50 text-yellow-700"
                    : o.status === "paid"
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {o.status ?? "—"}
              </div>
              <Link
                to={`/admin/orders/${o.id}`}
                className="text-indigo-600 text-sm"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && (
          <div className="text-gray-500">No orders found.</div>
        )}
      </div>
    </div>
  );
};

export default Orders;
