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
              <li>
                <Link
                  to="/artwork"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  Artwork
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
              src="data:image/png;base64,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"
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
