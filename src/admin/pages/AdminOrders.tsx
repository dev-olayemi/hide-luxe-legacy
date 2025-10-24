/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getDocs, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import AdminLayout from "../AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Package, Calendar, User, CreditCard, MapPin, Phone } from "lucide-react";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setOrders(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error fetching orders", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      toast({ title: "Order status updated" });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({ title: "Error updating order", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
            <p className="text-gray-500 mt-1">Manage and track all customer orders</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {order.createdAt.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {order.userEmail || "Guest"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status?.toUpperCase()}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total</div>
                        <div className="text-xl font-bold">₦{order.totalAmount?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery Details
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Name:</strong> {order.deliveryDetails?.fullName}</p>
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {order.deliveryDetails?.phoneNumber}
                        </p>
                        <p>{order.deliveryDetails?.address}</p>
                        <p>{order.deliveryDetails?.city}, {order.deliveryDetails?.state}</p>
                        {order.deliveryDetails?.additionalInfo && (
                          <p className="italic">Note: {order.deliveryDetails.additionalInfo}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Payment Info
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Status:</strong> {order.paymentStatus || "Pending"}</p>
                        <p><strong>Tx Ref:</strong> {order.txRef || "N/A"}</p>
                        {order.paymentDetails?.transactionId && (
                          <p><strong>Transaction ID:</strong> {order.paymentDetails.transactionId}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Order Items</h4>
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × ₦{item.price?.toLocaleString()}
                            </p>
                          </div>
                          <div className="font-semibold">
                            ₦{((item.quantity || 1) * (item.price || 0)).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
