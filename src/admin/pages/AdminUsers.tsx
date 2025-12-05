/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllUsers, setUserStorePoints } from "@/firebase/firebaseUtils";
import AdminLayout from "../AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Calendar, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStorePointsChange = async (
    uid: string,
    currentPoints: number,
    value: string
  ) => {
    const parsed = Number(value);
    const nextPoints = Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
    if (nextPoints === currentPoints) return;

    try {
      await setUserStorePoints(uid, nextPoints);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, storePoints: nextPoints } : u))
      );
      toast({
        title: "Store points updated",
        description: `User now has ${nextPoints} points.`,
      });
    } catch (err: any) {
      console.error("Failed to update store points", err);
      toast({
        title: "Update failed",
        description: err?.message || "Could not update store points",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.uid?.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">View and manage all registered users</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by email or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {users.length} Users
          </Badge>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">User</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Store Points</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.uid} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {user.email?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <Mail className="h-3 w-3 text-gray-400" />
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-500">UID: {user.uid.slice(0, 12)}...</div>
                            </div>
                          </div>
                        </td>
                      <td className="p-4">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                          {user.role || "user"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            defaultValue={user.storePoints ?? 0}
                            className="w-24 h-9"
                            onBlur={(e) =>
                              handleStorePointsChange(
                                user.uid,
                                user.storePoints ?? 0,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt?.toDate?.()
                            ? new Date(user.createdAt.toDate()).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {user.lastLogin?.toDate?.()
                            ? new Date(user.lastLogin.toDate()).toLocaleDateString()
                            : "Never"}
                        </div>
                      </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
