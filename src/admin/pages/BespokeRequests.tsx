/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Calendar, Package, DollarSign, Clock, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCurrency } from '@/contexts/CurrencyContext';

const BespokeRequests = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "bespokeRequests"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setItems(list);
    } catch (err: any) {
      console.error("Failed to load bespoke requests", err);
      toast({ title: "Failed to load requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bespokeRequests", id), {
        status,
        updatedAt: new Date(),
      });
      setItems((s) => s.map((it) => (it.id === id ? { ...it, status } : it)));
      toast({ title: "Status updated successfully" });
    } catch (err: any) {
      console.error("Update failed", err);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredItems = filter === "all" 
    ? items 
    : items.filter((item) => item.status === filter);

  const { formatPrice } = useCurrency();

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
          <h1 className="text-3xl font-bold">Bespoke Requests</h1>
          <p className="text-muted-foreground">Manage custom product requests</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredItems.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {request.productType || "Custom Request"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(request.createdAt?.seconds ? request.createdAt.seconds * 1000 : Date.now()).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusColor(request.status || "pending")}>
                  {request.status || "pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Contact Name</div>
                      <div className="font-medium">{request.contactName || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium">{request.contactEmail || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="font-medium">{request.contactPhone || "—"}</div>
                    </div>
                  </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Category</div>
                      <div className="font-medium">{request.category || "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Budget</div>
                      <div className="font-medium">{request.budget ? formatPrice(Number(request.budget)) : "—"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Timeline</div>
                      <div className="font-medium">{request.timeline || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Description */}
              {request.description && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-medium">Description</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              {/* Specifications */}
              {request.specifications && (
                <div className="mb-4">
                  <div className="text-sm font-medium mb-1">Specifications</div>
                  <p className="text-sm text-muted-foreground">{request.specifications}</p>
                </div>
              )}

              {/* Images */}
              {request.images && request.images.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm font-medium">Reference Images ({request.images.length})</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {request.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Reference ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Actions */}
              <div className="flex gap-2">
                <Select
                  value={request.status || "pending"}
                  onValueChange={(status) => updateStatus(request.id, status)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bespoke requests found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BespokeRequests;
