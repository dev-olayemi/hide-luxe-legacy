/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl mb-4">
              Bespoke Creations
            </h1>
            <p className="text-muted-foreground text-lg">
              Create your perfect luxury leather piece, crafted exclusively for
              you
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Custom Order Request</CardTitle>
              <CardDescription>
                Fill out the form below and we'll work with you to bring your
                vision to life
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Product Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
                      required
                    >
                      <SelectTrigger>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productType">Specific Product Type *</Label>
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
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your vision for this bespoke piece..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specifications">
                    Specifications & Measurements
                  </Label>
                  <Textarea
                    id="specifications"
                    placeholder="Include size, color preferences, leather type, special features, etc."
                    value={formData.specifications}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specifications: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range (NGN)</Label>
                    <Input
                      id="budget"
                      type="text"
                      placeholder="e.g., 200,000 - 500,000"
                      value={formData.budget}
                      onChange={(e) =>
                        setFormData({ ...formData, budget: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Desired Timeline</Label>
                    <Input
                      id="timeline"
                      type="text"
                      placeholder="e.g., 2-3 weeks"
                      value={formData.timeline}
                      onChange={(e) =>
                        setFormData({ ...formData, timeline: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="font-semibold">Images (optional)</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Upload files</Label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="mt-2"
                        disabled={uploading}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG up to 10MB. Uploaded images stored via CDN.
                      </p>
                    </div>

                    <div>
                      <Label>Add image URL</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                        <Button type="button" onClick={addImageUrl}>
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Or paste image URLs. Both uploaded and URLs will be
                        saved.
                      </p>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <div>
                      <Label>Previews</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded overflow-hidden border"
                          >
                            <img
                              src={img}
                              className="w-full h-24 object-cover"
                              alt={`img-${idx}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input
                        id="contactName"
                        type="text"
                        placeholder="Your name"
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
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
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone Number *</Label>
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
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Submit Bespoke Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Bespoke;
