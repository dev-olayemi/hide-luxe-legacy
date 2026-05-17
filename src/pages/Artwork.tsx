/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCurrency } from "@/contexts/CurrencyContext";
import { ShoppingBag, Loader2 } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

const Artwork = () => {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        const items = snap.docs
          .map((d) => ({ id: d.id, ...d.data() as any }))
          .filter((p) => p.type === "art");
        items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setArtworks(items);
      } catch (e) {
        console.error("Failed to load artworks", e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-black text-white py-20 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "url('/art-banner/art1.jpeg')", backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-yellow-400 text-xs font-bold tracking-[3px] uppercase mb-4">28TH HIDE LUXE</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
              Original Artwork
            </h1>
            <p className="text-gray-300 text-lg">
              Curated original works — each piece tells a story, holds value, and transforms any space.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No artworks available yet. Check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artworks.map((art) => {
                  const img = art.image || art.images?.[0] || art.thumbnail;
                  const finalPrice = art.discount ? art.price * (1 - art.discount / 100) : art.price;
                  return (
                    <Link
                      key={art.id}
                      to={`/product/${art.id}`}
                      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                        {img ? (
                          <OptimizedImage
                            src={img}
                            alt={art.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                        {art.isLimited && (
                          <span className="absolute top-3 left-3 px-3 py-1 bg-black text-yellow-400 text-xs font-bold rounded-full">
                            LIMITED
                          </span>
                        )}
                        {art.discount > 0 && (
                          <span className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                            -{art.discount}%
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2 group-hover:text-gray-700">
                          {art.name}
                        </h3>
                        {art.inspiration && (
                          <p className="text-xs text-gray-500 italic mb-2 line-clamp-1">
                            "{art.inspiration}"
                          </p>
                        )}
                        {art.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {art.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{formatPrice(finalPrice)}</span>
                          {art.discount > 0 && (
                            <span className="text-sm text-gray-400 line-through">{formatPrice(art.price)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Artwork;
