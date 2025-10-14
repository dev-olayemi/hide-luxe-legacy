/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
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
import categorySpecialty from "@/assets/category-specialty.jpg";

const HERO_SLIDES = [
  { title: "Luxury Leather Footwear", subtitle: "Handcrafted Excellence", image: heroFootwear },
  { title: "Bespoke Leather Jackets", subtitle: "Tailored to Perfection", image: heroJackets },
  { title: "Premium Leather Accessories", subtitle: "Timeless Elegance", image: heroAccessories },
  { title: "Custom Leather Furniture", subtitle: "Artisan Craftsmanship", image: heroFurniture },
  { title: "Luxury Automotive Interiors", subtitle: "Drive in Style", image: heroAutomotive },
  { title: "Exclusive Leather Bags", subtitle: "Sophisticated Design", image: heroAccessories },
  { title: "Handmade Leather Belts", subtitle: "Classic Refinement", image: heroAccessories },
  { title: "Artisan Leather Goods", subtitle: "Made to Last", image: heroFootwear },
  { title: "Designer Leather Apparel", subtitle: "Fashion Redefined", image: heroJackets },
  { title: "Specialty Leather Pieces", subtitle: "One of a Kind", image: heroAccessories },
];

const Index = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    getAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000); // Changed to 5 seconds for better viewing
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          <div className="absolute inset-0">
            {HERO_SLIDES.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-105"
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>

          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in">
                Luxury. Leather. Legacy.
              </h1>
              <div className="h-16 flex items-center mb-4 overflow-hidden">
                <p 
                  className="text-xl md:text-3xl font-semibold animate-fade-in"
                  key={`title-${currentSlide}`}
                  style={{ animationDuration: '800ms' }}
                >
                  {HERO_SLIDES[currentSlide].title}
                </p>
              </div>
              <p 
                className="text-lg md:text-xl mb-8 text-accent font-medium animate-fade-in" 
                key={`subtitle-${currentSlide}`}
                style={{ animationDuration: '800ms', animationDelay: '200ms' }}
              >
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
                <Link to="/new-arrivals">
                  <Button
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 hover:scale-105"
                  >
                    Shop New Arrivals
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-black hover:bg-yellow-700 hover:text-black transition-all duration-300 hover:scale-105"
                  >
                    Our Story
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our curated selection of premium leather footwear, crafted
              with precision and passion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              <div className="col-span-full text-center text-gray-400">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">
                No products found.
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

          <div className="text-center">
            <Link to="/new-arrivals">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
                Our Collections
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our extensive range of premium leather products across all categories
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/men"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={menLoafers}
                  alt="Men's Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Men's Collection
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Timeless sophistication for the modern gentleman
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link
                to="/women"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={womenBoots}
                  alt="Women's Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Women's Collection
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Elegance redefined for the contemporary woman
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link
                to="/accessories"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={categoryAccessories}
                  alt="Accessories Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Accessories
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Bags, wallets, belts, and watch straps
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link
                to="/apparel"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={categoryApparel}
                  alt="Apparel Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Apparel
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Jackets, pants, skirts, and gloves
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link
                to="/furniture"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={categoryFurniture}
                  alt="Furniture Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Furniture
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Sofas, chairs, and ottomans
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link
                to="/automotive"
                className="group relative h-80 overflow-hidden rounded-lg"
              >
                <img
                  src={categoryAutomotive}
                  alt="Automotive Collection"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-2xl font-bold mb-2">
                      Automotive
                    </h3>
                    <p className="text-white/90 mb-4 text-sm">
                      Car seats and steering wheels
                    </p>
                    <Button variant="secondary" size="sm">
                      Explore
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-8 md:p-12 text-center">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-4">
              Bespoke Leather Creations
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
              Custom-made leather products across all categories - footwear, apparel, 
              accessories, furniture, automotive, and specialty items. Create something 
              uniquely yours.
            </p>
            <Link to="/bespoke">
              <Button size="lg" variant="secondary">
                Start Your Custom Order
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
