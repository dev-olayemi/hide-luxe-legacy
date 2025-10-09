/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseUtils";

const ADMIN_EMAILS = ["muhammednetr@gmail.com", "anotheradmin@gmail.com"];

const ADMIN_PASSWORD = "@adminA1";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!ADMIN_EMAILS.includes(email)) throw new Error("Not authorized");
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", email);
      toast({ title: "Welcome, admin!" });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-sm mx-auto mt-20 p-6 bg-white rounded shadow space-y-4"
    >
      <h2 className="text-xl font-bold mb-2">Admin Login</h2>
      <input
        className="input"
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="input"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        className="btn btn-primary w-full"
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default AdminAuth;
