/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/firebase/firebaseUtils";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/Header";

const UPLOADCARE_PUB_KEY = import.meta.env.VITE_UPLOADCARE_PUB_KEY as string;
const UPLOADCARE_CDN_BASE = import.meta.env.VITE_UPLOADCARE_CDN_BASE as string;


const PRODUCT_CATEGORIES = [
  "Footwear (Shoes, Boots, Slippers)",
  "Apparel (Jackets, Pants, Skirts, Gloves)",
  "Accessories (Bags, Wallets, Belts, Watch Straps)",
  "Furniture (Sofas, Chairs, Ottomans)",
  "Automotive (Car Seats, Steering Wheels)",
  "Specialty (Book Covers, Instrument Cases, Saddles)",
];

const Bespoke = () => {
  const [formData, setFormData] = useState({
    category: "",
    productType: "",
    description: "",
    specifications: "",
    budget: "",
    timeline: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setImages((s) => [...s, url]);
    setImageUrlInput("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const uploadPromises = Array.from(files).map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("UPLOADCARE_PUB_KEY", UPLOADCARE_PUB_KEY);
      fd.append("UPLOADCARE_STORE", "auto");
      try {
        const res = await fetch("https://upload.uploadcare.com/base/", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        const fileId = data.file || Object.values(data)[0];
        const filename = file.name ? encodeURIComponent(file.name) : "";
        return filename
          ? `${UPLOADCARE_CDN_BASE}/${fileId}/${filename}`
          : `${UPLOADCARE_CDN_BASE}/${fileId}/`;
      } catch (err) {
        console.error("upload err", err);
        toast({
          title: "Upload failed",
          description: `Could not upload ${file.name}`,
          variant: "destructive",
        });
        return null;
      }
    });

    const newUrls = (await Promise.all(uploadPromises)).filter(
      (u): u is string => !!u
    );
    if (newUrls.length > 0) {
      setImages((s) => [...s, ...newUrls]);
      toast({ title: `${newUrls.length} image(s) uploaded` });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) =>
    setImages((s) => s.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit a bespoke request.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!formData.category || !formData.productType || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please complete category, product type and description",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        ...formData,
        images, // uploaded URLs and added URLs
        userId: auth.currentUser.uid,
        status: "pending",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "bespokeRequests"), payload);

      // open WhatsApp with a short message and the request id
      const message = `Hello, I submitted a bespoke request (ref: ${docRef.id}). Please contact me.`;
      window.open(
        `https://wa.me/+2349031976895?text=${encodeURIComponent(message)}`,
        "_blank"
      );

      toast({
        title: "Request Submitted",
        description: "We'll contact you shortly to discuss your bespoke order.",
      });

      // reset
      setFormData({
        category: "",
        productType: "",
        description: "",
        specifications: "",
        budget: "",
        timeline: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
      });
      setImages([]);
      setImageUrlInput("");
      navigate("/dashboard"); // optional: go to dashboard
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-6 md:py-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-block mb-3 md:mb-4 px-3 py-1 bg-primary/10 rounded-full">
              <span className="text-xs md:text-sm font-semibold text-primary">CUSTOM ORDERS</span>
            </div>
            <h1 className="font-heading text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-foreground">
              Bespoke Creations
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create your perfect luxury leather piece, crafted exclusively for you with premium quality
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b pb-6 md:pb-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl md:text-3xl mb-2">Custom Order Request</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Tell us your vision and we'll craft it into reality
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 md:pt-8">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* CATEGORY & PRODUCT TYPE */}
                <div>
                  <h3 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                    Product Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm md:text-base">Product Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                        required
                      >
                        <SelectTrigger className="h-10 md:h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Choose the type of item you want</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="productType" className="text-sm md:text-base">Specific Product Type *</Label>
                      <Input
                        id="productType"
                        placeholder="e.g., Oxford Shoes, Leather Jacket"
                        value={formData.productType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            productType: e.target.value,
                          })
                        }
                        className="h-10 md:h-11 text-sm"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Be specific about what you want</p>
                    </div>
                  </div>
                </div>                {/* DESCRIPTION & SPECIFICATIONS */}
                <div>
                  <h3 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">2</span>
                    Your Vision
                  </h3>
                  <div className="space-y-4 md:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm md:text-base">Detailed Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your vision for this bespoke piece... Include style, materials, colors, and any special requirements"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={4}
                        className="text-sm resize-none"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Min. 10 characters to help us understand your needs</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specifications" className="text-sm md:text-base">Specifications & Measurements</Label>
                      <Textarea
                        id="specifications"
                        placeholder="Include size, color preferences, leather type, special features, stitching style, hardware, etc."
                        value={formData.specifications}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specifications: e.target.value,
                          })
                        }
                        rows={4}
                        className="text-sm resize-none"
                      />
                      <p className="text-xs text-muted-foreground">Be as detailed as possible for best results</p>
                    </div>
                  </div>
                </div>

                {/* BUDGET & TIMELINE */}
                <div>
                  <h3 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">3</span>
                    Timeline & Budget
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budget" className="text-sm md:text-base">Budget Range (NGN)</Label>
                      <Input
                        id="budget"
                        type="text"
                        placeholder="e.g., 200,000 - 500,000"
                        value={formData.budget}
                        onChange={(e) =>
                          setFormData({ ...formData, budget: e.target.value })
                        }
                        className="h-10 md:h-11 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">This helps us plan for your order</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline" className="text-sm md:text-base">Desired Timeline</Label>
                      <Input
                        id="timeline"
                        type="text"
                        placeholder="e.g., 2-3 weeks"
                        value={formData.timeline}
                      onChange={(e) =>
                        setFormData({ ...formData, timeline: e.target.value })
                      }
                      className="h-10 md:h-11 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">When do you need it ready?</p>
                    </div>
                  </div>
                </div>

                {/* IMAGES SECTION */}
                <div className="border-t pt-6 md:pt-8">
                  <h3 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">4</span>
                    Reference Images (Optional)
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-5">Add inspiration images to help us visualize your vision</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                    {/* Upload files */}
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base font-medium">Upload Images</Label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-6 md:p-8 hover:border-primary/50 transition cursor-pointer group">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                        <div className="text-center pointer-events-none">
                          <div className="mb-3 flex justify-center">
                            <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition">
                              <Upload className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            </div>
                          </div>
                          <p className="font-medium text-sm text-foreground">Click or drag to upload</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                        </div>
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          <div className="animate-spin w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full" />
                          Uploading images...
                        </div>
                      )}
                    </div>

                    {/* Add URL */}
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base font-medium">Add Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="h-10 md:h-11 text-sm flex-1"
                        />
                        <Button 
                          type="button" 
                          onClick={addImageUrl}
                          size="sm"
                          className="h-10 md:h-11 px-4"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Paste image URLs as inspiration</p>
                    </div>
                  </div>

                  {/* Image previews */}
                  {images.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">{images.length} Image{images.length !== 1 ? 's' : ''} Added</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setImages([])}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear all
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden border border-slate-200 hover:border-primary transition aspect-square"
                          >
                            <img
                              src={img}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              alt={`preview-${idx}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1.5 shadow opacity-0 group-hover:opacity-100 transition"
                              title="Remove image"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CONTACT INFORMATION */}
                <div className="border-t pt-6 md:pt-8">
                  <h3 className="text-sm md:text-base font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">5</span>
                    Contact Information
                  </h3>
                  <div className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="contactName" className="text-sm md:text-base">Full Name *</Label>
                        <Input
                          id="contactName"
                          type="text"
                          placeholder="Your full name"
                          value={formData.contactName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactName: e.target.value,
                            })
                          }
                          className="h-10 md:h-11 text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="text-sm md:text-base">Email *</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.contactEmail}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contactEmail: e.target.value,
                            })
                          }
                          className="h-10 md:h-11 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone" className="text-sm md:text-base">Phone Number *</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="+234 XXX XXX XXXX"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value,
                          })
                        }
                        className="h-10 md:h-11 text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="border-t pt-6 md:pt-8 flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    className="flex-1 h-11 md:h-12 text-base font-semibold"
                    size="lg"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Submit Bespoke Request
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 md:h-12 text-base font-semibold"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Bespoke;
