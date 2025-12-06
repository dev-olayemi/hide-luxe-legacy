/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/firebaseUtils";
import { ShoppingBag, Users, Package, Paintbrush } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

const StatCard: React.FC<{ 
  title: string; 
  value: string | number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white shadow-sm rounded-md p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    orders: 0,
    sales: 0,
    users: 0,
    bespoke: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentBespoke, setRecentBespoke] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [ordersSnap, usersSnap, productsSnap, bespokeSnap] = await Promise.all([
        getDocs(collection(db, "orders")),
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "bespokeRequests")),
      ]);

      // Process orders
      const ordersData = ordersSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          totalAmount: data.totalAmount || 0,
          status: data.status || "pending",
          userEmail: data.userEmail || data.deliveryDetails?.email || "Guest",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      // Calculate revenue
      const totalRevenue = ordersData.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      // Get recent orders (last 5)
      const recentOrdersList = ordersData
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      // Process bespoke requests
      const bespokeData = bespokeSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      // Get recent bespoke (last 5)
      const recentBespokeList = bespokeData
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      setStats({
        orders: ordersSnap.size,
        sales: totalRevenue,
        users: usersSnap.size,
        bespoke: bespokeSnap.size,
      });

      setRecentOrders(recentOrdersList);
      setRecentBespoke(recentBespokeList);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of orders, sales and activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Sales" 
          value={formatPrice(Number(stats.sales || 0))} 
          icon={Package}
          color="bg-green-500"
        />
        <StatCard 
          title="Total Users" 
          value={stats.users} 
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard 
          title="Bespoke Requests" 
          value={stats.bespoke} 
          icon={Paintbrush}
          color="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 text-lg">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No orders yet</p>
          ) : (
            <ul className="divide-y">
              {recentOrders.map((order) => (
                <li key={order.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">#{order.id.slice(0, 8)}</div>
                    <div className="text-xs text-gray-500">
                      {order.userEmail} — {formatPrice(Number(order.totalAmount || 0))}
                    </div>
                    <div className="text-xs text-gray-400">
                      {order.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    order.status === "completed" ? "bg-green-100 text-green-700" :
                    order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    order.status === "processing" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {order.status}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4 text-lg">Recent Bespoke Requests</h2>
          {recentBespoke.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No bespoke requests yet</p>
          ) : (
            <ul className="divide-y">
              {recentBespoke.map((request) => (
                <li key={request.id} className="py-3">
                  <div className="font-medium">Bespoke #{request.id.slice(0, 8)}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {request.productType || "Custom request"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {request.createdAt.toLocaleDateString()}
                  </div>
                  <div className={`inline-block text-xs px-2 py-1 rounded mt-2 ${
                    request.status === "completed" ? "bg-green-100 text-green-700" :
                    request.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {request.status || "pending"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
