/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getProductById, getAllProducts } from "@/firebase/firebaseUtils";
import { cn } from "@/lib/utils";
import { SEOHead } from "@/components/SEOHead";
import NotFound from "./NotFound";
import OptimizedImage from "@/components/OptimizedImage";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data || null);
        
        if (data) {
          // Fetch all products to find related ones
          const allProducts = await getAllProducts();
          const related = allProducts
            .filter((p: any) => p.id !== id && p.category === data.category)
            .slice(0, 6);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error('Error loading product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formatPrice } = useCurrency();

  // Compute discounted price when discount exists
  const discountedPrice = product?.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price;
  const savings = product?.discount ? product.price - discountedPrice : 0;

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: discountedPrice,
      image:
        Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "",
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${product.name} | HLX Premium Leather`}
        description={product.description || `Discover ${product.name} - Premium leather products from HLX. Luxury. Leather. Legacy.`}
        image={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "https://www.28hideluxe.com/og-image.jpg"}
        url={`https://www.28hideluxe.com/product/${product.id}`}
        type="product"
        productData={{
          name: product.name,
          price: product.price,
          image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "",
          description: product.description || product.name,
          currency: "NGN",
          category: product.category,
          availability: "https://schema.org/InStock",
        }}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        <BackButton label="Back to Home" className="mb-8" />

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {/* Main image uses OptimizedImage for lazy loading & decoding */}
              <OptimizedImage
                src={
                  Array.isArray(product.images) && product.images.length > 0
                    ? product.images[selectedImageIndex]
                    : "/placeholder.png"
                }
                alt={product.name}
                className="w-full h-full object-cover"
                width={900}
                height={900}
                priority={true}
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer transition-colors border-2 ${
                      idx === selectedImageIndex ? 'border-accent ring-2 ring-accent/20' : 'border-transparent hover:border-accent'
                    }`}
                  >
                    <OptimizedImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover"
                      width={200}
                      height={200}
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
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= (product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating ? `${product.rating}.0` : "No ratings yet"}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-3xl font-semibold">
                  {formatPrice(discountedPrice)}
                </p>
                {product.discount && (
                  <p className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="prose prose-sm">
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Color</Label>
                <RadioGroup
                  value={selectedColor}
                  onValueChange={setSelectedColor}
                >
                  <div className="flex gap-3">
                    {product.colors.map((color: any) => {
                      const colorValue = typeof color === 'string' ? color : color.value || color.label;
                      const colorHex = typeof color === 'object' ? color.hex : undefined;
                      const colorLabel = typeof color === 'string' ? color : color.label;
                      
                      return (
                        <div key={colorValue} className="flex flex-col items-center gap-2">
                          <RadioGroupItem
                            value={colorValue}
                            id={`color-${colorValue}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`color-${colorValue}`}
                            className={cn(
                              "w-12 h-12 rounded-full border-2 cursor-pointer transition-all",
                              selectedColor === colorValue
                                ? "border-accent ring-2 ring-accent ring-offset-2"
                                : "border-border hover:border-accent/50"
                            )}
                            style={{ backgroundColor: colorHex || colorValue }}
                            title={colorLabel}
                          />
                          <span className="text-xs text-muted-foreground capitalize">
                            {colorLabel}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
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
            <div className="flex gap-4 pt-4 items-center">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleWishlist(product.id)}
                  className={cn(inWishlist && "border-accent")}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 mr-2 inline-block",
                      inWishlist && "fill-accent text-accent"
                    )}
                  />
                  Wishlist
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const WHATSAPP_NUMBER = "+2349031976895";
                    const phone = WHATSAPP_NUMBER.replace(/[^\d]/g, "");
                    const productLink = `${window.location.origin}/product/${product.id}`;
                    const msg = `Hello, I would like information about this product:\n\nProduct: ${product.name}\nCategory: ${product.category}\nPrice: ₦${discountedPrice.toLocaleString()}\nLink: ${productLink}`;
                    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
                    window.open(url, "_blank");
                  }}
                >
                  {/* chat icon */}
                  <svg className="w-4 h-4 mr-2 inline-block" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Contact Seller
                </Button>

                {/* PalmPay button intentionally omitted on product pages; kept on Cart page only */}
              </div>
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

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {relatedProducts.map((p: any) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="w-full aspect-square bg-gray-100 overflow-hidden relative">
                    <img
                      src={p.image || p.thumbnail || (p.images && p.images[0])}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/collections/cool-brown-bag.jpg';
                      }}
                    />
                    {p.isNew && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                      {p.name}
                    </h4>
                    <div className="text-xs text-gray-600 mb-2">{p.subcategory}</div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 text-xs mb-2">
                      <span>⭐ {p.rating || 0}</span>
                      <span className="text-gray-500">({p.reviews || 0})</span>
                    </div>

                    {/* Price (show discounted price as main, base price as strike-through when discount exists) */}
                    <div className="flex flex-col items-start gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {/* Discounted price logic */}
                        {p.discount ? (
                          <>
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(p.price - (p.price * p.discount) / 100)}</span>
                            <span className="text-xs text-gray-500 line-through whitespace-nowrap">{formatPrice(p.price)}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(p.price || 0)}</span>
                        )}
                      </div>
                      {/* Savings badge */}
                      {p.discount && (
                        <span className="inline-block bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded mt-1">Save {p.discount}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetail;
