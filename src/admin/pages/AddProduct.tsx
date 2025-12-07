/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, uploadImage } from "@/firebase/firebaseUtils";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Plus, ArrowLeft, FolderPlus, Upload, Loader2 } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discount: "",
    stock: "",
    images: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    materials: "",
    care: "",
    specifications: "",
    isLimited: false,
    isFeatured: false,
  });

  const [currentImage, setCurrentImage] = useState("");
  const [currentSize, setCurrentSize] = useState("");
  const [currentColor, setCurrentColor] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Derived pricing values & validation
  const priceNum = Number(formData.price) || 0;
  const discountNum = formData.discount !== "" ? Number(formData.discount) : 0;
  const discountValid = formData.discount === "" || (discountNum >= 0 && discountNum <= 100);
  const discountedPrice = discountNum ? Math.max(0, priceNum - (priceNum * discountNum) / 100) : priceNum;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = snapshot.docs.map(doc => doc.data().name as string);
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: new Date(),
      });
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
      setShowCategoryDialog(false);
      toast({ title: "Category added successfully!" });
    } catch (error: any) {
      toast({ title: "Failed to add category", variant: "destructive" });
    }
  };

  const deleteCategory = async (categoryName: string) => {
    if (!confirm(`Delete category "${categoryName}"?`)) return;
    
    try {
      const snapshot = await getDocs(collection(db, "categories"));
      const categoryDoc = snapshot.docs.find(doc => doc.data().name === categoryName);
      if (categoryDoc) {
        await deleteDoc(doc(db, "categories", categoryDoc.id));
        setCategories(categories.filter(c => c !== categoryName));
        toast({ title: "Category deleted successfully!" });
      }
    } catch (error) {
      toast({ title: "Failed to delete category", variant: "destructive" });
    }
  };

  const addImage = () => {
    if (currentImage && !formData.images.includes(currentImage)) {
      setFormData({ ...formData, images: [...formData.images, currentImage] });
      setCurrentImage("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB for good quality)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image size should be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadImage(file);
      setFormData({ ...formData, images: [...formData.images, imageUrl] });
      toast({ title: "Image uploaded successfully!" });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (img: string) => {
    setFormData({ ...formData, images: formData.images.filter((i) => i !== img) });
  };

  const addSize = () => {
    if (currentSize && !formData.sizes.includes(currentSize)) {
      setFormData({ ...formData, sizes: [...formData.sizes, currentSize] });
      setCurrentSize("");
    }
  };

  const removeSize = (size: string) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== size) });
  };

  const addColor = () => {
    if (currentColor && !formData.colors.includes(currentColor)) {
      setFormData({ ...formData, colors: [...formData.colors, currentColor] });
      setCurrentColor("");
    }
  };

  const removeColor = (color: string) => {
    setFormData({ ...formData, colors: formData.colors.filter((c) => c !== color) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // validate discount
    if (!discountValid) {
      toast({ title: "Invalid discount", description: "Discount must be between 0 and 100", variant: "destructive" });
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (formData.discount !== undefined && formData.discount !== "") {
        payload.discount = Number(formData.discount);
      }

      await addDoc(collection(db, "products"), payload);

      toast({ title: "Product added successfully!" });
      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error adding product:", error);
      toast({ title: "Failed to add product", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product listing</p>
          </div>
        </div>
        
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <FolderPlus className="h-4 w-4 mr-2" />
              Manage Categories
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCategory()}
                />
                <Button onClick={addCategory}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Existing Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Badge key={cat} variant="secondary" className="gap-2">
                      {cat}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => deleteCategory(cat)} 
                      />
                    </Badge>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories yet</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              {/* Price/Discount/Stock moved to Pricing card for clarity */}
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity *</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="e.g., 20"
                    min={0}
                    max={100}
                  />
                  {!discountValid && (
                    <p className="text-sm text-destructive">Discount must be between 0 and 100</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Discounted Price</Label>
                  <div className="text-lg font-bold">₦{discountedPrice.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Image URL</TabsTrigger>
                  <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={currentImage}
                      onChange={(e) => setCurrentImage(e.target.value)}
                    />
                    <Button type="button" onClick={addImage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="cursor-pointer"
                    />
                    {uploadingImage && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, WEBP
                  </p>
                </TabsContent>
              </Tabs>
              
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(img)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Available Sizes</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="e.g., 42, L, XL"
                    value={currentSize}
                    onChange={(e) => setCurrentSize(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
                  />
                  <Button type="button" onClick={addSize}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.sizes.map((size, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      {size}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeSize(size)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Available Colors</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="e.g., Black, Brown"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
                  />
                  <Button type="button" onClick={addColor}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.colors.map((color, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      {color}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="materials">Materials</Label>
                <Input
                  id="materials"
                  placeholder="e.g., Genuine Leather, Cotton"
                  value={formData.materials}
                  onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="care">Care Instructions</Label>
                <Textarea
                  id="care"
                  placeholder="How to care for this product"
                  value={formData.care}
                  onChange={(e) => setFormData({ ...formData, care: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  placeholder="Additional product specifications"
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isLimited}
                    onChange={(e) => setFormData({ ...formData, isLimited: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Limited Edition</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Featured Product</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding Product..." : "Add Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/products")}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
