/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@/firebase/firebaseUtils";
import { cn } from "@/lib/utils";
import NotFound from "./NotFound";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    if (!id) return;
    getProductById(id).then((data) => {
      setProduct(data || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading product...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return <NotFound />;
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "",
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <BackButton label="Back to Home" className="mb-8" />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[0]
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-accent transition-colors"
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">
                {product.category}
              </p>
              <h1 className="font-playfair text-4xl font-bold mb-4">
                {product.name}
              </h1>
              {product.isNew && <Badge className="mb-4">New Arrival</Badge>}
              <p className="text-3xl font-semibold mb-6">
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            <div className="prose prose-sm">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Color</Label>
                <RadioGroup
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                >
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem
                          value={color}
                          id={`color-${color}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`color-${color}`}
                          className={cn(
                            "px-6 py-2 border rounded cursor-pointer transition-colors",
                            selectedColor === color
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          )}
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Size</Label>
                <RadioGroup
                  value={selectedSize}
                  onValueChange={setSelectedSize}
                >
                  <div className="grid grid-cols-6 gap-2">
                    {product.sizes.map((size) => (
                      <div key={size}>
                        <RadioGroupItem
                          value={size}
                          id={`size-${size}`}
                          className="sr-only"
                        />
                        <Label
                          htmlFor={`size-${size}`}
                          className={cn(
                            "flex items-center justify-center h-12 border rounded cursor-pointer transition-colors",
                            selectedSize === size
                              ? "border-accent bg-accent/10 font-semibold"
                              : "border-border hover:border-accent/50"
                          )}
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => toggleWishlist(product.id)}
                className={cn(inWishlist && "border-accent")}
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    inWishlist && "fill-accent text-accent"
                  )}
                />
              </Button>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Product Details</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Premium handcrafted leather</li>
                  <li>• Made in Nigeria</li>
                  <li>• Leather sole with rubber heel</li>
                  <li>• Professional craftsmanship</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Care Instructions</h3>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Wipe clean with a soft cloth</li>
                  <li>• Use leather conditioner regularly</li>
                  <li>• Store in a cool, dry place</li>
                  <li>• Avoid prolonged exposure to water</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
