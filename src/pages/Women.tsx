import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import womenHeels from "@/assets/products/women-heels-brown.jpg";
import womenBoots from "@/assets/products/women-boots-black.jpg";

const Women = () => {
  const products = [
    {
      id: "2",
      name: "Elegant Leather Heels",
      price: 95000,
      image: womenHeels,
      category: "Women's Footwear",
      isNew: true,
    },
    {
      id: "4",
      name: "Sophisticated Ankle Boots",
      price: 135000,
      image: womenBoots,
      category: "Women's Footwear",
    },
  ];

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
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Women;
