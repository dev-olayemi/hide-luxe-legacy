/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const docRef = doc(db, "orders", id!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast({ title: "Order not found", variant: "destructive" });
        navigate("/admin/orders");
      }
    } catch (error: any) {
      console.error("Error fetching order:", error);
      toast({ title: "Failed to load order", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "orders", id), {
        status: newStatus,
        updatedAt: new Date(),
      });
      setOrder({ ...order, status: newStatus });
      toast({ title: "Order status updated" });
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "refunded":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/admin/orders")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Order #{order.id?.slice(0, 8)}</h1>
          <p className="text-muted-foreground">
            {new Date(order.createdAt?.seconds ? order.createdAt.seconds * 1000 : Date.now()).toLocaleString()}
          </p>
        </div>
        <Badge className={getStatusColor(order.status || "pending")}>
          {order.status || "pending"}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ₦{item.price?.toLocaleString()}
                    </div>
                    {item.size && <div className="text-xs text-muted-foreground">Size: {item.size}</div>}
                    {item.color && <div className="text-xs text-muted-foreground">Color: {item.color}</div>}
                  </div>
                  <div className="font-semibold">
                    ₦{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₦{Number(order.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer & Delivery Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{order.deliveryDetails?.fullName || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{order.deliveryDetails?.email || order.userEmail || "—"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{order.deliveryDetails?.phone || "—"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {order.deliveryDetails?.address && (
                  <div>{order.deliveryDetails.address}</div>
                )}
                {order.deliveryDetails?.city && (
                  <div>{order.deliveryDetails.city}, {order.deliveryDetails.state || ""}</div>
                )}
                {order.deliveryDetails?.zipCode && (
                  <div>{order.deliveryDetails.zipCode}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <div className="text-sm text-muted-foreground">Payment Method</div>
                <div className="font-medium">{order.paymentDetails?.method || "Online Payment"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Reference</div>
                <div className="font-medium text-xs">{order.paymentDetails?.reference || "—"}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Update Status</Label>
                <Select value={order.status || "pending"} onValueChange={updateStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
