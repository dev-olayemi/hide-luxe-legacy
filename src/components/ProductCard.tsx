import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

interface ColorOption {
  label: string;
  value: string;
  hex?: string;
}

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  isNew?: boolean;
  sizes?: string[];
  colors?: ColorOption[];
  availableCount?: number | null;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  isNew,
  sizes = [],
  colors = [],
  availableCount = null,
}: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    try {
      // addToCart expects the item object without `quantity` (CartContext handles quantities)
      addToCart({
        id,
        name,
        price,
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
      {/* Image area - fixed height, no zoom */}
      <div className="relative bg-white flex items-center justify-center border-b px-4 py-4 h-56">
        <Link
          to={`/product/${id}`}
          className="block w-full h-full flex items-center justify-center"
        >
          <img
            src={image}
            alt={name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
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
      </div>

      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="text-sm font-semibold mb-1 line-clamp-2 text-neutral-900">
            {name}
          </h3>
        </Link>

        {category && (
          <p className="text-xs text-muted-foreground mb-3 capitalize">
            {category}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold text-neutral-900">
            {formatPrice(price)}
          </div>
          <div className="text-xs text-muted-foreground">
            {availableCount != null
              ? `${availableCount} left`
              : colors.length
              ? `${colors.length} colors`
              : ""}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {colors.slice(0, 3).map((c) => (
            <span
              key={c.value}
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: c.hex || undefined }}
              title={c.label}
            />
          ))}
          {sizes.length > 0 && (
            <span className="text-xs text-muted-foreground ml-2">
              {sizes.length} sizes
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleAddToCart} className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Link to={`/product/${id}`} className="w-24">
            <Button variant="outline" className="w-full">
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
