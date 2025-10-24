import React, { useEffect, useState } from "react";

const StatCard: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <div className="bg-white shadow-sm rounded-md p-5">
    <div className="text-sm text-gray-500">{title}</div>
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

  useEffect(() => {
    // TODO: fetch real stats from /api/admin/stats
    setStats({ orders: 12, sales: 125000, users: 320, bespoke: 3 });
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          Overview of orders, sales and activity
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Orders" value={stats.orders} />
        <StatCard title="Sales (₦)" value={stats.sales.toLocaleString()} />
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Bespoke Requests" value={stats.bespoke} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold mb-2">Recent Orders</h2>
          <ul className="divide-y">
            <li className="py-2 flex justify-between items-center">
              <div>
                <div className="font-medium">#OH3KOSG2</div>
                <div className="text-xs text-gray-500">Muhammad — ₦33</div>
              </div>
              <div className="text-xs text-gray-400">Processing</div>
            </li>
            {/* TODO: map actual orders */}
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h2 className="font-semibold mb-2">Recent Bespoke</h2>
          <ul className="divide-y">
            <li className="py-2">
              <div className="font-medium">Bespoke #B001</div>
              <div className="text-xs text-gray-500">
                Customer note and status
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
