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
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'live' | 'draft' | 'available' | 'unavailable'>('all');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "products"));
      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply filtering
      if (filterBy !== 'all') {
        data = data.filter((p: any) => {
          switch (filterBy) {
            case 'live':
              return p.isLive !== false;
            case 'draft':
              return p.isLive === false;
            case 'available':
              return p.isAvailable !== false;
            case 'unavailable':
              return p.isAvailable === false;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      data.sort((a: any, b: any) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'price':
            aValue = Number(a.price) || 0;
            bValue = Number(b.price) || 0;
            break;
          case 'createdAt':
            aValue = a.createdAt?.toDate?.() || new Date(a.createdAt);
            bValue = b.createdAt?.toDate?.() || new Date(b.createdAt);
            break;
          case 'updatedAt':
            aValue = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
            bValue = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

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
      // Remove from UI immediately
      setProducts(products.filter((p) => p.id !== id));
      toast({ 
        title: "Success",
        description: "Product deleted successfully" 
      });
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({ 
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive" 
      });
      // Refresh products to sync with DB
      await fetchProducts();
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

        {/* Sorting and Filtering Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Products</option>
                <option value="live">Live Only</option>
                <option value="draft">Draft Only</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="createdAt">Date Created</option>
                <option value="updatedAt">Date Updated</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Order:</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <Button onClick={fetchProducts} variant="outline" size="sm">
              Apply Filters
            </Button>
          </div>
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
                  {p.isAvailable === false && (
                    <Badge className="absolute top-2 left-2 bg-gray-500">
                      Unavailable
                    </Badge>
                  )}
                  {p.isLive === false && (
                    <Badge className="absolute top-10 left-2 bg-orange-500">
                      Draft
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
