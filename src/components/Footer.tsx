import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoFull from "@/assets/logo-full.jpg";

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img src={logoFull} alt="28th Hide Luxe" className="h-50 mb-6" />

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-foreground">
                    Lagos: 51, Omoirne Johnson Street opposite Scoilish Mall,
                    Lekki Phase 1, Lagos.
                  </p>
                  <p className="text-foreground mt-2">
                    Abuja: 5 Kandi Close, Hotel De Horizon, Wuse 2 Abuja
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:info@28thhideluxe.com"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  info@28thhideluxe.com
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href="tel:+2349012345678"
                  className="text-foreground hover:text-accent transition-colors"
                >
                  +234 901 234 5678
                </a>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-accent hover:underline text-sm mt-2"
              >
                Get direction <ExternalLink className="h-3 w-3" />
              </a>
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

          {/* About us */}
          <div>
            <h3 className="font-playfair text-base font-semibold mb-4 text-foreground">
              About us
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
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your Email Address"
                className="flex-1"
              />
              <Button className="bg-gold hover:bg-gold/90 text-white px-6">
                Subscribe
              </Button>
            </div>

            <div className="flex gap-2 mt-4 text-xs text-muted-foreground">
              <button className="hover:text-foreground transition-colors">
                Naira
              </button>
              <span>•</span>
              <button className="hover:text-foreground transition-colors">
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
