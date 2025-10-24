/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";

const BespokeRequests: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "bespokeRequests"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (mounted) setItems(list);
      } catch (err: any) {
        console.error("Failed to load bespoke", err);
        if (mounted)
          setError(err?.message || "Failed to load bespoke requests");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bespokeRequests", id), {
        status,
        updatedAt: new Date(),
      });
      setItems((s) => s.map((it) => (it.id === id ? { ...it, status } : it)));
    } catch (err: any) {
      console.error("Update bespoke status failed", err);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <h1 className="text-lg font-bold mb-4">Bespoke Requests</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="bg-white p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{r.title ?? `Request ${r.id}`}</div>
              <div className="text-sm text-gray-500">
                {r.customerName ?? r.email ?? "—"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm px-2 py-1 rounded-full bg-gray-50">
                {r.status ?? "new"}
              </div>
              <button
                onClick={() => setStatus(r.id, "accepted")}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => setStatus(r.id, "rejected")}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-gray-500">No bespoke requests.</div>
        )}
      </div>
    </div>
  );
};

export default BespokeRequests;
