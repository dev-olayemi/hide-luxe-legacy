import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What makes your leather products special?",
      answer: "Our leather goods are handcrafted using premium full-grain leather sourced from the finest tanneries. Each piece undergoes meticulous quality control and is crafted by skilled artisans with decades of experience."
    },
    {
      question: "How long does shipping take?",
      answer: "Domestic shipping typically takes 3-5 business days. International orders may take 7-14 business days depending on the destination. All orders are shipped with tracking information."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn, unused items in their original condition. Custom or bespoke items are non-refundable. Please refer to our Exchange/Return Policy page for complete details."
    },
    {
      question: "Do you offer custom/bespoke services?",
      answer: "Yes! We specialize in bespoke leather goods. Visit our Bespoke page to submit your custom request, and our team will work with you to create a unique piece tailored to your specifications."
    },
    {
      question: "How do I care for my leather products?",
      answer: "Keep leather away from direct sunlight and moisture. Clean with a soft, dry cloth regularly. Use leather conditioner every 3-6 months. Avoid harsh chemicals and store in a cool, dry place when not in use."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All transactions are secured with SSL encryption."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship worldwide. International shipping costs and delivery times vary by location. Please check our shipping calculator at checkout for specific rates."
    },
    {
      question: "Can I track my order?",
      answer: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account dashboard."
    },
    {
      question: "What if my item arrives damaged?",
      answer: "We take great care in packaging, but if your item arrives damaged, please contact us within 48 hours with photos. We'll arrange a replacement or full refund immediately."
    },
    {
      question: "Do you offer warranty on your products?",
      answer: "Yes, all our products come with a 1-year warranty against manufacturing defects. This covers stitching, hardware, and material issues under normal use conditions."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 text-center">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-center mb-12 text-lg">
            Find answers to common questions about our products and services
          </p>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold hover:text-accent">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-lg">
            <h2 className="font-playfair text-2xl font-bold mb-4">
              Still have questions?
            </h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help! Reach out anytime.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold hover:bg-primary/90 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
