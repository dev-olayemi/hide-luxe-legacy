import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/firebase/firebaseUtils";
import { collection, addDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    referenceImages: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

    setLoading(true);
    try {
      await addDoc(collection(db, "bespokeRequests"), {
        ...formData,
        userId: auth.currentUser.uid,
        status: "pending",
        createdAt: new Date(),
      });

      const message = `Hello, I'd like to request a bespoke leather item:\n\nCategory: ${formData.category}\nProduct Type: ${formData.productType}\nDescription: ${formData.description}\n\nContact: ${formData.contactName}\nEmail: ${formData.contactEmail}\nPhone: ${formData.contactPhone}\n\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}`;
      
      window.open(`https://wa.me/+2348144977227?text=${encodeURIComponent(message)}`, "_blank");

      toast({
        title: "Request Submitted!",
        description: "We'll contact you shortly to discuss your bespoke order.",
      });

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
        referenceImages: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl mb-4">Bespoke Creations</h1>
          <p className="text-muted-foreground text-lg">
            Create your perfect luxury leather piece, crafted exclusively for you
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Order Request</CardTitle>
            <CardDescription>
              Fill out the form below and we'll work with you to bring your vision to life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Product Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
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
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specifications">Specifications & Measurements</Label>
                <Textarea
                  id="specifications"
                  placeholder="Include size, color preferences, leather type, special features, etc."
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">Desired Timeline</Label>
                  <Input
                    id="timeline"
                    type="text"
                    placeholder="e.g., 2-3 weeks"
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  />
                </div>
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
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceImages">Reference Images (URLs)</Label>
                  <Textarea
                    id="referenceImages"
                    placeholder="Paste image URLs or describe reference materials (one per line)"
                    value={formData.referenceImages}
                    onChange={(e) => setFormData({ ...formData, referenceImages: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Submitting..." : "Submit Bespoke Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bespoke;
