import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
            About 28th Hide Luxe
          </h1>

          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              At 28th Hide Luxe, we believe that true luxury lies in the details. 
              Our journey began with a simple yet profound vision: to create leather 
              footwear that embodies timeless elegance, exceptional craftsmanship, 
              and unparalleled quality.
            </p>

            <p>
              Each piece in our collection is meticulously handcrafted by skilled 
              artisans who bring decades of experience to their craft. We source 
              only the finest leather, ensuring that every shoe, boot, and accessory 
              meets our exacting standards.
            </p>

            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4 text-foreground">
              Our Philosophy
            </h2>

            <p>
              Luxury. Leather. Legacy. These three words capture the essence of 
              what we stand for. We're not just creating footwear; we're building 
              a legacy of excellence that will be cherished for generations.
            </p>

            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4 text-foreground">
              Craftsmanship Excellence
            </h2>

            <p>
              Every pair of shoes from 28th Hide Luxe represents hours of dedicated 
              craftsmanship. From the initial design sketches to the final polish, 
              we oversee each step to ensure perfection. Our artisans blend 
              traditional techniques with modern innovation to create pieces that 
              are both classic and contemporary.
            </p>

            <p>
              We invite you to experience the difference that true craftsmanship 
              makes. Welcome to the 28th Hide Luxe family.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
