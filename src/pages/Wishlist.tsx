/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useEffect, useState } from "react";
import { getAllProducts } from "@/firebase/firebaseUtils";

const Wishlist = () => {
  const { wishlistItems } = useCart();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts().then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

  const wishlistProducts = allProducts.filter((p) =>
    wishlistItems.includes(p.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
          Wishlist
        </h1>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Your wishlist is empty
            </h2>
            <p className="text-muted-foreground mb-8">
              Save items you love for later
            </p>
            <Link to="/new-arrivals">
              <Button size="lg">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : "/placeholder.png"
                }
                category={product.category}
                isNew={product.isNew}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
