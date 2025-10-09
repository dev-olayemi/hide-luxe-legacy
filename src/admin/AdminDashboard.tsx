/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllUsers } from "@/firebase/firebaseUtils";
import { useNavigate, Link } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const ADMIN_EMAIL = localStorage.getItem("adminEmail");

const AdminDashboard = () => {
  const [users, setUsers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("isAdmin") !== "true") {
      navigate("/admin/auth");
      return;
    }
    getAllUsers().then(setUsers);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminEmail");
    navigate("/admin/auth");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <main className="container mx-auto py-8">
        <h1 className="font-playfair text-3xl font-bold mb-6">All Users</h1>
        <div className="overflow-x-auto rounded shadow bg-white">
          <table className="min-w-full text-left">
            <thead className="bg-accent text-white">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.uid} className="border-b hover:bg-gray-50">
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3">
                      {u.createdAt?.toDate?.()
                        ? u.createdAt.toDate().toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
