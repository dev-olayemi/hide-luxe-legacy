/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string;
  isNew?: boolean;
  discount?: number;
  originalPrice?: number;
}

interface NewArrivalsShowcaseProps {
  category?: string;
}

export const NewArrivalsShowcase: React.FC<NewArrivalsShowcaseProps> = ({ category }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let q;
        if (category) {
          // Fetch products from specific category
          q = query(
            collection(db, 'products'),
            where('category', '==', category),
            orderBy('createdAt', 'desc'),
            limit(12)
          );
        } else {
          // Fetch new arrivals if no category
          q = query(
            collection(db, 'products'),
            where('isNew', '==', true),
            orderBy('createdAt', 'desc'),
            limit(4)
          );
        }
        
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        } as Product));
        
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback: try without ordering if first fails
        try {
          let fallbackQ;
          if (category) {
            fallbackQ = query(
              collection(db, 'products'),
              where('category', '==', category),
              limit(12)
            );
          } else {
            fallbackQ = query(
              collection(db, 'products'),
              orderBy('createdAt', 'desc'),
              limit(4)
            );
          }
          const snapshot = await getDocs(fallbackQ);
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as any)
          } as Product));
          setProducts(productsData);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) {
    return (
      <section className="relative py-20 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-gradient-to-r from-amber-500/30 to-amber-500/10 rounded-full mx-auto mb-6 animate-pulse" />
            <div className="h-16 w-3/4 bg-gradient-to-r from-white/10 to-white/5 rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'moveGrid 8s linear infinite',
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Reveal Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-sm font-semibold text-amber-300">EXCLUSIVE REVEAL</span>
          </div>

          {/* Main Title with Gradient */}
          <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
              {category ? `${category} Collection` : "Discover What's New"}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 font-light">
            {category 
              ? `Hand-selected leather pieces from our ${category} collection.`
              : 'Unveil our latest collection of meticulously crafted leather treasures, hand-selected for the discerning few.'}
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-100 mb-4">
              {category ? 'Coming Soon' : 'No new arrivals yet'}
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              {category 
                ? `We are curating exceptional pieces for the ${category} collection. Check back soon.`
                : 'Stay tuned for our latest drops!'}
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
                  Browse Collections
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              {!category && (
                <Link to="/new-arrivals">
                  <Button variant="outline" className="text-amber-300 border-amber-500/20">
                    See What's New
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="group"
                style={{
                  animation: `slideUp 0.4s ease-out ${index * 0.05}s backwards`,
                }}
                onMouseEnter={() => setHoveredId(product.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-amber-500/10 rounded-xl blur opacity-0 transition-opacity duration-200 pointer-events-none ${hoveredId === product.id ? 'opacity-100' : ''}`} />
                
                <div className="relative z-10">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={
                      Array.isArray(product.images) && product.images.length > 0
                        ? product.images[0]
                        : product.image || '/placeholder.png'
                    }
                    category={product.category}
                    isNew={product.isNew}
                    discount={product.discount}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        {products.length > 0 && (
          <div className="text-center animate-fade-in">
            <Link to="/new-arrivals">
              <Button 
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-12 py-6 rounded-lg shadow-2xl hover:shadow-amber-500/50 transition-all hover:scale-105"
              >
                Explore All New Arrivals
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes moveGrid {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};
