import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, getOrders, db } from "@/firebase/firebaseUtils";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Package, Heart, User } from "lucide-react";

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
        
        // Fetch orders
        const ordersData = await getOrders(auth.currentUser.uid);
        setOrders(ordersData as Order[]);

        // Fetch bespoke requests
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
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="font-heading text-4xl mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your orders, bespoke requests, and account
          </p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="bespoke">
              <Package className="w-4 h-4 mr-2" />
              Bespoke Requests
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No orders yet</p>
                  <Button onClick={() => navigate("/")}>Start Shopping</Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          {order.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </CardDescription>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.productName || item.name}</span>
                          <span>
                            {item.quantity} × ₦{item.price?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                        <span>Total</span>
                        <span>₦{order.totalAmount?.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bespoke" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {bespokeRequests.length} bespoke request(s)
              </p>
              <Button onClick={() => navigate("/bespoke")}>New Request</Button>
            </div>

            {bespokeRequests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No bespoke requests yet</p>
                  <Button onClick={() => navigate("/bespoke")}>Create Custom Order</Button>
                </CardContent>
              </Card>
            ) : (
              bespokeRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{request.productType}</CardTitle>
                        <CardDescription>{request.category}</CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-2">{request.description}</p>
                    {request.budget && (
                      <p className="text-sm text-muted-foreground">Budget: {request.budget}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Submitted: {request.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{auth.currentUser?.email}</p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={() => navigate("/wishlist")} variant="outline">
                    <Heart className="w-4 h-4 mr-2" />
                    View Wishlist
                  </Button>
                  <Button onClick={() => navigate("/cart")} variant="outline">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
