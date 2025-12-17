/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/firebase/firebaseUtils";

const Specialty = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts({ liveOnly: true });
        const specialtyProducts = allProducts.filter((p: any) => 
          p.category?.toLowerCase().includes('specialty') || 
          p.categories?.some((cat: string) => cat.toLowerCase().includes('specialty'))
        );
        setProducts(specialtyProducts);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading products...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Specialty Collection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unique leather creations including book covers, musical instrument cases, and saddles
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">Coming soon...</p>
            </div>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                discount={product.discount}
                image={product.image}
                category={product.category}
                isNew={product.isNew}
                isAvailable={product.isAvailable !== false}
                availabilityReason={product.availabilityReason}
                sizes={product.sizes}
                colors={product.colors?.map(c => typeof c === 'string' ? { label: c, value: c } : c)}
                availableCount={product.stock}
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Specialty;
