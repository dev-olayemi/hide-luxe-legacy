import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/products";

const Men = () => {
  const products = getProductsByCategory("Men's Footwear");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Men's Collection
          </h1>
          <p className="text-muted-foreground text-lg">
            Timeless sophistication for the modern gentleman
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              colors={product.colors?.map(c => typeof c === 'string' ? { label: c, value: c } : c)}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Men;
