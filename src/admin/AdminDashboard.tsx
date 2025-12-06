/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import AdminLayout from "./AdminLayout";
import AdminMessaging from "./AdminMessaging";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, Package, TrendingUp, Paintbrush, AlertCircle } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    orders: 0,
    users: 0,
    products: 0,
    revenue: 0,
    bespoke: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const { formatPrice } = useCurrency();

  const fetchDashboardData = async () => {
    try {
      const [orders, users, products, bespoke] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "bespokeRequests")),
      ]);

      const ordersData = orders.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          totalAmount: data.totalAmount || 0,
          status: data.status || "pending",
          userEmail: data.userEmail || "",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      const revenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = ordersData.filter((o) => o.status === "pending").length;
      const recent = ordersData.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

      setStats({
        orders: orders.size,
        users: users.size,
        products: products.size,
        revenue,
        bespoke: bespoke.size,
        pendingOrders,
      });
      setRecentOrders(recent);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: stats.revenue,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      link: "/admin/orders",
    },
    {
      title: "Total Orders",
      value: stats.orders,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      link: "/admin/orders",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: AlertCircle,
      color: "from-yellow-500 to-orange-600",
      link: "/admin/orders",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      link: "/admin/users",
    },
    {
      title: "Products",
      value: stats.products,
      icon: Package,
      color: "from-indigo-500 to-indigo-600",
      link: "/admin/products",
    },
    {
      title: "Bespoke Requests",
      value: stats.bespoke,
      icon: Paintbrush,
      color: "from-pink-500 to-pink-600",
      link: "/admin/bespoke-requests",
    },
  ];

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link key={idx} to={stat.link}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-700">
                        {stat.title}
                      </CardTitle>
                      <div className={`bg-gradient-to-br ${stat.color} p-2 rounded-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-gray-900">{stat.title === 'Total Revenue' ? formatPrice(Number(stat.value || 0)) : stat.value}</div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-500">{order.userEmail || "Guest"}</p>
                      <p className="text-xs text-gray-400">{order.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(Number(order.totalAmount || 0))}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        order.status === "completed" ? "bg-green-100 text-green-700" :
                        order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Messaging Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Notifications</h2>
          <AdminMessaging />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
