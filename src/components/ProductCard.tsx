import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import OptimizedImage from "./OptimizedImage";

interface ColorOption {
  label: string;
  value: string;
  hex?: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discount?: number;
  image: string;
  category?: string;
  isNew?: boolean;
  sizes?: string[];
  colors?: ColorOption[];
  availableCount?: number | null;
  isAvailable?: boolean;
  availabilityReason?: string;
}

export const ProductCard = ({
  id,
  name,
  price,
  discount,
  image,
  category,
  isNew,
  sizes = [],
  colors = [],
  availableCount = null,
  isAvailable = true,
  availabilityReason,
}: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(id);

  // Calculate discounted price
  const discountedPrice = discount ? price - (price * discount) / 100 : price;
  const savings = discount ? price - discountedPrice : 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!isAvailable) {
      toast({
        title: "Product not available",
        description: availabilityReason || "This product is currently not available for purchase.",
        variant: "destructive",
      });
      return;
    }
    try {
      // addToCart expects the item object without `quantity` (CartContext handles quantities)
      addToCart({
        id,
        name,
        price: discountedPrice,
        image,
        category: category || "",
      });
      toast({
        title: "Added to cart",
        description: `${name} added to cart.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not add to cart",
        variant: "destructive",
      });
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id);
    toast({
      title: inWishlist ? "Removed from wishlist" : "Added to wishlist",
      description: inWishlist
        ? `${name} removed.`
        : `${name} added to wishlist.`,
    });
  };

  return (
    <Card className="relative overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Image area - responsive height */}
      <div className="relative bg-white flex items-center justify-center border-b px-3 sm:px-4 py-3 sm:py-4 h-40 sm:h-56">
        <Link
          to={`/product/${id}`}
          className="block w-full h-full flex items-center justify-center"
        >
          <OptimizedImage
            src={image}
            alt={name}
            className="max-h-full max-w-full object-contain"
            width={560}
            height={560}
          />
        </Link>

        {/* wishlist button (visible) */}
        <button
          onClick={handleToggleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-3 top-3 z-20 rounded-full bg-white/95 p-2 shadow hover:bg-white"
        >
          <Heart
            className={cn("h-4 w-4", inWishlist && "fill-accent text-accent")}
          />
        </button>

        {isNew && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground font-semibold">
            NEW
          </Badge>
        )}

        {discount && (
          <Badge className="absolute left-3 top-10 bg-red-500 text-white font-semibold">
            {discount}% OFF
          </Badge>
        )}
      </div>

      <CardContent className="p-3 sm:p-4">
        <Link to={`/product/${id}`}>
          <h3 className="text-xs sm:text-sm font-semibold mb-1 line-clamp-2 text-neutral-900">
            {name}
          </h3>
        </Link>

        {category && (
          <p className="text-xs text-muted-foreground mb-3 capitalize">
            {category}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <div className="text-base sm:text-lg font-bold text-neutral-900">
                {formatPrice(discountedPrice)}
              </div>
              {discount && (
                <div className="text-xs line-through text-muted-foreground">
                  {formatPrice(price)}
                </div>
              )}
            </div>
            {discount && savings > 0 && (
              <div className="text-xs text-emerald-700 font-medium mt-1">
                Save {formatPrice(savings)} ({discount}% off)
              </div>
            )}
          </div>
          {colors.length > 0 && (
            <div className="text-xs text-muted-foreground">
              {colors.length} colors
            </div>
          )}
        </div>

        {/* Show unavailability reason when product is not available */}
        {!isAvailable && availabilityReason && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-3 line-clamp-2">
            {availabilityReason}
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          {colors.slice(0, 3).map((c) => (
            <div key={c.value} className="flex flex-col items-center gap-1">
              <span
                className="w-6 h-6 rounded-full border"
                style={{ backgroundColor: c.hex || undefined }}
                title={c.label}
              />
            </div>
          ))}
          {colors.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{colors.length - 3}
            </span>
          )}
          {sizes.length > 0 && (
            <span className="text-xs text-muted-foreground ml-auto">
              {sizes.length} sizes
            </span>
          )}
        </div>

        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
          <Button 
            onClick={handleAddToCart} 
            className="flex-1 min-w-0 text-xs sm:text-sm px-2 sm:px-4"
            disabled={!isAvailable}
            variant={isAvailable ? "default" : "secondary"}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
            <span className="truncate">{isAvailable ? "Add" : "Unavailable"}</span>
          </Button>

          <Link to={`/product/${id}`} className="w-16 sm:w-24 flex-shrink-0">
            <Button variant="outline" className="w-full text-xs sm:text-sm px-2 sm:px-4">
              View
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Contact seller"
            onClick={(e) => {
              e.preventDefault();
              const WHATSAPP_NUMBER = "+2349031976895";
              const phone = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
              const productLink = `${window.location.origin}/product/${id}`;
              const msg = `Hello, I need information about this product:\n\nProduct: ${name}\nCategory: ${category || ''}\nPrice: ₦${price.toLocaleString()}\nLink: ${productLink}`;
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
              window.open(url, "_blank");
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Button>

          {/* PalmPay button intentionally removed from product cards; PalmPay flow is available from Cart page */}
        </div>
      </CardContent>
    </Card>
  );
};
