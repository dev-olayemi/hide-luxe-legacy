/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getAllProducts } from "@/firebase/firebaseUtils";

interface SearchDialogProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export const SearchDialog = ({ searchQuery, onSearchChange }: SearchDialogProps) => {
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  }, [searchQuery, allProducts]);

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onSearchChange("");
    setShowResults(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10"
          onFocus={() => searchQuery && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
      </div>

      {showResults && filteredProducts.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="flex items-center gap-4 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
            >
              <img
                src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "/placeholder.png"}
                alt={product.name}
                className="h-12 w-12 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.category}</p>
              </div>
              <p className="font-semibold">₦{Number(product.price || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {showResults && searchQuery && filteredProducts.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-background border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
};
