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
  const { cartItems, wishlistItems } = useCart();
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-lg backdrop-saturate-180">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* responsive grid: left/menu | center/logo | right/actions */}
        <div className="grid grid-cols-3 items-center h-16 md:flex md:h-24 md:items-center md:justify-between">
          {/* left: mobile menu trigger + (desktop: nav hidden here) */}
          <div className="flex items-center gap-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <MobileSidebar onClose={() => setMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* desktop nav left align on md+ */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                to="/new-arrivals"
                className="text-base font-medium hover:text-accent transition-colors"
              >
                NEW ARRIVALS
              </Link>
              <Link
                to="/men"
                className="text-base font-medium hover:text-accent transition-colors"
              >
                MEN
              </Link>
              <Link
                to="/women"
                className="text-base font-medium hover:text-accent transition-colors"
              >
                WOMEN
              </Link>
              <Link
                to="/bespoke"
                className="text-base font-medium hover:text-accent transition-colors"
              >
                BESPOKE
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-base font-medium hover:text-accent transition-colors"
                >
                  DASHBOARD
                </Link>
              )}
            </nav>
          </div>

          {/* center: logo (centered on mobile, left on desktop due to grid->flex behavior) */}
          <div className="flex justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo}
                alt="28th Hide Luxe"
                className="h-10 w-10 sm:h-12 sm:w-12 md:h-20 md:w-20 rounded-full object-cover"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-playfair text-sm md:text-base font-bold tracking-tight whitespace-nowrap">
                  28TH HIDE LUXE
                </span>
                <span className="text-[10px] sm:text-xs md:text-sm tracking-widest text-muted-foreground whitespace-nowrap">
                  LUXURY. LEATHER. LEGACY.
                </span>
              </div>
            </Link>
          </div>

          {/* right: actions */}
          <div className="flex items-center justify-end gap-2 md:gap-4">
            {/* currency selector - hidden on small screens */}
            <div className="hidden md:block">
              <Select
                value={currency}
                onValueChange={(value: "NGN" | "USD") => setCurrency(value)}
              >
                <SelectTrigger className="w-28 font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">₦ NGN</SelectItem>
                  <SelectItem value="USD">$ USD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* wishlist - show small icon on mobile, badge remains */}
            <Link to="/wishlist" className="relative hidden md:inline-block">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-accent text-accent-foreground text-[10px]">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* user / sign in */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 h-9 px-2 md:h-10 md:px-3"
                  >
                    <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-accent-foreground font-bold text-sm">
                      {getInitials(user.email)}
                    </div>
                    <span className="hidden lg:inline-block font-medium max-w-[100px] truncate text-sm">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">My Account</p>
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
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
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
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

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
            <Link
              to="/men"
              className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              MEN
            </Link>
            <Link
              to="/women"
              className="block py-3 text-base font-medium hover:text-accent transition-colors border-b"
              onClick={onClose}
            >
              WOMEN
            </Link>
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
