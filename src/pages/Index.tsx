import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";
import heroImage from "@/assets/hero-leather-craft.jpg";
import menLoafers from "@/assets/products/men-loafers-brown.jpg";
import womenBoots from "@/assets/products/women-boots-black.jpg";

const Index = () => {

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] md:h-[80vh] overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Luxury Leather Craftsmanship" 
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
          </div>
          
          <div className="relative h-full container mx-auto px-4 flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
                Luxury. Leather. Legacy.
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">
                Discover handcrafted leather footwear that defines sophistication. 
                Every piece tells a story of timeless elegance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/new-arrivals">
                  <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Shop New Arrivals
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
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
              Explore our curated selection of premium leather footwear, crafted with precision and passion.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link to="/men" className="group relative h-80 overflow-hidden rounded-lg">
                <img 
                  src={menLoafers} 
                  alt="Men's Collection" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-3xl font-bold mb-2">Men's Collection</h3>
                    <p className="text-white/90 mb-4">Timeless sophistication for the modern gentleman</p>
                    <Button variant="secondary">
                      Shop Men's
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <Link to="/women" className="group relative h-80 overflow-hidden rounded-lg">
                <img 
                  src={womenBoots} 
                  alt="Women's Collection" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="font-playfair text-3xl font-bold mb-2">Women's Collection</h3>
                    <p className="text-white/90 mb-4">Elegance redefined for the contemporary woman</p>
                    <Button variant="secondary">
                      Shop Women's
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
              Coming soon: Custom-made leather footwear, belts, jackets, and exclusive limited editions. 
              Join our exclusive list for early access.
            </p>
            <Button size="lg" variant="secondary">
              Notify Me
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
