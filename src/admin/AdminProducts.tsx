/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "@/firebase/firebaseUtils";
import AdminAddProduct from "./AdminAddProduct";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin/auth");
      return;
    }
    getAllProducts().then(setProducts);
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    setProducts(products.filter((p) => p.id !== id));
    toast({ title: "Product deleted" });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">All Products</h1>
      <AdminAddProduct />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-400">
            No products found.
          </div>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition"
          >
            <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
              {Array.isArray(p.images) && p.images.length > 0 ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="object-contain h-full w-full"
                />
              ) : (
                <span className="text-gray-400">No image</span>
              )}
              {p.isLimited && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Limited
                </span>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-lg text-gray-800 mb-1">
                {p.name}
              </h2>
              <div className="text-xs text-gray-500 mb-2">{p.category}</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                  <span className="text-xs text-indigo-600">
                    Sizes: {p.sizes.join(", ")}
                  </span>
                )}
                {Array.isArray(p.colors) && p.colors.length > 0 && (
                  <span className="text-xs text-pink-600">
                    Colors: {p.colors.join(", ")}
                  </span>
                )}
              </div>
              <div className="font-bold text-indigo-700 text-lg mb-2">
                ₦{p.price}
              </div>
              <div className="text-xs text-gray-400 mb-4">Stock: {p.stock}</div>
              <button
                className="mt-auto bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                onClick={() => handleDelete(p.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
