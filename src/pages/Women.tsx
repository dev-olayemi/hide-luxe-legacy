/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/firebase/firebaseUtils";

const Women = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getAllProducts({ liveOnly: true });
        const womenProducts = allProducts.filter((p: any) => 
          p.category?.toLowerCase().includes('women') || 
          p.categories?.some((cat: string) => cat.toLowerCase().includes('women'))
        );
        setProducts(womenProducts);
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
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Women's Collection
          </h1>
          <p className="text-muted-foreground text-lg">
            Elegance redefined for the contemporary woman
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              discount={product.discount}
              image={
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : "/placeholder.png"
              }
              category={product.category}
              isNew={product.isNew}
              isAvailable={product.isAvailable !== false}
              availabilityReason={product.availabilityReason}
              sizes={product.sizes}
              colors={product.colors?.map(c => typeof c === 'string' ? { label: c, value: c } : c)}
              availableCount={product.stock}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Women;
