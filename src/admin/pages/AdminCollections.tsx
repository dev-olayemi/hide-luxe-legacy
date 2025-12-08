/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  ImageIcon,
  ArrowRight,
  Grip,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Category page links available for collections
const CATEGORY_LINKS = [
  { label: "Footwear", value: "/category-showcase/footwear" },
  { label: "Apparel & Outerwear", value: "/category-showcase/apparel-&-outerwear" },
  { label: "Bags & Travel", value: "/category-showcase/bags-&-travel" },
  { label: "Accessories", value: "/category-showcase/accessories" },
  { label: "Leather Interiors", value: "/category-showcase/leather-interiors" },
  { label: "Automotive Leather", value: "/category-showcase/automotive-leather" },
  { label: "Custom/Bespoke", value: "/category-showcase/custom-bespoke" },
];

interface CollectionItem {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  link: string;
  featured: boolean;
  order: number;
}

const defaultCollection: Omit<CollectionItem, "id"> = {
  name: "",
  title: "",
  description: "",
  image: "",
  link: "",
  featured: true,
  order: 0,
};

const AdminCollections = () => {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [formData, setFormData] = useState<Omit<CollectionItem, "id">>(defaultCollection);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "collections"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as CollectionItem[];
      // Sort by order
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCollections(list);
    } catch (err: any) {
      console.error("Failed to load collections", err);
      toast({ title: "Failed to load collections", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingCollection(null);
    setFormData({
      ...defaultCollection,
      order: collections.length,
    });
    setImageLoadError(false);
    setImageLoading(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (col: CollectionItem) => {
    setEditingCollection(col);
    setFormData({
      name: col.name,
      title: col.title,
      description: col.description,
      image: col.image,
      link: col.link,
      featured: col.featured,
      order: col.order,
    });
    setImageLoadError(false);
    setImageLoading(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }

    try {
      if (editingCollection) {
        // Update existing
        await updateDoc(doc(db, "collections", editingCollection.id), formData);
        setCollections((prev) =>
          prev.map((c) =>
            c.id === editingCollection.id ? { ...c, ...formData } : c
          )
        );
        toast({ title: "Collection updated successfully" });
      } else {
        // Create new
        const docRef = await addDoc(collection(db, "collections"), formData);
        setCollections((prev) => [...prev, { id: docRef.id, ...formData }]);
        toast({ title: "Collection created successfully" });
      }
      setIsDialogOpen(false);
      setEditingCollection(null);
      setFormData(defaultCollection);
    } catch (err: any) {
      console.error("Save failed", err);
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    try {
      await deleteDoc(doc(db, "collections", id));
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Collection deleted successfully" });
    } catch (err: any) {
      console.error("Delete failed", err);
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

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
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Manage your "Explore Our Collections" section on the homepage
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCollection ? "Edit Collection" : "Add New Collection"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Slug/ID (for category URL)</Label>
                <Input
                  id="name"
                  placeholder="e.g., footwear, bags-travel"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Premium Apparel"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description for the collection card..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  placeholder="https://... or /collections/image.jpg"
                  value={formData.image}
                  onChange={(e) => {
                    setFormData({ ...formData, image: e.target.value });
                    setImageLoadError(false);
                  }}
                />
                {formData.image && (
                  <div className="space-y-2">
                    {imageLoadError && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>Failed to load image. Check the URL and try again.</span>
                      </div>
                    )}
                    {imageLoading && (
                      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    )}
                    {!imageLoading && !imageLoadError && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          setImageLoadError(true);
                          setImageLoading(false);
                        }}
                        onLoadStart={() => setImageLoading(true)}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="link">Link URL (optional)</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.link || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, link: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger id="link" className="flex-1">
                      <SelectValue placeholder="Select a category page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No link</SelectItem>
                      {CATEGORY_LINKS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.link && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, link: "" })}
                      className="px-3"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {formData.link && (
                  <p className="text-xs text-muted-foreground">
                    Selected: <code className="bg-muted px-1 rounded">{formData.link}</code>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Featured (show in main grid)</Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, featured: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  min={0}
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingCollection ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This is how your collections will appear on the homepage
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {collections.filter((c) => c.featured).slice(0, 3).map((col) => (
              <div
                key={col.id}
                className="relative overflow-hidden rounded-xl h-48 bg-muted group"
              >
                {col.image ? (
                  <img
                    src={col.image}
                    alt={col.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                    <ImageIcon className="h-12 w-12 text-gray-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg">{col.title}</h3>
                  <p className="text-xs opacity-80 line-clamp-2">{col.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collections List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Card key={col.id} className="overflow-hidden">
            <div className="relative h-40 bg-muted">
              {col.image ? (
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                  <ImageIcon className="h-12 w-12 text-gray-500" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {col.featured && (
                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                    Featured
                  </span>
                )}
                <span className="px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center gap-1">
                  <Grip className="h-3 w-3" />
                  {col.order}
                </span>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-1">{col.title}</h3>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {col.description}
              </p>
              {col.name && (
                <p className="text-xs text-muted-foreground mb-3">
                  Slug: <code className="bg-muted px-1 rounded">{col.name}</code>
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(col)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(col.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {collections.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No collections yet</p>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Collection
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminCollections;
