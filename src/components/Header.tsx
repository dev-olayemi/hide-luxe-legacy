import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchDialog } from "@/components/SearchDialog";
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  X,
  LogOut,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
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
  const { cartItems, wishlistItems } = useCart();
  const { user } = useAuth();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="28th Hide Luxe"
              className="h-14 w-14 rounded-full"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            {user ? (
              <div className="relative group">
                <button className="rounded-full bg-accent flex items-center justify-center h-9 w-9 text-lg font-bold text-white">
                  {getInitials(user.email)}
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="mb-2 text-xs text-gray-700">{user.email}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex gap-2 items-center"
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/auth");
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex md:h-20 md:items-center md:justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="28th Hide Luxe"
                className="h-16 w-16 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-playfair text-xl font-bold tracking-tight">
                  28TH HIDE LUXE
                </span>
                <span className="text-xs tracking-widest text-muted-foreground">
                  LUXURY. LEATHER. LEGACY.
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6">
              <Link
                to="/new-arrivals"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                NEW ARRIVALS
              </Link>
              <Link
                to="/men"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                MEN
              </Link>
              <Link
                to="/women"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                WOMEN
              </Link>
              <Link
                to="/bespoke"
                className="text-sm font-medium hover:text-accent transition-colors"
              >
                BESPOKE
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium hover:text-accent transition-colors"
                >
                  DASHBOARD
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Select defaultValue="NGN">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>

            <div className="w-64">
              <SearchDialog searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            </div>

            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative group">
                <button className="rounded-full bg-accent flex items-center justify-center h-10 w-10 text-lg font-bold text-white">
                  {getInitials(user.email)}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-3 opacity-0 group-hover:opacity-100 transition pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="mb-2 text-xs text-gray-700 font-semibold">
                    {user.email}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full flex gap-2 items-center"
                    onClick={async () => {
                      await signOut(auth);
                      navigate("/auth");
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </Button>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        {searchOpen && (
          <div className="pb-4 md:hidden">
            <SearchDialog searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <Select defaultValue="NGN">
            <SelectTrigger className="w-24">
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
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="border-b p-4">
        <SearchDialog searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="font-playfair text-sm font-bold tracking-wide mb-4">
            28TH HIDE LUXE
          </h2>

          <nav className="space-y-1">
            <Link
              to="/new-arrivals"
              className="block py-3 text-sm font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              NEW ARRIVALS
            </Link>
            <Link
              to="/men"
              className="block py-3 text-sm font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              MEN
            </Link>
            <Link
              to="/women"
              className="block py-3 text-sm font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              WOMEN
            </Link>
            <Link
              to="/bespoke"
              className="block py-3 text-sm font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              BESPOKE
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t p-4 space-y-2">
        <Link to="/cart" onClick={onClose}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <ShoppingCart className="h-4 w-4" />
            SHOPPING CART
            {cartCount > 0 && <Badge className="ml-auto">{cartCount}</Badge>}
          </Button>
        </Link>
        <Link to="/wishlist" onClick={onClose}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <Heart className="h-4 w-4" />
            WISHLIST
            {wishlistCount > 0 && (
              <Badge className="ml-auto">{wishlistCount}</Badge>
            )}
          </Button>
        </Link>
        {user ? (
          <Link to="/dashboard" onClick={onClose}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" />
              DASHBOARD
            </Button>
          </Link>
        ) : (
          <Link to="/auth" onClick={onClose}>
            <Button variant="outline" className="w-full justify-start gap-2">
              <User className="h-4 w-4" />
              LOGIN
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
