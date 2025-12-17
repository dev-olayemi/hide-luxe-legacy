/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { getAllNotifications, getAllUsers, createNotification, getAllProducts } from "@/firebase/firebaseUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filterUser, setFilterUser] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [broadcastAll, setBroadcastAll] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [attachedProduct, setAttachedProduct] = useState<any | null>(null);
  const [actionUrl, setActionUrl] = useState<string>("");
  const [actionLabel, setActionLabel] = useState<string>("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [n, u, p] = await Promise.all([getAllNotifications(), getAllUsers(), getAllProducts({ adminView: true })]);
    setNotifications(n || []);
    setUsers(u || []);
    setProducts(p || []);
  };

  const filtered = filterUser ? notifications.filter((n) => n.userId === filterUser) : notifications;
  const filteredProducts = productQuery
    ? products.filter((pr) => (pr.name || pr.title || "").toLowerCase().includes(productQuery.toLowerCase()))
    : products;

  const sendToRecipients = async () => {
    const recipients = broadcastAll ? users.map((u) => u.uid) : selectedUserIds.length > 0 ? selectedUserIds : filterUser ? [filterUser] : [];
    if (recipients.length === 0) return alert("Select at least one recipient or enable Broadcast All");

    // confirm for large sends
    if (recipients.length > 50 && !confirm(`You're about to send this notification to ${recipients.length} users. Continue?`)) {
      return;
    }

    setSending(true);
    try {
      const sendPromises = recipients.map((uid) =>
        createNotification({
          userId: uid,
          type: "admin",
          title: title || "Update from Hide Luxe",
          message: message || "",
          read: false,
          actionUrl: actionUrl || (attachedProduct ? `/product/${attachedProduct.id}` : undefined),
          actionLabel: actionLabel || (attachedProduct ? "View product" : undefined),
          metadata: attachedProduct ? { product: { id: attachedProduct.id, name: attachedProduct.name || attachedProduct.title, image: attachedProduct.images?.[0] || attachedProduct.image } } : undefined,
        } as any)
      );

      await Promise.all(sendPromises);
      setTitle("");
      setMessage("");
      setSelectedUserIds([]);
      setAttachedProduct(null);
      setActionUrl("");
      setActionLabel("");
      await fetchData();
      alert(`Sent to ${recipients.length} users`);
    } catch (err) {
      console.error(err);
      alert("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-gray-600">View all notifications and send updates to users</p>
      </div>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-1">
              <label className="text-xs font-medium">Recipients</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={broadcastAll} onChange={(e) => setBroadcastAll(e.target.checked)} />
                  <span className="text-sm">Broadcast to all users</span>
                </div>

                <div className="text-xs text-muted-foreground">Or select multiple users</div>
                <div className="max-h-44 overflow-y-auto border rounded p-2 bg-white">
                  {users.map((u) => (
                    <label key={u.uid} className="flex items-center justify-between gap-2 p-1 hover:bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.uid)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedUserIds((s) => Array.from(new Set([...s, u.uid])));
                            else setSelectedUserIds((s) => s.filter((id) => id !== u.uid));
                          }}
                        />
                        <div className="text-sm">{u.email || u.uid}</div>
                      </div>
                      <div className="text-xs text-gray-400">{u.role || 'user'}</div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="text-xs font-medium">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mb-2" />
              <label className="text-xs font-medium">Message</label>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} className="mb-2" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-xs">Attach product (optional)</label>
                  <Input placeholder="Search products..." value={productQuery} onChange={(e) => setProductQuery(e.target.value)} className="mb-2" />
                  <div className="max-h-36 overflow-y-auto border rounded bg-white p-1">
                    {filteredProducts.slice(0, 20).map((pr) => (
                      <div key={pr.id} className="flex items-center justify-between p-1 hover:bg-slate-50 rounded">
                        <div className="text-sm">{pr.name || pr.title}</div>
                        <div>
                          <button onClick={() => setAttachedProduct(pr)} className="text-xs px-2 py-1 bg-slate-100 rounded">Attach</button>
                        </div>
                      </div>
                    ))}
                    {filteredProducts.length === 0 && <div className="text-xs text-muted-foreground p-2">No products</div>}
                  </div>
                  {attachedProduct && (
                    <div className="mt-2 p-2 border rounded bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">Attached: {attachedProduct.name || attachedProduct.title}</div>
                          <div className="text-xs text-gray-500">ID: {attachedProduct.id}</div>
                        </div>
                        <button onClick={() => setAttachedProduct(null)} className="text-xs px-2 py-1 bg-red-100 rounded">Remove</button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs">Action link (optional)</label>
                  <Input placeholder="https://example.com/path" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)} className="mb-2" />
                  <label className="text-xs">Action label</label>
                  <Input placeholder="View details" value={actionLabel} onChange={(e) => setActionLabel(e.target.value)} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Button onClick={sendToRecipients} disabled={sending}>{sending ? 'Sending…' : 'Send Notification'}</Button>
                <Button variant="ghost" onClick={() => { setTitle(''); setMessage(''); setSelectedUserIds([]); setAttachedProduct(null); setActionUrl(''); setActionLabel(''); }}>Clear</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-3">Showing {filtered.length} notifications {filterUser ? `for ${filterUser}` : ''}</div>
          <div className="space-y-2">
            {filtered.map((n) => (
              <div key={n.id} className="p-3 border rounded bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{n.title}</div>
                    <div className="text-xs text-gray-500">to {n.userId}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(n.createdAt?.toDate ? n.createdAt.toDate() : n.createdAt || Date.now()).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm">{n.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
