/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { SearchDialog } from "@/components/SearchDialog";
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo-icon.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebaseUtils";

// Helper for avatar initials
const getInitials = (email?: string) => {
  if (!email) return "U";
  return email[0].toUpperCase();
};

export const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const { cartItems, wishlistItems } = useCart();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // build nav items dynamically (keep labels uppercase)
  const navItems = [
    { to: "/new-arrivals", label: "NEW ARRIVALS" },
    // categories appended below
    ...categories.map((c) => ({
      to: `/category/${c.name.toLowerCase().replace(/\s+/g, "-")}`,
      label: c.name.toUpperCase(),
      id: c.id,
    })),
    { to: "/bespoke", label: "BESPOKE" },
  ];

  // show first N items and collapse the rest into a "More" dropdown
  const MAX_VISIBLE = 4;
  const visibleNav = navItems.slice(0, MAX_VISIBLE);
  const overflowNav = navItems.slice(MAX_VISIBLE);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-xl backdrop-saturate-200 shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="28th Hide Luxe"
              className="h-14 w-14 rounded-full object-fill ring-accent/20 group-hover:ring-accent/40 transition-all"
            />
            <div className="hidden md:flex flex-col leading-tight">
              <span className="font-playfair text-base md:text-lg lg:text-xl font-bold tracking-tight leading-[1]">
                <span className="inline-block num-fix">28TH</span>{" "}
                <span className="inline-block">HIDE LUXE</span>
              </span>
              <span className="text-[10px] md:text-xs tracking-widest text-muted-foreground uppercase mt-0.5">
                Luxury. Leather. Legacy.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Center (with overflow menu) */}
          <nav className="hidden lg:flex items-center gap-4">
            {visibleNav.map((item) => (
              <Link
                key={(item as any).id ?? item.to}
                to={item.to}
                className="text-sm font-semibold px-2 py-1 rounded hover:text-accent transition-colors"
              >
                {item.label}
              </Link>
            ))}

            {overflowNav.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded hover:bg-gray-50">
                    More
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>More</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {overflowNav.map((item) => (
                    <DropdownMenuItem key={(item as any).id ?? item.to} asChild>
                      <Link to={item.to} className="w-full block">
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Actions - Right */}
          <div className="flex items-center gap-3">
            {/* Currency Selector */}
            <Select
              value={currency}
              onValueChange={(value: "NGN" | "USD") => setCurrency(value)}
            >
              <SelectTrigger className="w-24 h-9 hidden md:flex font-semibold border-accent/30 hover:border-accent transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">₦ NGN</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((s) => !s)}
              className="hover:bg-accent/10"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative hidden md:inline-block">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent/10"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs font-bold">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs font-bold">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-10 px-3 hover:bg-accent/10"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-accent via-accent/80 to-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {getInitials(user.email)}
                    </div>
                    <span className="hidden xl:inline-block font-semibold max-w-[120px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden xl:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-semibold">My Account</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard")}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/auth");
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="font-semibold">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden hover:bg-accent/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* mobile search appears full width below header */}
        {searchOpen && (
          <div className="pb-3 md:pb-4">
            <SearchDialog
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>
        )}
      </div>
    </header>
  );
};

const MobileSidebar = ({ onClose }: { onClose: () => void }) => {
  const { cartItems, wishlistItems } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats = snap.docs.map((d) => ({ id: d.id, name: d.data().name }));
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Select defaultValue="NGN">
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NGN">NGN</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div className="border-b p-4">
        <SearchDialog
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <h2 className="font-playfair text-lg font-bold tracking-wide mb-6">
            28TH HIDE LUXE
          </h2>

          <nav className="space-y-2">
            <Link
              to="/new-arrivals"
              className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              NEW ARRIVALS
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
                onClick={onClose}
              >
                {cat.name.toUpperCase()}
              </Link>
            ))}
            <Link
              to="/bespoke"
              className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              BESPOKE
            </Link>
            {user && (
              <Link
                to="/dashboard"
                className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
                onClick={onClose}
              >
                DASHBOARD
              </Link>
            )}
          </nav>
        </div>
      </div>

      <div className="border-t p-6 space-y-3">
        <Link to="/cart" onClick={onClose}>
          <Button variant="outline" className="w-full justify-start gap-3">
            <ShoppingCart className="h-5 w-5" />
            SHOPPING CART
            {cartCount > 0 && <Badge className="ml-auto">{cartCount}</Badge>}
          </Button>
        </Link>
        <Link to="/wishlist" onClick={onClose}>
          <Button variant="outline" className="w-full justify-start gap-3">
            <Heart className="h-5 w-5" />
            WISHLIST
            {wishlistCount > 0 && (
              <Badge className="ml-auto">{wishlistCount}</Badge>
            )}
          </Button>
        </Link>
        {user ? (
          <Link to="/dashboard" onClick={onClose}>
            <Button variant="outline" className="w-full justify-start gap-3">
              <User className="h-5 w-5" />
              DASHBOARD
            </Button>
          </Link>
        ) : (
          <Link to="/auth" onClick={onClose}>
            <Button variant="outline" className="w-full justify-start gap-3">
              <User className="h-5 w-5" />
              LOGIN
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
