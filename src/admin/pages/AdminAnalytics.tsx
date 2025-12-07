/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import AdminLayout from "../AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, Users, DollarSign, Package, Paintbrush } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

const AdminAnalytics = () => {
  const { formatPrice } = useCurrency();

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    bespokeRequests: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [orders, users, products, bespoke] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "bespokeRequests")),
      ]);

      const ordersData = orders.docs.map((d) => d.data());
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const pendingOrders = ordersData.filter((o) => o.status === "pending").length;

      setStats({
        totalOrders: orders.size,
        totalRevenue,
        totalUsers: users.size,
        totalProducts: products.size,
        bespokeRequests: bespoke.size,
        pendingOrders,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: DollarSign,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Package,
      color: "from-yellow-500 to-orange-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Bespoke Requests",
      value: stats.bespokeRequests,
      icon: Paintbrush,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your business metrics</p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className={`${stat.bgColor} pb-3`}>
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
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-3xl font-bold text-gray-900">{stat.title === 'Total Revenue' ? formatPrice(Number(stat.value || 0)) : stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-gray-700">Average Order Value</span>
                <span className="font-bold text-lg">
                  {stats.totalOrders > 0 ? formatPrice(Math.round(stats.totalRevenue / stats.totalOrders)) : formatPrice(0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-gray-700">Conversion Rate (Orders/Users)</span>
                <span className="font-bold text-lg">
                  {stats.totalUsers > 0 ? ((stats.totalOrders / stats.totalUsers) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="text-gray-700">Bespoke Conversion (Requests/Orders)</span>
                <span className="font-bold text-lg">
                  {stats.totalOrders > 0 ? ((stats.bespokeRequests / stats.totalOrders) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
