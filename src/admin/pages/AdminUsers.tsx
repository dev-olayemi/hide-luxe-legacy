/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllUsers, setUserStorePoints } from "@/firebase/firebaseUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Calendar, Mail } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.uid?.toLowerCase().includes(search.toLowerCase())
  );

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState<number | "">("");

  const startEditPoints = (user: any) => {
    setEditingUserId(user.uid);
    setEditPoints(user.storePoints || 0);
  };

  const cancelEditPoints = () => {
    setEditingUserId(null);
    setEditPoints("");
  };

  const saveEditPoints = async (uid: string) => {
    try {
      const pts = Number(editPoints) || 0;
      await setUserStorePoints(uid, pts);
      // refresh users list
      await fetchUsers();
      cancelEditPoints();
    } catch (err) {
      console.error("Failed to update points", err);
      cancelEditPoints();
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
            {/* Desktop table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">User</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Points</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Joined</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-500">
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
                              <div className="text-xs text-gray-500">UID: {String(user.uid).slice(0, 12)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role || "user"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {editingUserId === user.uid ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={String(editPoints)}
                                onChange={(e) => setEditPoints(Number(e.target.value))}
                                className="w-24 h-8 border px-2 rounded text-sm"
                              />
                              <button onClick={() => saveEditPoints(user.uid)} className="text-sm text-white bg-primary px-3 py-1 rounded">Save</button>
                              <button onClick={cancelEditPoints} className="text-sm text-muted-foreground px-2">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="font-medium">{user.storePoints ?? 0}</div>
                              <button onClick={() => startEditPoints(user)} className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200">Edit</button>
                            </div>
                          )}
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

            {/* Mobile stacked list */}
            <div className="sm:hidden p-2 space-y-3">
              {filteredUsers.length === 0 && (
                <div className="text-center text-gray-500 p-4">No users found</div>
              )}
              {filteredUsers.map((user) => (
                <div key={user.uid} className="bg-white border rounded-lg p-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {user.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500">UID: {String(user.uid).slice(0, 12)}...</div>
                      </div>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role || "user"}</Badge>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">Points</div>
                      <div className="font-medium">{user.storePoints ?? 0}</div>
                    </div>

                    {editingUserId === user.uid ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={String(editPoints)}
                          onChange={(e) => setEditPoints(Number(e.target.value))}
                          className="w-28 h-8 border px-2 rounded text-sm"
                        />
                        <button onClick={() => saveEditPoints(user.uid)} className="text-sm text-white bg-primary px-3 py-1 rounded">Save</button>
                        <button onClick={cancelEditPoints} className="text-sm text-muted-foreground px-2">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEditPoints(user)} className="text-sm px-3 py-1 bg-slate-100 rounded">Edit points</button>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Joined: {user.createdAt?.toDate?.() ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    <div>Last login: {user.lastLogin?.toDate?.() ? new Date(user.lastLogin.toDate()).toLocaleDateString() : 'Never'}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
};

export default AdminUsers;
