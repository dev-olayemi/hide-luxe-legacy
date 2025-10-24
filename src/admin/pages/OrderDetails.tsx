/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const OrderDetails: React.FC = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    // TODO: fetch `/api/admin/orders/${id}`
    setOrder({
      id,
      total: 125000,
      status: "processing",
      items: [{ name: "Classic Oxford Black", qty: 1, price: 125000 }],
    });
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">Order #{order.id}</h1>
          <p className="text-sm text-gray-500">Status: {order.status}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="font-medium mb-2">Items</h2>
        <ul className="divide-y">
          {order.items.map((it: any, idx: number) => (
            <li key={idx} className="py-2 flex justify-between">
              <div>{it.name}</div>
              <div>Qty: {it.qty}</div>
              <div>₦{it.price.toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
