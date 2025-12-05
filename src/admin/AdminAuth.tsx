/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "@/firebase/firebaseUtils";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const ADMIN_EMAILS = ["muhammednetr@gmail.com", "muhammedt3ch@gmail.com"];

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Must be one of the allowed admin emails
    if (!ADMIN_EMAILS.includes(email.toLowerCase())) {
      toast({
        title: "Access Denied",
        description: "This email is not authorized as admin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        // CREATE FRESH ADMIN ACCOUNT
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document with admin role
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "admin",
          name: email === "muhammednetr@gmail.com" ? "Muhammed" : "Admin",
          createdAt: serverTimestamp(),
          isSuperAdmin: true,
        });

        toast({ title: "Admin Account Created!", description: "Welcome to the control room" });
      } else {
        // NORMAL LOGIN
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Welcome back, Boss!", description: "Full access granted" });
      }

      // Save admin flag
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", email);

      // Go to dashboard
      navigate("/admin/dashboard");
    } catch (err: any) {
      let message = "Something went wrong";
      if (err.code === "auth/email-already-in-use") {
        message = "This admin email already exists. Try logging in instead.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        message = "Wrong email or password";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Try again later.";
      } else {
        message = err.message;
      }

      toast({
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: "Enter your email first" });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Check your email",
        description: "Password reset link sent!",
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-indigo-200/20">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Hide Luxe Admin
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            {isSignup ? "Create Master Admin Account" : "Admin Login"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              placeholder="e.g. muhammednetr@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder={isSignup ? "Choose a strong password" : "Enter password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 hover:bg-white transition"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isSignup ? "Creating..." : "Logging in..."}
              </>
            ) : (
              <>{isSignup ? "Create Admin Account" : "Login as Admin"}</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {!isSignup && (
            <button
              onClick={handleResetPassword}
              className="text-sm text-indigo-600 hover:text-indigo-800 underline"
            >
              Forgot password?
            </button>
          )}

          <div className="text-sm text-gray-600">
            <span> {isSignup ? "Already have account?" : "First time here?"}</span>{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="font-bold text-indigo-600 hover:text-indigo-800 underline"
              disabled={loading}
            >
              {isSignup ? "Login instead" : "Create admin account"}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Only authorized emails can access admin panel.<br />
          Contact Muhammed if you need access.
        </p>
      </div>
    </div>
  );
};

export default AdminAuth;