/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { NewArrivalsShowcase } from "@/components/NewArrivalsShowcase";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// slug helper - keep in sync with Header.tsx
const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

const CategoryShowcase = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [resolvedCategory, setResolvedCategory] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    const resolve = async () => {
      setResolving(true);
      try {
        const decoded = categoryName ? decodeURIComponent(categoryName) : "";

        // fetch categories and try to match by slug or exact name
        const snap = await getDocs(collection(db, "categories"));
        const docs = snap.docs.map((d) => ({ id: d.id, name: (d.data() as any).name }));

        const match = docs.find((c) => slugify(c.name) === decoded || c.name === decoded);

        if (match) {
          setResolvedCategory(match.name);
        } else if (decoded) {
          // fallback: use decoded param as best-effort category name
          setResolvedCategory(decoded);
        } else {
          setResolvedCategory(null);
        }
      } catch (error) {
        console.error("Failed to resolve category slug:", error);
        const decoded = categoryName ? decodeURIComponent(categoryName) : "";
        setResolvedCategory(decoded || null);
      } finally {
        setResolving(false);
      }
    };

    resolve();
  }, [categoryName]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${resolvedCategory || categoryName || "Category"} - 28th Hide Luxe`}
        description={`Explore our exclusive ${resolvedCategory || categoryName || "category"} collection of premium leather products.`}
        url={`https://www.28hideluxe.com/category-showcase/${categoryName}`}
      />
      <Header />

      <main className="flex-1">
        {/* show loading state while resolving slug */}
        {resolving ? (
          <div className="container mx-auto px-4 py-24 text-center">
            <h2 className="text-2xl font-semibold">Loading category…</h2>
          </div>
        ) : (
          <NewArrivalsShowcase category={resolvedCategory ?? undefined} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryShowcase;
