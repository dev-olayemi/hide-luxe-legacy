import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ExchangeReturnPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
            Exchange & Return Policy
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">30-Day Return Policy</h2>
            <p className="text-muted-foreground mb-4">
              We want you to be completely satisfied with your purchase. If you're not happy with your item, you may return it within 30 days of delivery for a full refund or exchange.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Return Conditions</h2>
            <p className="text-muted-foreground mb-4">To be eligible for a return, your item must:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Be unused and in the same condition as received</li>
              <li>Have all original tags and packaging intact</li>
              <li>Include proof of purchase (receipt or order confirmation)</li>
              <li>Be returned within 30 days of delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Non-Returnable Items</h2>
            <p className="text-muted-foreground mb-4">The following items cannot be returned:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Custom or bespoke items made to your specifications</li>
              <li>Sale or clearance items marked as "Final Sale"</li>
              <li>Items showing signs of wear or damage</li>
              <li>Products without original packaging or tags</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">How to Initiate a Return</h2>
            <ol className="list-decimal pl-6 text-muted-foreground space-y-2">
              <li>Contact our customer service at info@28thhideluxe.com or +234 901 234 5678</li>
              <li>Provide your order number and reason for return</li>
              <li>Receive your Return Authorization (RA) number and return shipping label</li>
              <li>Securely package the item with all original materials</li>
              <li>Ship the package using the provided label</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Refund Process</h2>
            <p className="text-muted-foreground mb-4">
              Once we receive and inspect your return:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We'll send you an email confirming receipt</li>
              <li>Refunds are processed within 5-7 business days</li>
              <li>The refund will be issued to your original payment method</li>
              <li>It may take additional time for your bank to process the refund</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Exchanges</h2>
            <p className="text-muted-foreground mb-4">
              If you need a different size, color, or style, we're happy to facilitate an exchange. Follow the same return process and place a new order for your desired item. We'll prioritize shipping your exchange once we receive your return.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Shipping Costs</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>We cover return shipping costs for defective or incorrect items</li>
              <li>Customer is responsible for return shipping on buyer's remorse returns</li>
              <li>Original shipping charges are non-refundable</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Damaged or Defective Items</h2>
            <p className="text-muted-foreground mb-4">
              If your item arrives damaged or defective, please contact us within 48 hours with photos. We'll arrange for a replacement or full refund, including return shipping costs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-4">
              For any questions regarding returns or exchanges, please contact:
            </p>
            <p className="text-muted-foreground">
              Email: info@28thhideluxe.com<br />
              Phone: +234 901 234 5678<br />
              Hours: Monday-Friday, 9:00 AM - 6:00 PM WAT
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ExchangeReturnPolicy;
