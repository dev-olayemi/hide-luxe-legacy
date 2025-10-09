import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  isNew?: boolean;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  category,
  isNew,
}: ProductCardProps) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, name, price, image, category: category || "" });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isNew && (
            <div className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 text-xs font-medium">
              NEW
            </div>
          )}
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "absolute top-3 right-3 h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              inWishlist && "opacity-100"
            )}
            onClick={handleToggleWishlist}
          >
            <Heart
              className={cn("h-4 w-4", inWishlist && "fill-accent text-accent")}
            />
          </Button>
        </div>
      </Link>

      <div className="p-4">
        {category && (
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
            {category}
          </p>
        )}
        <Link to={`/product/${id}`}>
          <h3 className="font-playfair font-medium mb-2 hover:text-accent transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <p className="font-semibold">₦{price.toLocaleString()}</p>
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
};
