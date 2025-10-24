import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getNewArrivals } from "@/lib/products";

const NewArrivals = () => {
  const products = getNewArrivals();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            New Arrivals
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover our latest collection of handcrafted luxury leather footwear
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

        {products.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Stay tuned for our upcoming drops!
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewArrivals;
