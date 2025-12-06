/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllBespokeRequests, updateBespokeRequest } from "@/firebase/firebaseUtils";
import AdminLayout from "../AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Paintbrush, Calendar, User, Phone, Mail } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

const AdminBespoke = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getAllBespokeRequests();
      setRequests(data.sort((a: any, b: any) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({ title: "Error fetching bespoke requests", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateBespokeRequest(id, { status: newStatus });
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
      toast({ title: "Status updated successfully" });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ title: "Error updating status", variant: "destructive" });
    }
  };

  const addAdminNote = async (id: string, note: string) => {
    try {
      await updateBespokeRequest(id, { adminNotes: note });
      setRequests(requests.map((r) => (r.id === id ? { ...r, adminNotes: note } : r)));
      toast({ title: "Note added successfully" });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error adding note", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: "bg-yellow-500",
      "in-progress": "bg-blue-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500",
    };
    return colors[status] || "bg-gray-500";
  };

  const filteredRequests = filter === "all" ? requests : requests.filter((r) => r.status === filter);

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
            <h1 className="text-3xl font-bold text-gray-900">Bespoke Requests</h1>
            <p className="text-gray-500 mt-1">Manage custom product requests</p>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Paintbrush className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No bespoke requests found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Paintbrush className="h-5 w-5" />
                        Request #{request.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status?.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Customer Details
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Name:</strong> {request.name}</p>
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.phone}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Project Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Category:</strong> {request.category}</p>
                        {request.budget && <p><strong>Budget:</strong> {formatPrice(Number(request.budget))}</p>}
                        {request.deadline && <p><strong>Deadline:</strong> {request.deadline}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Project Description</h4>
                    <p className="text-sm text-gray-600 bg-slate-50 p-4 rounded-lg">
                      {request.description || request.projectDetails || "No description provided"}
                    </p>
                  </div>

                  {request.referenceImages && request.referenceImages.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Reference Images</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {request.referenceImages.map((img: string, idx: number) => (
                          <img key={idx} src={img} alt={`Reference ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Admin Notes</h4>
                      <Textarea
                        placeholder="Add internal notes..."
                        defaultValue={request.adminNotes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== request.adminNotes) {
                            addAdminNote(request.id, e.target.value);
                          }
                        }}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Select
                        value={request.status}
                        onValueChange={(val) => updateStatus(request.id, val)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBespoke;
