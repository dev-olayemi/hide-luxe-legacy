import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8">
            Terms & Conditions
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing and using 28th Hide Luxe's website and services, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">2. Use of Website</h2>
            <p className="text-muted-foreground mb-4">You agree to use our website only for lawful purposes and in a way that does not:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Infringe upon the rights of others</li>
              <li>Restrict or inhibit anyone's use of the website</li>
              <li>Engage in any fraudulent activity</li>
              <li>Transmit harmful code or malware</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">3. Product Information</h2>
            <p className="text-muted-foreground mb-4">
              We strive to provide accurate product descriptions and images. However, we do not warrant that product descriptions, colors, or other content is accurate, complete, or error-free. Colors may vary slightly due to screen settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">4. Pricing and Payment</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All prices are listed in Nigerian Naira (₦) unless otherwise stated</li>
              <li>Prices are subject to change without notice</li>
              <li>We reserve the right to refuse or cancel orders at our discretion</li>
              <li>Payment must be received before order fulfillment</li>
              <li>We accept major credit cards, PayPal, and bank transfers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">5. Order Acceptance</h2>
            <p className="text-muted-foreground mb-4">
              Receipt of an order confirmation does not constitute acceptance of your order. We reserve the right to refuse orders for any reason, including but not limited to product availability, errors in pricing or product information, or suspected fraudulent activity.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">6. Shipping and Delivery</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Shipping times are estimates and not guaranteed</li>
              <li>Risk of loss passes to you upon delivery</li>
              <li>We are not responsible for delays caused by shipping carriers</li>
              <li>International customers are responsible for customs duties and taxes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content on this website, including text, graphics, logos, images, and software, is the property of 28th Hide Luxe and protected by copyright and trademark laws. You may not reproduce, distribute, or create derivative works without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">8. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              If you create an account:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You are responsible for maintaining account confidentiality</li>
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for all activities under your account</li>
              <li>We may suspend or terminate accounts that violate these terms</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              To the fullest extent permitted by law, 28th Hide Luxe shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">10. Warranty Disclaimer</h2>
            <p className="text-muted-foreground mb-4">
              Our products are provided "as is" without warranties of any kind. We offer a 1-year warranty against manufacturing defects under normal use conditions, but do not warrant that products will meet your specific requirements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">11. Governing Law</h2>
            <p className="text-muted-foreground mb-4">
              These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos, Nigeria.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">12. Changes to Terms</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-playfair text-2xl font-bold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms and Conditions, please contact:
            </p>
            <p className="text-muted-foreground">
              28th Hide Luxe<br />
              Email: info@28thhideluxe.com<br />
              Phone: +234 901 234 5678
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
