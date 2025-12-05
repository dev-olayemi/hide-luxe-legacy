/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllUsers, createNotification, getAllOrders } from "@/firebase/firebaseUtils";
import { Send, Users, MessageSquare } from "lucide-react";

interface User {
  uid: string;
  email: string;
  [key: string]: any;
}

const AdminMessaging = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderQuery, setOrderQuery] = useState("");
  const [attachedOrder, setAttachedOrder] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadOrders();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers.filter((u: any): u is User => u.uid && u.email)); // Filter valid users
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadOrders = async () => {
    try {
      const all = await getAllOrders();
      setOrders(all || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderQuery) return true;
    const q = orderQuery.toLowerCase();
    return (
      (o.id && String(o.id).toLowerCase().includes(q)) ||
      (o.userEmail && String(o.userEmail).toLowerCase().includes(q))
    );
  });

  const toggleUserSelection = (uid: string) => {
    setSelectedUsers((prev) => (prev.includes(uid) ? prev.filter((x) => x !== uid) : [...prev, uid]));
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast({ title: "Missing message", description: "Please enter a message", variant: "destructive" });
      return;
    }

    let recipients: string[] = [];
    try {
      setSending(true);
      if (sendToAll) {
        const all = await getAllUsers();
        recipients = all.filter((u: any) => u.uid).map((u: any) => u.uid);
      } else {
        recipients = selectedUsers.slice();
      }

      if (recipients.length === 0) {
        toast({ title: "No recipients", description: "Select at least one user or choose broadcast", variant: "destructive" });
        setSending(false);
        return;
      }

      const payloadBase: any = {
        title: title || "Message from Hide Luxe",
        message,
        type: "admin",
        read: false,
      };

      if (attachedOrder) {
        payloadBase.metadata = { orderId: attachedOrder.id, order: attachedOrder };
        payloadBase.actionUrl = `/order/${attachedOrder.id}`;
        payloadBase.actionLabel = "View Order";
      }

      // create notifications sequentially to avoid hammering
      for (const uid of recipients) {
        await createNotification({ userId: uid, ...payloadBase });
      }

      toast({ title: "Message sent", description: `Notification sent to ${recipients.length} users` });
      setMessage("");
      setTitle("");
      setSelectedUsers([]);
      setSendToAll(false);
      setAttachedOrder(null);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({ title: "Error", description: error.message || "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User Selection */}
      <Card className="md:col-span-1 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select User
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm">Search users</Label>
            <Input
              placeholder="Email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Users ({filteredUsers.length})</Label>
            <div className="border rounded-lg p-2 h-64 overflow-y-auto space-y-1">
              {filteredUsers.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4 text-center">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <div className="flex-1">
                      <div className="font-medium truncate">{user.email}</div>
                      <div className="text-xs opacity-75 truncate">{user.uid}</div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <input type="checkbox" checked={selectedUsers.includes(user.uid)} onChange={() => toggleUserSelection(user.uid)} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedUsers(filteredUsers.map((u) => u.uid))} className="text-xs px-2 py-1 bg-slate-100 rounded">Select Visible</button>
              <button onClick={() => setSelectedUsers([])} className="text-xs px-2 py-1 bg-slate-100 rounded">Clear</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Composer */}
      <Card className="md:col-span-2 border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Message
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Send a notification to the selected user or broadcast to all users
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm">
              Title (Optional)
            </Label>
            <Input
              id="title"
              placeholder="e.g., Order Update, Special Offer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Default: "Message from Hide Luxe"
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input id="broadcast" type="checkbox" checked={sendToAll} onChange={(e) => setSendToAll(e.target.checked)} />
            <label htmlFor="broadcast" className="text-sm">Send to all users (broadcast)</label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm">
              Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Type your message here... Tell the user about their order, special offers, updates, etc."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="text-sm resize-none"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{message.length} characters</span>
              <span>Max 1000</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-semibold text-blue-900">📋 Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ Be clear and concise</li>
              <li>✓ Include order numbers or references when relevant</li>
              <li>✓ Add action items or next steps</li>
              <li>✓ Keep a professional and friendly tone</li>
            </ul>
          </div>

          {/* Order attach UI */}
          <div className="space-y-2">
            <Label className="text-sm">Attach Order (optional)</Label>
            <Input placeholder="Search orders by id or email..." value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} className="h-9 text-sm" />
            <div className="max-h-40 overflow-y-auto border rounded p-2">
              {filteredOrders.slice(0, 10).map((o) => (
                <div key={o.id} className="p-2 rounded hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{String(o.id).slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{o.userEmail || o.userId}</div>
                  </div>
                  <div>
                    <button onClick={() => setAttachedOrder(o)} className="text-xs px-2 py-1 bg-slate-100 rounded">Attach</button>
                  </div>
                </div>
              ))}
              {filteredOrders.length === 0 && <div className="text-xs text-muted-foreground p-2">No orders</div>}
            </div>
            {attachedOrder && (
              <div className="p-2 border rounded bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="font-medium">Attached: Order #{attachedOrder.id}</div>
                    <div className="text-xs text-muted-foreground">{attachedOrder.userEmail || attachedOrder.userId}</div>
                    <div className="text-xs mt-2">Items: {Array.isArray(attachedOrder.items) ? attachedOrder.items.length : 0}</div>
                  </div>
                  <div>
                    <button onClick={() => setAttachedOrder(null)} className="text-xs px-2 py-1 bg-red-100 rounded">Remove</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSendMessage}
              disabled={!selectedUsers || !message.trim() || sending}
              className="flex-1 h-11"
            >
              {sending ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMessage("");
                setTitle("");
              }}
              className="h-11"
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessaging;
