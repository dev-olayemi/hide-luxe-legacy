/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc, getDoc, deleteDoc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { uploadImage } from "@/firebase/firebaseUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Trash2, Edit, Loader2, ImageIcon, Package,
  Eye, EyeOff, X,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ArtProduct {
  id?: string;
  name: string;
  description: string;
  inspiration: string;
  price: number;
  discount: number;
  image: string;
  images: string[];
  type: "art";
  isLimited: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  serialNumber?: string;
}

const emptyForm = (): Omit<ArtProduct, "id"> => ({
  name: "",
  description: "",
  inspiration: "",
  price: 0,
  discount: 0,
  image: "",
  images: [],
  type: "art",
  isLimited: false,
  isFeatured: false,
  isAvailable: true,
});

const AdminArt = () => {
  const [artEnabled, setArtEnabled] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [artworks, setArtworks] = useState<ArtProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [form, setForm] = useState<Omit<ArtProduct, "id">>(emptyForm());
  const { formatPrice } = useCurrency();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load toggle state
      const settingSnap = await getDoc(doc(db, "siteSettings", "artSection"));
      if (settingSnap.exists()) setArtEnabled(settingSnap.data().enabled ?? false);

      // Load art products — fetch all, filter client-side to avoid index requirement
      const snap = await getDocs(collection(db, "products"));
      const items = snap.docs
        .map((d) => ({ id: d.id, ...d.data() as any }))
        .filter((p: any) => p.type === "art") as ArtProduct[];
      items.sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setArtworks(items);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load art data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleArtSection = async (enabled: boolean) => {
    setToggling(true);
    try {
      await setDoc(doc(db, "siteSettings", "artSection"), { enabled }, { merge: true });
      setArtEnabled(enabled);
      toast({ title: `Art section ${enabled ? "enabled" : "disabled"}` });
    } catch {
      toast({ title: "Failed to update setting", variant: "destructive" });
    } finally {
      setToggling(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => {
        const newImages = f.images.includes(url) ? f.images : [...f.images, url];
        return { ...f, images: newImages, image: f.image || url };
      });
      toast({ title: "Image uploaded" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const addImageUrl = () => {
    const url = currentImageUrl.trim();
    if (!url) return;
    if (form.images.includes(url)) {
      toast({ title: "URL already added", variant: "destructive" });
      return;
    }
    setForm((f) => ({
      ...f,
      images: [...f.images, url],
      image: f.image || url, // first image becomes the primary
    }));
    setCurrentImageUrl("");
  };

  const removeImage = (url: string) => {
    setForm((f) => {
      const newImages = f.images.filter((i) => i !== url);
      return {
        ...f,
        images: newImages,
        image: f.image === url ? (newImages[0] || "") : f.image,
      };
    });
  };

  const setPrimaryImage = (url: string) => {
    setForm((f) => ({ ...f, image: url }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast({ title: "Name is required", variant: "destructive" });
    if (!form.price || form.price <= 0) return toast({ title: "Price is required", variant: "destructive" });
    setSaving(true);
    try {
      const payload = { ...form, updatedAt: new Date() };
      if (editing) {
        await updateDoc(doc(db, "products", editing), payload);
        toast({ title: "Artwork updated" });
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: new Date() });
        toast({ title: "Artwork added" });
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm());
      await loadAll();
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (art: ArtProduct) => {
    setForm({
      name: art.name || "",
      description: art.description || "",
      inspiration: art.inspiration || "",
      price: art.price || 0,
      discount: art.discount || 0,
      image: art.image || "",
      images: art.images || [],
      type: "art",
      isLimited: art.isLimited || false,
      isFeatured: art.isFeatured || false,
      isAvailable: art.isAvailable !== false,
    });
    setEditing(art.id!);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this artwork?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "Artwork deleted" });
      await loadAll();
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-6 h-6" /> Art Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{artworks.length} artworks · Section is {artEnabled ? "live" : "hidden"}</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Artwork
        </Button>
      </div>

      {/* Toggle card */}
      <Card className={artEnabled ? "border-green-200 bg-green-50" : "border-gray-200"}>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {artEnabled ? <Eye className="w-5 h-5 text-green-600" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
            <div>
              <p className="font-semibold text-sm">{artEnabled ? "Art section is visible to customers" : "Art section is hidden from customers"}</p>
              <p className="text-xs text-gray-500">Toggle to show or hide the Art banner and /artwork page</p>
            </div>
          </div>
          <Switch checked={artEnabled} onCheckedChange={toggleArtSection} disabled={toggling} />
        </CardContent>
      </Card>

      {/* Add / Edit form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editing ? "Edit Artwork" : "Add New Artwork"}
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm()); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-700" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. The Golden Hour" />
              </div>
              <div className="space-y-2">
                <Label>Price (₦) *</Label>
                <Input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Describe the artwork..." />
            </div>

            <div className="space-y-2">
              <Label>Inspiration (optional)</Label>
              <Input value={form.inspiration} onChange={(e) => setForm({ ...form, inspiration: e.target.value })} placeholder="e.g. Inspired by the Lagos skyline at dusk" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount (%)</Label>
                <Input type="number" min={0} max={100} value={form.discount || ""} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} placeholder="0" />
              </div>
            </div>

            {/* Images — multi URL + upload */}
            <div className="space-y-3">
              <Label>Images</Label>

              {/* URL input row */}
              <div className="flex gap-2">
                <Input
                  value={currentImageUrl}
                  onChange={(e) => setCurrentImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
                  placeholder="Paste image URL and press Add"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addImageUrl} disabled={!currentImageUrl.trim()}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>

              {/* Upload */}
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="cursor-pointer flex-1" />
                {uploadingImage && <Loader2 className="w-5 h-5 animate-spin text-gray-400 flex-shrink-0" />}
              </div>

              {/* Image previews */}
              {form.images.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-2">
                  {form.images.map((url) => (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt="preview"
                        className={`w-full aspect-square object-cover rounded-lg border-2 transition-all ${
                          form.image === url ? "border-black shadow-md" : "border-gray-200"
                        }`}
                      />
                      {/* Primary badge */}
                      {form.image === url && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          PRIMARY
                        </span>
                      )}
                      {/* Actions on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1.5">
                        {form.image !== url && (
                          <button
                            onClick={() => setPrimaryImage(url)}
                            className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded hover:bg-yellow-400 transition-colors"
                            title="Set as primary"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => removeImage(url)}
                          className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {form.images.length === 0 && (
                <p className="text-xs text-gray-400">No images added yet. Add a URL or upload a file above.</p>
              )}
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isLimited} onChange={(e) => setForm({ ...form, isLimited: e.target.checked })} className="w-4 h-4 rounded" />
                Limited Edition
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded" />
                Available
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editing ? "Save Changes" : "Add Artwork"}
              </Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); setForm(emptyForm()); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artwork list */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No artworks yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {artworks.map((art) => {
            const img = art.image || art.images?.[0];
            const finalPrice = art.discount ? art.price * (1 - art.discount / 100) : art.price;
            return (
              <div key={art.id} className="border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {img
                    ? <img src={img} alt={art.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-gray-300" /></div>
                  }
                  {art.isLimited && <span className="absolute top-2 left-2 px-2 py-0.5 bg-black text-yellow-400 text-xs font-bold rounded-full">LIMITED</span>}
                  {!art.isAvailable && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white font-bold text-sm">Unavailable</span></div>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900 line-clamp-1">{art.name}</p>
                  {art.inspiration && <p className="text-xs text-gray-400 italic line-clamp-1 mt-0.5">"{art.inspiration}"</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-sm">{formatPrice(finalPrice)}</span>
                    {art.discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(art.price)}</span>}
                  </div>
                  {art.serialNumber && <p className="text-xs font-mono text-gray-400 mt-1">{art.serialNumber}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(art)}>
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500 hover:text-red-700 hover:border-red-300" onClick={() => handleDelete(art.id!)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminArt;
