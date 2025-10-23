/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CookieConsent } from "@/components/CookieConsent";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/firebase/firebaseUtils";
import heroFootwear from "@/assets/hero-leather-craft.jpg";
import heroJackets from "@/assets/hero-jackets.jpg";
import heroAccessories from "@/assets/hero-accessories.jpg";
import heroFurniture from "@/assets/hero-furniture.jpg";
import heroAutomotive from "@/assets/hero-automotive.jpg";
import menLoafers from "@/assets/products/men-loafers-brown.jpg";
import womenBoots from "@/assets/products/women-boots-black.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import categoryApparel from "@/assets/category-apparel.jpg";
import categoryFurniture from "@/assets/category-furniture.jpg";
import categoryAutomotive from "@/assets/category-automotive.jpg";

const HERO_SLIDES = [
  { image: heroFootwear },
  { image: heroJackets },
  { image: heroAccessories },
  { image: heroFurniture },
  { image: heroAutomotive },
];

const Index = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    trackMouse: true,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Carousel */}
        <section className="relative h-screen overflow-hidden bg-background" {...swipeHandlers}>
          {/* Full-width background carousel */}
          <div className="absolute inset-0">
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={`Slide ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Centered minimal overlay like LV */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="text-center text-white">
              <p className="text-sm md:text-base tracking-[0.3em] mb-6 uppercase font-light">
                Premium Leather
              </p>
              <h1 className="font-playfair text-6xl md:text-8xl lg:text-9xl font-bold mb-8 tracking-tight">
                Hide & Luxe
              </h1>
              <Link
                to="/new-arrivals"
                className="inline-block text-sm md:text-base tracking-widest border-b-2 border-white pb-1 hover:pb-2 transition-all uppercase font-light"
              >
                Discover the collection
              </Link>
            </div>
          </div>

          {/* Minimal Dot Indicators */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 flex gap-3">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
              Featured Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our curated selection of premium leather goods, crafted with precision and passion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-20">
                No products found.
              </div>
            ) : (
              products.slice(0, 8).map((product) => (
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

          <div className="text-center">
            <Link to="/new-arrivals">
              <Button variant="outline" size="lg" className="group">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
                Our Collections
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Discover our extensive range of premium leather products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Link to="/men" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={menLoafers}
                  alt="Men's Collection"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Men's Collection</h3>
                    <p className="text-white/90 mb-6">Timeless sophistication</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/women" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={womenBoots}
                  alt="Women's Collection"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Women's Collection</h3>
                    <p className="text-white/90 mb-6">Elegance redefined</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/accessories" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={categoryAccessories}
                  alt="Accessories"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Accessories</h3>
                    <p className="text-white/90 mb-6">Complete your style</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/apparel" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={categoryApparel}
                  alt="Apparel"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Apparel</h3>
                    <p className="text-white/90 mb-6">Jackets & more</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/furniture" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={categoryFurniture}
                  alt="Furniture"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Furniture</h3>
                    <p className="text-white/90 mb-6">Luxury interiors</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/automotive" className="group relative h-96 overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                <img
                  src={categoryAutomotive}
                  alt="Automotive"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    <h3 className="font-playfair text-3xl font-bold mb-3">Automotive</h3>
                    <p className="text-white/90 mb-6">Drive in luxury</p>
                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Bespoke CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center shadow-2xl border border-border">
            <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
              Bespoke Leather Creations
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              Custom-made leather products tailored to your exact specifications. 
              Create something uniquely yours with our master craftsmen.
            </p>
            <Link to="/bespoke">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary shadow-lg hover:shadow-xl transition-all">
                Start Your Custom Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Index;
