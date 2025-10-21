import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
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
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      id,
      name,
      price,
      image,
      category: category || "",
    });
    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart.`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id);
    if (!inWishlist) {
      toast({
        title: "Added to wishlist",
        description: `${name} has been added to your wishlist.`,
      });
    }
  };

  return (
    <Card className="group relative overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl bg-card">
      <div className="relative overflow-hidden aspect-[3/4] rounded-t-2xl">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {isNew && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground font-bold shadow-lg">
            NEW
          </Badge>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleToggleWishlist}
              className="flex-1"
            >
              <Heart className={cn("h-4 w-4 mr-2", inWishlist && "fill-accent text-accent")} />
              Wishlist
            </Button>
            <Link to={`/product/${id}`} className="flex-1">
              <Button size="sm" variant="secondary" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <CardContent className="p-5">
        <Link to={`/product/${id}`}>
          <h3 className="font-bold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        {category && (
          <p className="text-sm text-muted-foreground capitalize mb-4">{category}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {formatPrice(price)}
          </span>
          <Button size="sm" onClick={handleAddToCart} className="shadow-md hover:shadow-lg transition-shadow">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
