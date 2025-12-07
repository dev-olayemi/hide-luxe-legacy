import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getProductsByCategory } from "@/lib/products";

const Furniture = () => {
  const products = getProductsByCategory("Furniture");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            Furniture Collection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Luxury leather furniture crafted with precision - sofas, chairs, and ottomans
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
              />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Furniture;
