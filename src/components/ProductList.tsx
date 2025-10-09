/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllProducts } from "@/firebase/firebaseUtils";
import { ProductCard } from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">No products found.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          price={p.price}
          image={
            Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "/placeholder.png"
          }
          category={p.category}
          isNew={p.isNew}
        />
      ))}
    </div>
  );
};

export default ProductList;
