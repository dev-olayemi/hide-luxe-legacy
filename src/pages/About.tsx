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

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              At 28TH Hide Luxe, we believe true luxury is not defined by trends, but by intention, craftsmanship, and time.
            </p>

            <p>
              Founded as a modern luxury leather house, 28TH Hide Luxe creates finely crafted leather goods that balance form, function, and heritage. From footwear and accessories to lifestyle essentials, every piece is designed with the same uncompromising standards — refined materials, disciplined design, and enduring quality.
            </p>

            <p>
              Our work begins with leather. We source premium hides selected for their texture, strength, and character, then transform them through meticulous craftsmanship into products meant to age beautifully and serve purposefully. Each creation is built not for the moment, but for the years ahead.
            </p>

            <div className="border-t border-b border-muted py-6 my-8">
              <h2 className="font-playfair text-2xl font-bold mb-6 text-foreground">
                Our Philosophy
              </h2>

              <p className="mb-4">
                Luxury. Leather. Legacy.<br/>
                These are not just words — they are the foundation of everything we make.
              </p>

              <p>
                Luxury, to us, is restraint and refinement.<br/>
                Leather is our medium — timeless, expressive, and honest.<br/>
                Legacy is our ambition — to create pieces worthy of being kept, worn, and passed on.
              </p>

              <p className="mt-6">
                We are not driven by mass production or fast cycles. Instead, we focus on thoughtful design, limited production, and attention to detail that speaks quietly but confidently.
              </p>
            </div>

            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4 text-foreground">
              Craftsmanship & Design
            </h2>

            <p>
              Every 28TH Hide Luxe piece reflects hours of skilled workmanship and careful finishing. From precise stitching to balanced proportions and subtle branding, we prioritize quality that can be felt, not shouted.
            </p>

            <p>
              Our designs are intentional — modern yet timeless, functional yet elevated — created for individuals who value substance as much as style.
            </p>

            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4 text-foreground">
              The 28TH Standard
            </h2>

            <p>
              28TH Hide Luxe represents more than products; it represents a standard.<br/>
              A standard of excellence.<br/>
              A standard of durability.<br/>
              A standard of quiet confidence.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
