import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getOrders, db } from "@/firebase/firebaseUtils";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, Heart, User, ArrowRight, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackButton } from "@/components/BackButton";

interface Order {
  id: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: any;
}

interface BespokeRequest {
  id: string;
  category: string;
  productType: string;
  description: string;
  status: string;
  createdAt: any;
  budget?: string;
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bespokeRequests, setBespokeRequests] = useState<BespokeRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
        
        const ordersData = await getOrders(auth.currentUser.uid);
        setOrders(ordersData as Order[]);

        const bespokeQuery = query(
          collection(db, "bespokeRequests"),
          where("userId", "==", auth.currentUser.uid)
        );
        const bespokeSnapshot = await getDocs(bespokeQuery);
        const bespokeData = bespokeSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as BespokeRequest[];
        setBespokeRequests(bespokeData);
      } catch (error) {
        toast({
          title: "Error Loading Data",
          description: "Failed to load your dashboard data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      processing: "secondary",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"} className="capitalize">{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <BackButton className="mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-playfair text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  My Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                  Welcome back, {auth.currentUser?.email?.split("@")[0]}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Bespoke Requests</p>
                    <p className="text-3xl font-bold">{bespokeRequests.length}</p>
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
                    <p className="text-sm text-muted-foreground mb-1">Account Status</p>
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
              <TabsTrigger value="orders" className="font-semibold">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="bespoke" className="font-semibold">
                <Package className="w-4 h-4 mr-2" />
                Bespoke
              </TabsTrigger>
              <TabsTrigger value="profile" className="font-semibold">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              {orders.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                      <ShoppingBag className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Start exploring our premium leather collection
                    </p>
                    <Button onClick={() => navigate("/")} size="lg">
                      Start Shopping
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-muted-foreground" />
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </CardTitle>
                            <CardDescription className="mt-2 text-base">
                              {order.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) || "N/A"}
                            </CardDescription>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-0">
                              <div>
                                <p className="font-semibold">{item.productName || item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                              <span className="font-bold">₦{item.price?.toLocaleString()}</span>
                            </div>
                          ))}
                          <div className="pt-3 flex justify-between items-center text-lg font-bold">
                            <span>Total Amount</span>
                            <span className="text-2xl text-primary">₦{order.totalAmount?.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="bespoke" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-muted-foreground">
                  {bespokeRequests.length} custom {bespokeRequests.length === 1 ? 'request' : 'requests'}
                </p>
                <Button onClick={() => navigate("/bespoke")}>
                  <Package className="mr-2 h-4 w-4" />
                  New Request
                </Button>
              </div>

              {bespokeRequests.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                      <Package className="w-10 h-10 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl mb-2">No bespoke requests yet</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Create custom leather products tailored to your exact specifications
                    </p>
                    <Button onClick={() => navigate("/bespoke")} size="lg">
                      Create Custom Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bespokeRequests.map((request) => (
                    <Card key={request.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{request.productType}</CardTitle>
                            <CardDescription className="mt-1 text-base capitalize">{request.category}</CardDescription>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-muted-foreground">{request.description}</p>
                        {request.budget && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">Budget:</span>
                            <Badge variant="outline" className="text-sm">{request.budget}</Badge>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          Submitted: {request.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) || "N/A"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Account Information</CardTitle>
                  <CardDescription className="text-base">Manage your profile and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Email Address</p>
                    <p className="text-lg font-semibold">{auth.currentUser?.email}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => navigate("/wishlist")} variant="outline" size="lg" className="h-auto py-4">
                      <div className="flex flex-col items-center gap-2 w-full">
                        <Heart className="w-6 h-6 text-primary" />
                        <span className="font-semibold">View Wishlist</span>
                      </div>
                    </Button>
                    <Button onClick={() => navigate("/cart")} variant="outline" size="lg" className="h-auto py-4">
                      <div className="flex flex-col items-center gap-2 w-full">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                        <span className="font-semibold">View Cart</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
