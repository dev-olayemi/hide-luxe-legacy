/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  getOrders,
  getBespokeRequests,
  updateBespokeRequest,
  updateOrder,
  createRefund,
  getRefunds,
  updateRefund,
  getUserProfile,
} from "@/firebase/firebaseUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, User, ArrowRight, Eye, X, Gift, RefreshCw, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateStorePointsValue } from "@/config/storePointsConfig";

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
  const [userProfile, setUserProfile] = useState<any>(null);
  const [storePoints, setStorePoints] = useState(0);

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
  const [refunds, setRefunds] = useState<any[]>([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState<any>({
    orderId: "",
    reason: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    acceptPolicy: false,
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState<any>({ orderId: "", reason: "" });

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
        const [ordersData, bespokeData, refundsData, profileData] = await Promise.all([
          getOrders(auth.currentUser.uid),
          getBespokeRequests(auth.currentUser.uid),
          getRefunds(auth.currentUser.uid),
          getUserProfile(auth.currentUser.uid),
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
        setRefunds((refundsData as any[]) || []);
        setUserProfile(profileData || {});
        setStorePoints(profileData?.storePoints || 0);
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
      const [ordersData, bespokeData, refundsData, profileData] = await Promise.all([
        getOrders(auth.currentUser!.uid),
        getBespokeRequests(auth.currentUser!.uid),
        getRefunds(auth.currentUser!.uid),
        getUserProfile(auth.currentUser!.uid),
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
      setRefunds((refundsData as any[]) || []);
      setUserProfile(profileData || {});
      setStorePoints(profileData?.storePoints || 0);
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

  // Refund helpers
  const openRefundModalForOrder = (order: Order) => {
    setRefundForm({
      orderId: order.id,
      reason: "",
      bankName: "",
      accountName: auth.currentUser?.email?.split("@")[0] || "",
      accountNumber: "",
    });
    setShowRefundModal(true);
  };

  const closeRefundModal = () => {
    setShowRefundModal(false);
    setRefundForm({ orderId: "", reason: "", bankName: "", accountName: "", accountNumber: "" });
  };

  const submitRefund = async () => {
    if (!refundForm.orderId) return;
    if (!refundForm.reason || refundForm.reason.trim().length < 5) {
      toast({ title: "Please provide a valid reason for the refund.", variant: "destructive" });
      return;
    }
    if (!refundForm.bankName || !refundForm.accountName || !refundForm.accountNumber) {
      toast({ title: "Please provide your settlement account details.", variant: "destructive" });
      return;
    }
    // Validate account number: digits only, 10-20 characters
    const accountRegex = /^\d{10,20}$/;
    if (!accountRegex.test(refundForm.accountNumber)) {
      toast({ title: "Account number must be 10-20 digits.", variant: "destructive" });
      return;
    }
    if (!refundForm.acceptPolicy) {
      toast({ title: "Please accept the refund policy before submitting.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Submitting refund request..." });
      await createRefund({
        userId: auth.currentUser!.uid,
        userEmail: auth.currentUser!.email,
        orderId: refundForm.orderId,
        reason: refundForm.reason,
        bankDetails: {
          bankName: refundForm.bankName,
          accountName: refundForm.accountName,
          accountNumber: refundForm.accountNumber,
        },
        status: "pending",
      });
      toast({ title: "Refund requested. We'll get back to you via email." });
      await refresh();
      closeRefundModal();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Refund failed", variant: "destructive", description: err?.message || "" });
    }
  };

  const cancelRefundById = async (refundId?: string) => {
    if (!refundId) return;
    try {
      await updateRefund(refundId, { status: "cancelled" });
      toast({ title: "Refund cancelled" });
      await refresh();
    } catch (err: any) {
      console.error(err);
      toast({ title: "Cancel failed", variant: "destructive" });
    }
  };

  // Cancellation helpers: show form then cancel on submit
  const openCancelModalForOrder = (order: Order) => {
    setCancelForm({ orderId: order.id, reason: "" });
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelForm({ orderId: "", reason: "" });
  };

  const submitCancelOrder = async () => {
    if (!cancelForm.orderId) return;
    try {
      toast({ title: "Submitting cancellation..." });
      const orderBeingCancelled = orders.find((o) => o.id === cancelForm.orderId);
      await updateOrder(cancelForm.orderId, { status: "cancelled" });
      
      // Auto-create refund if order was paid/completed
      if (orderBeingCancelled && (orderBeingCancelled.paymentStatus === "paid" || orderBeingCancelled.status === "completed")) {
        await createRefund({
          userId: auth.currentUser!.uid,
          userEmail: auth.currentUser!.email,
          orderId: cancelForm.orderId,
          reason: `Order cancellation: ${cancelForm.reason}`,
          status: "pending",
          bankDetails: { bankName: "", accountName: "", accountNumber: "" },
          autoCreatedFromCancellation: true,
        });
        toast({ title: "Order cancelled. A refund request has been created and we'll contact you." });
      } else {
        toast({ title: "Order cancelled" });
      }
      await refresh();
      closeCancelModal();
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
                    {/* Store Points card */}
                    <div className="mt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-gray-500">Store Points</div>
                              <div className="text-2xl font-semibold">{storePoints} points</div>
                              <div className="text-sm text-gray-600">Worth: {calculateStorePointsValue(storePoints).toLocaleString ? `₦${calculateStorePointsValue(storePoints).toLocaleString()}` : `₦${calculateStorePointsValue(storePoints)}`}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">Redeemable at checkout</div>
                            </div>
                          </div>
                          {storePoints === 0 && (
                            <div className="mt-3 text-sm text-gray-500">You currently have 0 store points. Check back later when the store adds points for you.</div>
                          )}
                        </div>
                      </div>
                    </div>
              </div>
              <div>
                <Button variant="ghost" onClick={() => refresh()}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                      Total Orders
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{orders.length}</p>
                  </div>
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <ShoppingBag className="h-5 w-5 md:h-7 md:w-7 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">
                      Pending Refunds
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">
                      {refunds.filter((r: any) => r.status === 'pending').length}
                    </p>
                  </div>
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <RefreshCw className="h-5 w-5 md:h-7 md:w-7 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-muted-foreground font-medium">Bespoke Requests</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">
                      {bespokeRequests.length}
                    </p>
                  </div>
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 ml-2">
                    <Package className="h-5 w-5 md:h-7 md:w-7 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs md:text-sm text-green-700 font-medium">Store Points</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 text-green-700">{storePoints}</p>
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      ₦{calculateStorePointsValue(storePoints).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 ml-2">
                    <Gift className="h-5 w-5 md:h-7 md:w-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 h-auto md:h-12 bg-background border shadow-sm">
              <TabsTrigger
                value="orders"
                className="text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 py-2 md:py-0"
              >
                <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" /> 
                <span className="hidden sm:inline">Orders</span>
                <span className="sm:hidden">Orders</span>
              </TabsTrigger>
              <TabsTrigger
                value="bespoke"
                className="text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 py-2 md:py-0"
              >
                <Package className="w-3 h-3 md:w-4 md:h-4" /> 
                <span className="hidden sm:inline">Bespoke</span>
                <span className="sm:hidden">Custom</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                className="text-xs md:text-sm font-semibold flex items-center justify-center gap-1 md:gap-2 py-2 md:py-0"
              >
                <User className="w-3 h-3 md:w-4 md:h-4" /> 
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Account</span>
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
                      className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <CardTitle className="text-base md:text-lg">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </CardTitle>
                            <div className="text-xs md:text-sm text-muted-foreground mt-1">
                              {formatDate(order.createdAt)}
                            </div>
                          </div>
                          <Badge
                            variant={getStatusVariant(order.status)}
                            className="capitalize text-xs md:text-sm"
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
                              className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b last:border-0 gap-2"
                            >
                              <div className="flex-1">
                                <p className="text-sm md:text-base font-semibold">
                                  {item.productName || item.name}
                                </p>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  Qty: {item.quantity}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-4">
                                <span className="font-bold text-sm md:text-base">
                                  {formatCurrency(item.price)}
                                </span>
                                {item.image && (
                                  <button
                                    onClick={() => {
                                      setSelectedOrder(order);
                                    }}
                                    className="text-xs md:text-sm text-muted-foreground underline"
                                  >
                                    View
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}

                          <div className="pt-3 flex justify-between items-center">
                            <span className="text-sm md:text-base font-bold">Total</span>
                            <span className="text-lg md:text-2xl font-bold text-primary">
                              {formatCurrency(order.totalAmount)}
                            </span>
                          </div>

                          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
                            <div className="text-xs md:text-sm text-muted-foreground">
                              Delivery: {order.deliveryDetails?.city ?? "—"}
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                              <Button
                                size="sm"
                                onClick={() => openOrder(order)}
                                className="text-xs md:text-sm h-8 md:h-9"
                              >
                                <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                Details
                              </Button>
                              {/* Refund status / actions */}
                              {refunds.find((f) => f.orderId === order.id) ? (
                                <>
                                  <Badge
                                    variant={getStatusVariant(
                                      refunds.find((f) => f.orderId === order.id)?.status
                                    )}
                                    className="capitalize text-xs whitespace-nowrap"
                                  >
                                    Refund: {refunds.find((f) => f.orderId === order.id)?.status}
                                  </Badge>
                                  {refunds.find((f) => f.orderId === order.id)?.status !== "successful" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        cancelRefundById(refunds.find((f) => f.orderId === order.id)?.id)
                                      }
                                      className="text-xs md:text-sm h-8 md:h-9"
                                    >
                                      Cancel Refund
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => openRefundModalForOrder(order)}
                                  className="text-xs md:text-sm h-8 md:h-9"
                                >
                                  Request Refund
                                </Button>
                              )}
                              {order.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openCancelModalForOrder(order)}
                                  className="text-xs md:text-sm h-8 md:h-9"
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
                <div className="grid gap-4 md:gap-6">
                  {bespokeRequests.map((r) => (
                    <Card
                      key={r.id}
                      className="border-0 shadow-md hover:shadow-xl transition-shadow"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-0">
                        <div className="md:col-span-1 p-3 flex flex-col items-center bg-white">
                          {r.images && r.images.length > 0 ? (
                            <img
                              src={r.images[0]}
                              alt="thumb"
                              className="w-full h-24 md:h-32 object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-24 md:h-32 bg-gray-100 rounded flex items-center justify-center text-xs md:text-sm text-muted-foreground">
                              No image
                            </div>
                          )}

                          <div className="mt-2 flex gap-1 w-full">
                            {(r.images || []).slice(0, 3).map((img, i) => (
                              <button
                                key={i}
                                onClick={() => openBespoke(r, i)}
                                className="h-10 w-10 md:h-12 md:w-12 overflow-hidden rounded border hover:opacity-75 transition"
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

                        <div className="md:col-span-3 p-3 md:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <h3 className="text-base md:text-lg font-semibold">
                                {r.productType}
                              </h3>
                              <div className="text-xs md:text-sm text-muted-foreground">
                                {r.category}
                              </div>
                            </div>

                            <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
                              <Badge
                                variant={getStatusVariant(r.status)}
                                className="capitalize text-xs md:text-sm"
                              >
                                {r.status}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(r.createdAt)}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
                            {r.description}
                          </p>

                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
                            <div>
                              <div className="text-xs text-muted-foreground font-medium">Budget</div>
                              <div className="font-semibold md:font-medium">
                                {formatCurrency(r.budget)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground font-medium">Timeline</div>
                              <div className="font-semibold md:font-medium">
                                {r.timeline ?? "—"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground font-medium">Contact</div>
                              <div className="font-semibold md:font-medium text-xs">
                                {r.contactName ?? r.contactEmail}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground font-medium">Phone</div>
                              <div className="font-semibold md:font-medium text-xs">
                                {r.contactPhone ?? "—"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => openBespoke(r, 0)}
                              className="text-xs md:text-sm h-8 md:h-9"
                            >
                              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
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
                              className="text-xs md:text-sm h-8 md:h-9"
                            >
                              Edit
                            </Button>
                            <div className="text-xs text-muted-foreground md:hidden">
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
                <CardContent className="space-y-4 md:space-y-6">
                  <div className="p-3 md:p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2">
                      Email
                    </p>
                    <p className="text-base md:text-lg font-semibold break-all">
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeBespoke}
          />
          <div className="relative w-full md:w-full md:max-w-5xl bg-white rounded-t-2xl md:rounded-lg shadow-2xl overflow-y-auto max-h-screen md:max-h-[90vh] grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-4">
            <div className="md:col-span-1 p-4 md:p-3 flex flex-col gap-3 bg-white md:bg-gray-50">
              <div className="h-48 md:h-72 bg-white rounded overflow-hidden flex items-center justify-center border">
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
                    className={`h-16 w-16 rounded overflow-hidden border flex-shrink-0 ${
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

            <div className="p-6 md:p-6 md:col-span-2 overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    {editingBespoke.productType}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {editingBespoke.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  <Badge
                    variant={getStatusVariant(editingBespoke.status)}
                    className="capitalize text-xs"
                  >
                    {editingBespoke.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={closeBespoke} className="p-1">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm">Description</Label>
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
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-sm">Specifications</Label>
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
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Budget</Label>
                    <Input
                      value={editingBespoke.budget || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          budget: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                      className="text-sm h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Timeline</Label>
                    <Input
                      value={editingBespoke.timeline || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          timeline: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                      className="text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm">Contact Name</Label>
                    <Input
                      value={editingBespoke.contactName || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          contactName: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                      className="text-sm h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Contact Email</Label>
                    <Input
                      value={editingBespoke.contactEmail || ""}
                      onChange={(e) =>
                        setEditingBespoke({
                          ...editingBespoke,
                          contactEmail: e.target.value,
                        })
                      }
                      readOnly={!bespokeEditingMode}
                      className="text-sm h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={editingBespoke.contactPhone || ""}
                    onChange={(e) =>
                      setEditingBespoke({
                        ...editingBespoke,
                        contactPhone: e.target.value,
                      })
                    }
                    readOnly={!bespokeEditingMode}
                    className="text-sm h-9"
                  />
                </div>

                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-2 pt-4 border-t">
                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    {!bespokeEditingMode && (
                      <Button onClick={() => setBespokeEditingMode(true)} className="text-sm w-full md:w-auto">
                        Edit Request
                      </Button>
                    )}
                    {bespokeEditingMode && (
                      <Button onClick={saveBespokeEdits} className="text-sm w-full md:w-auto">Save</Button>
                    )}
                    {bespokeEditingMode && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingBespoke({ ...selectedBespoke! });
                          setBespokeEditingMode(false);
                        }}
                        className="text-sm w-full md:w-auto"
                      >
                        Revert
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={() => cancelBespokeRequest(editingBespoke.id)}
                      className="text-sm w-full md:w-auto"
                    >
                      Cancel Request
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center md:text-right w-full md:w-auto">
                    <div>
                      <strong>ID:</strong> <span className="font-mono text-xs">{editingBespoke.id}</span>
                    </div>
                    <div className="mt-1">
                      <strong>Submitted:</strong> {formatDate(editingBespoke.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund modal */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeRefundModal} />
          <div className="relative w-full md:w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-lg shadow-2xl overflow-y-auto max-h-screen md:max-h-[90vh]">
            <div className="p-6 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold">Request Refund</h2>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">We will get back to you via email</div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeRefundModal} className="p-1 flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label className="text-sm">Order Tracking ID</Label>
                  <Input value={refundForm.orderId} readOnly className="text-sm h-9" />
                </div>

                <div>
                  <Label className="text-sm">Reason for Refund</Label>
                  <Textarea
                    rows={4}
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                    className="text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Bank Name</Label>
                    <Input value={refundForm.bankName} onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })} className="text-sm h-9" />
                  </div>
                  <div>
                    <Label className="text-sm">Account Name</Label>
                    <Input value={refundForm.accountName} onChange={(e) => setRefundForm({ ...refundForm, accountName: e.target.value })} className="text-sm h-9" />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Account Number (10-20 digits)</Label>
                  <Input 
                    value={refundForm.accountNumber} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 20);
                      setRefundForm({ ...refundForm, accountNumber: val });
                    }}
                    placeholder="Enter account number (digits only)"
                    className="text-sm h-9"
                  />
                </div>

                <div className="text-xs md:text-sm text-muted-foreground space-y-3 p-3 bg-amber-50 rounded border border-amber-200">
                  <p>
                    By submitting this refund request you agree to our refund policy. Please ensure the settlement account above is where you'd like to receive your refund.
                    <br />
                    Read the full policy <a href="/exchange-return-policy" target="_blank" rel="noopener noreferrer" className="underline font-medium text-amber-700 hover:text-amber-900">here</a>.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      id="acceptPolicy"
                      type="checkbox"
                      checked={refundForm.acceptPolicy}
                      onChange={(e) => setRefundForm({ ...refundForm, acceptPolicy: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <label htmlFor="acceptPolicy" className="text-xs md:text-sm font-medium cursor-pointer">I accept the refund policy</label>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={closeRefundModal} className="text-sm w-full md:w-auto">Close</Button>
                  <Button onClick={submitRefund} className="text-sm w-full md:w-auto">Submit Refund</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeCancelModal} />
          <div className="relative w-full md:w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-lg shadow-2xl overflow-y-auto max-h-screen md:max-h-[90vh]">
            <div className="p-6 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold">Cancel Order</h2>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">Please tell us why you want to cancel.</div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeCancelModal} className="p-1 flex-shrink-0">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <Label className="text-sm">Order Tracking ID</Label>
                  <Input value={cancelForm.orderId} readOnly className="text-sm h-9" />
                </div>

                <div>
                  <Label className="text-sm">Reason for Cancellation</Label>
                  <Textarea rows={4} value={cancelForm.reason} onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })} className="text-sm" />
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={closeCancelModal} className="text-sm w-full md:w-auto">Close</Button>
                  <Button variant="destructive" onClick={submitCancelOrder} className="text-sm w-full md:w-auto">Submit Cancellation</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeOrder} />
          <div className="relative w-full md:w-full md:max-w-4xl bg-white rounded-t-2xl md:rounded-lg shadow-2xl overflow-y-auto max-h-screen md:max-h-[90vh]">
            <div className="p-6 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(selectedOrder.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge
                    variant={getStatusVariant(selectedOrder.status)}
                    className="capitalize text-xs"
                  >
                    {selectedOrder.status}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={closeOrder} className="p-1">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:gap-6">
                <div>
                  <h3 className="font-semibold text-sm md:text-base mb-3">Items</h3>
                  <div className="mt-2 space-y-3">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-3 md:gap-4">
                        <div className="h-12 w-12 md:h-16 md:w-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm md:text-base truncate">
                            {it.productName || it.name}
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground">
                            Qty: {it.quantity}
                          </div>
                        </div>
                        <div className="font-bold text-sm md:text-base flex-shrink-0">
                          {formatCurrency(it.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm md:text-base mb-3">Delivery Details</h3>
                  <div className="mt-2 text-xs md:text-sm text-muted-foreground space-y-2">
                    <div className="font-medium text-foreground">{selectedOrder.deliveryDetails?.fullName}</div>
                    <div>{selectedOrder.deliveryDetails?.address}</div>
                    <div>
                      {selectedOrder.deliveryDetails?.city} {selectedOrder.deliveryDetails?.state}
                    </div>
                    <div>{selectedOrder.deliveryDetails?.phoneNumber}</div>
                    <div>{selectedOrder.deliveryDetails?.email}</div>
                  </div>
                </div>

                <div className="border-t pt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs md:text-sm text-muted-foreground">Total</div>
                    <div className="text-xl md:text-2xl font-bold">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                    {selectedOrder.status === "pending" && (
                      <Button
                        variant="destructive"
                        onClick={() => openCancelModalForOrder(selectedOrder)}
                        className="text-sm w-full md:w-auto"
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
                      className="text-sm w-full md:w-auto"
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
