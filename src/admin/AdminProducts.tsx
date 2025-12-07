/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { deleteProduct } from "@/firebase/firebaseUtils";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import AdminAddProduct from "./AdminAddProduct";
import { toast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast({ title: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({ title: "Error deleting product", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your product catalog</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            products.map((p) => (
              <Card
                key={p.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-white flex items-center justify-center border-b">
                  {Array.isArray(p.images) && p.images.length > 0 ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-full w-full object-contain p-4"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-300" />
                  )}
                  {p.isLimited && (
                    <Badge className="absolute top-2 right-2 bg-red-500">
                      Limited
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      {formatPrice(Number(p.price ?? 0))}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {p.stock}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {p.sizes.length} sizes
                      </span>
                    )}
                    {Array.isArray(p.colors) && p.colors.length > 0 && (
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {p.colors.length} colors
                      </span>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDelete(p.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
