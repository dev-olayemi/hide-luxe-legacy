/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signup, login } from "@/firebase/firebaseUtils";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Eye, EyeOff } from "lucide-react"; // If you use lucide-react or any icon lib
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast"; // or your toast import
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    try {
      await login(loginEmail, loginPassword);
      toast({ title: "Login successful!" });
      navigate("/");
    } catch (error: any) {
      setLoginError(error.message);
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");
    try {
      await signup(signupEmail, signupPassword);
      toast({ title: "Account created successfully!" });
      navigate("/");
    } catch (error: any) {
      setSignupError(error.message);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSent(false);
    setIsLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (error: any) {
      setResetError(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword((v) => !v)}
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {loginError && (
                  <div className="text-red-500 text-sm">{loginError}</div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-right mt-2">
                  <button
                    type="button"
                    className="text-xs text-blue-600 underline"
                    onClick={() => {
                      setResetEmail(loginEmail);
                      (
                        document.getElementById(
                          "reset-password-modal"
                        ) as HTMLDialogElement
                      )?.showModal();
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-9 text-gray-400"
                    tabIndex={-1}
                    onClick={() => setShowSignupPassword((v) => !v)}
                  >
                    {showSignupPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {signupError && (
                  <div className="text-red-500 text-sm">{signupError}</div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Sign up to save your wishlist and get exclusive updates!</p>
          </div>
        </Card>

        {/* Password Reset Modal */}
        <dialog id="reset-password-modal" className="rounded-lg p-0">
          <form
            method="dialog"
            onSubmit={handleResetPassword}
            className="bg-white p-6 rounded-lg w-80"
          >
            <h2 className="font-bold text-lg mb-2">Reset Password</h2>
            <div className="mb-4">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            {resetError && (
              <div className="text-red-500 text-sm mb-2">{resetError}</div>
            )}
            {resetSent && (
              <div className="text-green-600 text-sm mb-2">
                Password reset email sent!
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  (
                    document.getElementById(
                      "reset-password-modal"
                    ) as HTMLDialogElement
                  )?.close()
                }
              >
                Cancel
              </Button>
            </div>
          </form>
        </dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
