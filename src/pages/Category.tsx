/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { getAllProducts } from "@/firebase/firebaseUtils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryDisplayName, setCategoryDisplayName] = useState<string>(
    ""
  );

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      try {
        // Attempt to resolve category name from categories collection by slug
        let resolvedName = "";
        if (categoryName) {
          const docRef = doc(db, "categories", categoryName);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as any;
            resolvedName = data.name || "";
          } else {
            // Fallback: convert slug to display name
            resolvedName = categoryName
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
          }
        }

        setCategoryDisplayName(resolvedName);

        const allProducts = await getAllProducts();
        const filtered = allProducts.filter(
          (p: any) => p.category?.toLowerCase() === resolvedName.toLowerCase()
        );
        setProducts(filtered);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryAndProducts();
  }, [categoryName]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
            {categoryDisplayName || "Category"} Collection
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our premium {categoryDisplayName.toLowerCase()} leather products
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No products found in this category.
                </p>
              </div>
            ) : (
              products.map((product) => (
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
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Category;
