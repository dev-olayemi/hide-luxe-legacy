/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {  
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  ImageIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Products = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(list);
    } catch (err: any) {
      console.error("Failed to load products", err);
      toast({ title: "Failed to load products", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      setItems((s) => s.filter((i) => i.id !== id));
      toast({ title: "Product deleted successfully" });
    } catch (err: any) {
      console.error("Delete failed", err);
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const filteredProducts = items.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/admin/add-product">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((p) => (
          <Card key={p.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative aspect-square bg-muted">
              {p.images && p.images.length > 0 ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              {p.isLimited && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  Limited
                </Badge>
              )}
              {p.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-yellow-500">
                  Featured
                </Badge>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link to={`/admin/products/edit/${p.id}`}>
                  <Button size="sm" variant="secondary">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => remove(p.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.category}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">
                  ₦{Number(p.price ?? 0).toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  Stock: {p.stock ?? 0}
                </span>
              </div>

              {(p.sizes || p.colors) && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {Array.isArray(p.sizes) && p.sizes.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Sizes:</span>
                      <div className="flex gap-1">
                        {p.sizes.slice(0, 3).map((size: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{size}</Badge>
                        ))}
                        {p.sizes.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{p.sizes.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {Array.isArray(p.colors) && p.colors.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Colors:</span>
                      <div className="flex gap-1">
                        {p.colors.slice(0, 3).map((color: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs capitalize">{color}</Badge>
                        ))}
                        {p.colors.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{p.colors.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {p.images && p.images.length > 1 && (
                <div className="flex gap-1 pt-2">
                  {p.images.slice(1, 4).map((img: string, idx: number) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${p.name} ${idx + 2}`}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ))}
                  {p.images.length > 4 && (
                    <div className="w-12 h-12 rounded border bg-muted flex items-center justify-center text-xs font-medium">
                      +{p.images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredProducts.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "No products found matching your search" : "No products found"}
              </p>
              <Link to="/admin/add-product">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Products;
