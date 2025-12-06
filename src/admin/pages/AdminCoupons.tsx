/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  getAllStorePointCoupons,
  createStorePointCoupon,
  deleteStorePointCoupon,
  updateStorePointCoupon,
  auth,
} from "@/firebase/firebaseUtils";
import { Gift, Trash2, Plus, Edit2, X, Check } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

interface Coupon {
  id: string;
  code: string;
  value: number;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: any;
  expiresAt?: any;
}

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  const [formData, setFormData] = useState({
    value: "",
    description: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await getAllStorePointCoupons();
      setCoupons(data as Coupon[]);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = (): string => {
    // Format: PREFIX + RANDOM + DATE
    // Example: HLX-7F2K-2024
    const prefix = "HLX";
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const datePart = new Date().getFullYear().toString().slice(-2);
    return `${prefix}-${randomPart}-${datePart}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.value.trim()) {
      toast({
        title: "Validation Error",
        description: "Points value is required",
        variant: "destructive",
      });
      return;
    }

    const value = Number(formData.value);
    if (value <= 0 || !Number.isFinite(value)) {
      toast({
        title: "Validation Error",
        description: "Value must be a positive number",
        variant: "destructive",
      });
      return;
    }

    try {
      const generatedCode = generateCouponCode();

      if (editingId) {
        // Update existing coupon
        await updateStorePointCoupon(editingId, {
          value: value,
          description: formData.description,
          isActive: true,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null,
        });
        toast({
          title: "Success",
          description: "Coupon updated successfully",
        });
      } else {
        // Create new coupon with generated code
        await createStorePointCoupon(
          generatedCode,
          value,
          auth.currentUser?.uid || "",
          formData.description,
          formData.expiresAt ? new Date(formData.expiresAt) : undefined
        );
        toast({
          title: "Success",
          description: `Coupon created: ${generatedCode}`,
        });
      }

      setFormData({ value: "", description: "", expiresAt: "" });
      setEditingId(null);
      setShowForm(false);
      await fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save coupon",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      value: coupon.value.toString(),
      description: coupon.description || "",
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await deleteStorePointCoupon(code);
      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });
      await fetchCoupons();
    } catch (error: any) {
      console.error("Error deleting coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ value: "", description: "", expiresAt: "" });
  };

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(search.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Gift className="h-8 w-8 text-amber-500" />
              Store Point Coupons
            </h1>
            <p className="text-gray-500 mt-1">
              Create and manage store point coupons for your customers
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-5 w-5" />
              Create Coupon
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{editingId ? "Edit Coupon" : "Create New Coupon"}</span>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingId && (
                  <div className="bg-white p-4 rounded-lg border-2 border-dashed border-blue-300">
                    <p className="text-sm text-gray-600 mb-2">Auto-Generated Coupon Code</p>
                    <div className="flex items-center gap-3">
                      <code className="text-2xl font-bold text-blue-600 flex-1">
                        {generateCouponCode()}
                      </code>
                      <p className="text-xs text-gray-500 text-right">
                        A unique code will be<br />generated when you create
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="value">Store Points Value</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="value"
                        type="number"
                        min="1"
                        placeholder="e.g., 500"
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({ ...formData, value: e.target.value })
                        }
                      />
                      <span className="flex items-center text-sm text-gray-500 px-2 bg-gray-100 rounded">
                        pts
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.value
                        ? `Worth ₦${(Number(formData.value) * 10).toLocaleString()}`
                        : "1 point = ₦10"}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                    <Input
                      id="expiresAt"
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
                      }
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for no expiration
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Summer promotional coupon"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="gap-2">
                    <Check className="h-5 w-5" />
                    {editingId ? "Update Coupon" : "Create Coupon"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {!showForm && (
          <div className="relative">
            <Input
              placeholder="Search by coupon code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4"
            />
          </div>
        )}

        {/* Coupons List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {search ? "No coupons match your search" : "No coupons created yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCoupons.map((coupon) => (
              <Card
                key={coupon.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                          {coupon.code}
                        </code>
                        <Badge
                          variant={coupon.isActive ? "default" : "secondary"}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {coupon.expiresAt &&
                          new Date(coupon.expiresAt) < new Date() && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Points Value</p>
                          <p className="font-semibold text-lg">
                            {coupon.value}{" "}
                            <span className="text-gray-400 text-sm">pts</span>
                          </p>
                            <p className="text-xs text-gray-400">
                            Worth {formatPrice(coupon.value * 10)}
                          </p>
                        </div>

                        {coupon.description && (
                          <div>
                            <p className="text-gray-500">Description</p>
                            <p className="font-medium">{coupon.description}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-gray-500">
                            {coupon.expiresAt ? "Expires" : "Created"}
                          </p>
                          <p className="font-medium">
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString()
                              : new Date(coupon.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                        className="gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(coupon.code)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && coupons.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Total Coupons</p>
                <p className="text-3xl font-bold">{coupons.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Active Coupons</p>
                <p className="text-3xl font-bold">
                  {coupons.filter((c) => c.isActive).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-gray-500 mb-1">Total Points Available</p>
                <p className="text-3xl font-bold">
                  {coupons.reduce((sum, c) => sum + c.value, 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
