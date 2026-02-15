import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Shield, CheckCircle, Users, TrendingUp } from "lucide-react";

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase"; // ✅ Update path if needed
 import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
interface LoginPageProps {
  onLoginSuccess: (data: {
    uid: string;
    role: "admin" | "member";
    shgId: string | null;
  }) => void;
  onShowSignup: () => void;
}


export function LoginPage({ onLoginSuccess , onShowSignup}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      const uid = user.uid;

      // 🔥 fetch Firestore profile
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) throw new Error("User profile missing");

      const { role, shgId } = snap.data();
      if(role != "admin") throw new Error("You are not admin");
      // pass data upward
      onLoginSuccess({
        uid,
        role,
        shgId: shgId ?? null
      });

    } catch (err: unknown) {
      await signOut(auth); 
      setError("something");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex">
      {/* Left Side UI remains unchanged */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-600 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Shield className="w-7 h-7 text-teal-600" />
            </div>
            <div>
              <h1 className="text-white text-3xl">TrustLedger</h1>
              <p className="text-teal-100 text-sm">Digital-Powered SHG Management</p>
            </div>
          </div>

          <div className="space-y-6 mt-16">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg mb-1">Verified Transactions</h3>
                <p className="text-teal-100 text-sm">Every transaction is recorded on the firebase</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg mb-1">Member Trust Scores</h3>
                <p className="text-teal-100 text-sm">Track member integrity transparently.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-lg mb-1">Real-Time Analytics</h3>
                <p className="text-teal-100 text-sm">Data-driven performance insights.</p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-teal-100 text-sm mt-8">Trusted by 500+ SHGs</p>
      </div>

      {/* Right Side with Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Card className="border-gray-200 shadow-lg">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white shadow-md"
                >
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <button
                        onClick={() => onShowSignup()}
                        className="text-teal-600 hover:underline"
                        >
                        Create now
                        </button>
                    </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
