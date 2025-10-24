/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";

const Subscriptions: React.FC = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "subscriptions"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (mounted) setList(docs);
      } catch (err: any) {
        console.error("Failed to load subscriptions", err);
        if (mounted) setError(err?.message || "Failed to load subscriptions");
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
      <h1 className="text-lg font-bold mb-4">Subscriptions</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      <div className="space-y-3">
        {list.map((s) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{s.planName ?? s.id}</div>
              <div className="text-sm text-gray-500">{s.userEmail}</div>
            </div>
            <div className="text-sm text-gray-500">{s.status ?? "active"}</div>
          </div>
        ))}
        {!loading && list.length === 0 && (
          <div className="text-gray-500">No subscriptions found.</div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
