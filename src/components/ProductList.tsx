/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllProducts } from "@/firebase/firebaseUtils";
import { ProductCard } from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts({ liveOnly: true }).then((data) => {
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          price={p.price}
          discount={p.discount}
          image={
            Array.isArray(p.images) && p.images.length > 0
              ? p.images[0]
              : "/placeholder.png"
          }
          category={p.category}
          isNew={p.isNew}
          isAvailable={p.isAvailable !== false}
          availabilityReason={p.availabilityReason}
        />
      ))}
    </div>
  );
};

export default ProductList;
