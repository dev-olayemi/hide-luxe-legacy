/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";

const Products: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
        if (mounted) setItems(list);
      } catch (err: any) {
        console.error("Failed to load products", err);
        if (mounted) setError(err?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setItems((s) => s.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error("Delete failed", err);
      alert("Delete failed: " + (err?.message || err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Products</h1>
        <Link to="/admin/add-product" className="btn btn-primary">
          Add Product
        </Link>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}

      <div className="grid gap-4">
        {items.map((p) => (
          <div
            key={p.id}
            className="bg-white p-4 rounded shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-500">
                  ₦{Number(p.price ?? 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to={`/admin/products/${p.id}`} className="text-indigo-600">
                Edit
              </Link>
              <button onClick={() => remove(p.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <div className="text-gray-500">No products found.</div>
        )}
      </div>
    </div>
  );
};

export default Products;
