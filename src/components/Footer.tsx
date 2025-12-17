import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { toast } from "sonner";
import logoFull from "@/assets/logo-full-new.png";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "newsletterSubscriptions"), {
        email: email.toLowerCase(),
        subscribedAt: new Date(),
        status: "active",
      });
      toast.success("Successfully subscribed to our newsletter!");
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img src={logoFull} alt="28th Hide Luxe" className="h-50 mb-6" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:28hideluxe@gmail.com"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  28hideluxe@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:+2348144977227"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  +234 903 197 6895
                </a>
              </div>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-playfair text-base font-semibold mb-4 text-foreground">
              Help
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/faq"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  privacy policy
                </Link>
              </li>
              <li>
                <Link
                  to="/exchange-return-policy"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Exchange/Return Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Terms & conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-playfair text-base font-semibold mb-4 text-foreground">
              Info
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Order History
                </Link>
              </li>
              <li>
                <Link
                  to="/auth"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-playfair text-base font-semibold mb-4 text-foreground">
              Sign Up for Email
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign up to get first dibs on new arrivals, sales, exclusive
              content, events and more!
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="Your Email Address"
                  className="flex-1 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <Button 
                  type="submit"
                  className="bg-gold hover:bg-gold/90 text-white px-4 py-2 text-sm rounded-md transition-all whitespace-nowrap"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </form>

            <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
              <button className="hover:text-foreground transition-colors text-xs px-2 py-1 rounded">
                Naira
              </button>
              <span>•</span>
              <button className="hover:text-foreground transition-colors text-xs px-2 py-1 rounded">
                English
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            ©{new Date().getFullYear()} 28th Hide Luxe. All rights reserved.
          </p>

          <div className="flex gap-3 items-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
              alt="Visa"
              className="h-6"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
              alt="PayPal"
              className="h-6"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
              alt="Mastercard"
              className="h-6"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
              alt="American Express"
              className="h-5"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};
