/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getOrders,
  getBespokeRequests,
  updateBespokeRequest,
  updateOrder,
} from "@/firebase/firebaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, User, ArrowRight, Eye, X } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface OrderItem {
  id: string;
  name: string;
  productName?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  deliveryDetails?: any;
  createdAt: Date;
}

interface BespokeRequest {
  id: string;
  userId: string;
  category: string;
  productType: string;
  description: string;
  specifications?: string;
  budget?: string;
  timeline?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  images?: string[];
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: Date;
}

const formatDate = (date?: Date) =>
  date
    ? date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "N/A";

const formatCurrency = (amount?: number | string) =>
  amount ? `₦${Number(amount).toLocaleString()}` : "—";

const getStatusVariant = (status?: string) =>
  (status === "pending" && "outline") ||
  (status === "processing" && "secondary") ||
  (status === "completed" && "default") ||
  (status === "cancelled" && "destructive") ||
  "outline";

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bespokeRequests, setBespokeRequests] = useState<BespokeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // bespoke modal
  const [selectedBespoke, setSelectedBespoke] = useState<BespokeRequest | null>(
    null
  );
  const [editingBespoke, setEditingBespoke] = useState<BespokeRequest | null>(
    null
  );
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [bespokeEditingMode, setBespokeEditingMode] = useState(false);

  // order modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        toast({
          title: "Authentication Required",
          description: "Please login to view your dashboard.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      try {
        setLoading(true);
        const [ordersData, bespokeData] = await Promise.all([
          getOrders(auth.currentUser.uid),
          getBespokeRequests(auth.currentUser.uid),
        ]);
        setOrders((ordersData as Order[]) || []);
        setBespokeRequests(
          ((bespokeData as BespokeRequest[]) || []).map((b) => ({
            ...b,
            createdAt:
              b.createdAt && typeof (b.createdAt as any)?.toDate === "function"
                ? (b.createdAt as any).toDate()
                : (b.createdAt as any) || new Date(),
          }))
        );
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
        toast({
          title: "Error Loading Data",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [ordersData, bespokeData] = await Promise.all([
        getOrders(auth.currentUser!.uid),
        getBespokeRequests(auth.currentUser!.uid),
      ]);
      setOrders((ordersData as Order[]) || []);
      setBespokeRequests(
        ((bespokeData as BespokeRequest[]) || []).map((b) => ({
          ...b,
          createdAt:
            b.createdAt && typeof (b.createdAt as any)?.toDate === "function"
              ? (b.createdAt as any).toDate()
              : (b.createdAt as any) || new Date(),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  // Open bespoke modal and set starting main image index
  const openBespoke = (r: BespokeRequest, startIndex = 0) => {
    setSelectedBespoke(r);
    setEditingBespoke({ ...r });
    setMainImageIndex(startIndex);
    setBespokeEditingMode(false);
  };

  const closeBespoke = () => {
    setSelectedBespoke(null);
    setEditingBespoke(null);
    setMainImageIndex(0);
    setBespokeEditingMode(false);
  };

  const saveBespokeEdits = async () => {
    if (!editingBespoke) return;
    try {
      toast({ title: "Saving bespoke request..." });
      const { id, ...payload } = editingBespoke as any;
      await updateBespokeRequest(id, payload);
      toast({ title: "Saved" });
      await refresh();
      closeBespoke();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Save failed",
        variant: "destructive",
        description: err?.message || "",
      });
    }
  };

  const cancelBespokeRequest = async (id?: string) => {
    if (!id) return;
    try {
      await updateBespokeRequest(id, { status: "cancelled" });
      toast({ title: "Request cancelled" });
      await refresh();
      closeBespoke();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Cancel failed", variant: "destructive" });
    }
  };

  // Orders: open / close
  const openOrder = (o: Order) => setSelectedOrder(o);
  const closeOrder = () => setSelectedOrder(null);

  const cancelOrder = async (orderId?: string) => {
    if (!orderId) return;
    try {
      toast({ title: "Cancelling order..." });
      await updateOrder(orderId, { status: "cancelled" });
      toast({ title: "Order cancelled" });
      await refresh();
      closeOrder();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Cancel failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-muted/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <BackButton className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-2">
                  My Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {auth.currentUser?.email?.split("@")[0]}
                </p>
              </div>
              <div>
                <Button variant="ghost" onClick={() => refresh()}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-7 w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Bespoke Requests
                    </p>
                    <p className="text-3xl font-bold">
                      {bespokeRequests.length}
                    </p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
                    <Package className="h-7 w-7 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Account</p>
                    <p className="text-xl font-semibold">Active</p>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <User className="h-7 w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-background border shadow-sm">
              <TabsTrigger
                value="orders"
                className="font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Orders
              </TabsTrigger>
              <TabsTrigger
                value="bespoke"
                className="font-semibold flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" /> Bespoke
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="font-semibold flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
            </TabsList>

            {/* ORDERS */}
            <TabsContent value="orders">
              {orders.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Start exploring our collection
                    </p>
                    <Button onClick={() => navigate("/")} size="lg">
                      Start Shopping <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card
                      key={order.id}
                      className="border-0 shadow-lg hover:shadow-xl"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className="capitalize"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center pb-3 border-b last:border-0"
                            >
                              <div>
                                <p className="font-semibold">
                                  {item.productName || item.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold">
                                  {formatCurrency(item.price)}
                                </span>
                                {item.image && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                    }}
                                    className="text-sm text-muted-foreground underline"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="pt-3 flex justify-between items-center text-lg font-bold">
                            <span>Total</span>
                            <span className="text-2xl text-primary">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Delivery: {order.deliveryDetails?.city ?? "—"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => openOrder(order)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Details
                              </Button>
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => cancelOrder(order.id)}
                                >
                                  Cancel Order
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* BESPOKE */}
            <TabsContent value="bespoke">
              <div className="flex items-center justify-between mb-4">
                <p className="text-muted-foreground">
                  {bespokeRequests.length} custom requests
                </p>
                <Button onClick={() => navigate("/bespoke")}>
                  New Request
                </Button>
              </div>

              {bespokeRequests.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                      <Package className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">
                      No bespoke requests
                    </h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Create a custom order tailored to you
                    </p>
                    <Button onClick={() => navigate("/bespoke")} size="lg">
                      Create Custom Order
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {bespokeRequests.map((r) => (
                    <Card
                      key={r.id}
                      className="border-0 shadow-md hover:shadow-xl transition"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 p-3 flex flex-col items-center bg-white">
                          {r.images && r.images.length > 0 ? (
                            <img
                              src={r.images[0]}
                              alt="thumb"
                              className="w-full h-36 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-36 bg-gray-100 rounded flex items-center justify-center text-muted-foreground">
                              No image
                            </div>
                          )}

                          <div className="mt-2 flex gap-1 w-full">
                            {(r.images || []).slice(0, 3).map((img, i) => (
                              <button
                                key={i}
                                onClick={() => openBespoke(r, i)}
                                className="h-12 w-12 overflow-hidden rounded border"
                                title="Open preview"
                              >
                                <img
                                  src={img}
                                  className="h-full w-full object-cover"
                                  alt={`mini-${i}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-3 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {r.productType}
                              </h3>
                              <div className="text-sm text-muted-foreground">
                                {r.category}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant={getStatusVariant(r.status)}
                                className="capitalize"
                              >
                                {r.status}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(r.createdAt)}
                              </div>
                            </div>
                          </div>

                          <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                            {r.description}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Budget
                              </div>
                              <div className="font-medium">
                                {formatCurrency(r.budget)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Timeline
                              </div>
                              <div className="font-medium">
                                {r.timeline ?? "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Contact
                              </div>
                              <div className="font-medium">
                                {r.contactName ?? r.contactEmail}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Phone
                              </div>
                              <div className="font-medium">
                                {r.contactPhone ?? "—"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => openBespoke(r, 0)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBespoke(r);
                                  setEditingBespoke({ ...r });
                                  setBespokeEditingMode(true);
                                }}
                              >
                                Edit
                              </Button>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              ID: <span className="font-mono">{r.id}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PROFILE */}
            <TabsContent value="profile">
              <Card className="border-0 shadow-lg">
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">
                      Email
                    </p>
                    <p className="text-lg font-semibold">
                      {auth.currentUser?.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Bespoke detail / edit modal */}
      {selectedBespoke && editingBespoke && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeBespoke}
          />
          <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-3">
            <div className="p-4 md:col-span-1 bg-gray-50 flex flex-col gap-3">
              <div className="h-72 bg-white rounded overflow-hidden flex items-center justify-center border">
                {editingBespoke.images && editingBespoke.images.length > 0 ? (
                  <img
                    src={editingBespoke.images[mainImageIndex]}
                    className="w-full h-full object-contain"
                    alt="main"
                  />
                ) : (
                  <div className="text-muted-foreground">No image</div>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(editingBespoke.images || []).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImageIndex(i)}
                    className={`h-20 w-20 rounded overflow-hidden border ${
                      i === mainImageIndex ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <img
                      src={img}
                      className="w-full h-full object-cover"
                      alt={`thumb-${i}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:col-span-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {editingBespoke.productType}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {editingBespoke.category}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={getStatusVariant(editingBespoke.status)}
                    className="capitalize"
                  >
                    {editingBespoke.status}
                  </Badge>
                  <Button variant="ghost" onClick={closeBespoke}>
                    <X />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    value={editingBespoke.description}
                    onChange={(e) =>
                      setEditingBespoke({
                        ...editingBespoke,
                        description: e.target.value,
                      })
                    }
                    readOnly={!bespokeEditingMode}
                  />
                </div>

                <div>
                  <Label>Specifications</Label>
                  <Textarea
                    rows={3}
                    value={editingBespoke.specifications || ""}
                    onChange={(e) =>
                      setEditingBespoke({
                        ...editingBespoke,
                        specifications: e.target.value,
                      })
                    }
                    readOnly={!bespokeEditingMode}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Budget</Label>
                    <Input
                      value={editingBespoke.budget || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          budget: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                    />
                  </div>
                  <div>
                    <Label>Timeline</Label>
                    <Input
                      value={editingBespoke.timeline || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          timeline: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Name</Label>
                    <Input
                      value={editingBespoke.contactName || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          contactName: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                    />
                  </div>
                  <div>
                    <Label>Contact Email</Label>
                    <Input
                      value={editingBespoke.contactEmail || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          contactEmail: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                    />
                  </div>
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingBespoke.contactPhone || ""}
                    onChange={(e) =>
                      setEditingBespoke({
                        ...editingBespoke,
                        contactPhone: e.target.value,
                      })
                    }
                    readOnly={!bespokeEditingMode}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    {!bespokeEditingMode && (
                      <Button onClick={() => setBespokeEditingMode(true)}>
                        Edit Request
                      </Button>
                    )}
                    {bespokeEditingMode && (
                      <Button onClick={saveBespokeEdits}>Save</Button>
                    )}
                    {bespokeEditingMode && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingBespoke({ ...selectedBespoke! });
                          setBespokeEditingMode(false);
                        }}
                      >
                        Revert
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => cancelBespokeRequest(editingBespoke.id)}
                    >
                      Cancel Request
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div>
                      <strong>ID:</strong>{" "}
                      <span className="font-mono">{editingBespoke.id}</span>
                    </div>
                    <div className="mt-1">
                      <strong>Submitted:</strong>{" "}
                      {formatDate(editingBespoke.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeOrder} />
          <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={getStatusVariant(selectedOrder.status)}
                    className="capitalize"
                  >
                    {selectedOrder.status}
                  </Badge>
                  <Button variant="ghost" onClick={closeOrder}>
                    <X />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <h3 className="font-semibold">Items</h3>
                  <div className="mt-2 space-y-3">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded overflow-hidden bg-gray-100">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {it.productName || it.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {it.quantity}
                          </div>
                        </div>
                        <div className="font-bold">
                          {formatCurrency(it.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Delivery Details</h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    <div>{selectedOrder.deliveryDetails?.fullName}</div>
                    <div>{selectedOrder.deliveryDetails?.address}</div>
                    <div>
                      {selectedOrder.deliveryDetails?.city}{" "}
                      {selectedOrder.deliveryDetails?.state}
                    </div>
                    <div>{selectedOrder.deliveryDetails?.phoneNumber}</div>
                    <div>{selectedOrder.deliveryDetails?.email}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedOrder.status === "pending" && (
                      <Button
                        variant="destructive"
                        onClick={() => cancelOrder(selectedOrder.id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    <Button
                      onClick={() =>
                        window.open(
                          `mailto:${selectedOrder.deliveryDetails?.email || ""}`
                        )
                      }
                    >
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
