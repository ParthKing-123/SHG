import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Lock, User, Mail } from "lucide-react";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const findMemberShg = async (uid: string) => {
  const shgSnap = await getDocs(collection(db, "ShgGroups"));

  for (const shg of shgSnap.docs) {
    const memberRef = doc(db, "ShgGroups", shg.id, "members", uid);
    const memberSnap = await getDoc(memberRef);

    if (memberSnap.exists()) {
      return {
        shgId: shg.id,
        role: memberSnap.data().role,
      };
    }
  }

  return null;
};




interface LoginPageProps {
  onLogin: (data: {
    uid: string;
    shgId: string;
    role: "member" | "admin";
  }) => void;
  onNavigateToSignup: () => void;
}


export function LoginPage({ onLogin, onNavigateToSignup }: LoginPageProps) {
  const [memberCredentials, setMemberCredentials] = useState({
    memberId: "",
    password: ""
  });

  const [adminCredentials, setAdminCredentials] = useState({
    email: "",
    password: ""
  });

const handleMemberLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!memberCredentials.memberId || !memberCredentials.password) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    // Member logs in using EMAIL
    const userCred = await signInWithEmailAndPassword(
      auth,
      memberCredentials.memberId,
      memberCredentials.password
    );

    const user = userCred.user;

    // 🔥 FIND MEMBER SHG
    const membership = await findMemberShg(user.uid);

    if (!membership) {
      toast.error("You are not registered in any SHG");
      return;
    }

    // ✅ REAL LOGIN
    onLogin({
      uid: user.uid,
      shgId: membership.shgId,
      role: "member",
    });

    toast.success("Login successful!");

  } catch (error: any) {
    console.error(error);
    toast.error("Invalid credentials");
  }
};

const handleAdminLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!adminCredentials.email || !adminCredentials.password) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(
      auth,
      adminCredentials.email,
      adminCredentials.password
    );

    const user = userCred.user;

    // Fetch admin profile
    const adminDoc = await getDoc(doc(db, "users", user.uid));

    if (!adminDoc.exists()) {
      toast.error("Admin profile not found");
      return;
    }

    onLogin({
      uid: user.uid,
      shgId: adminDoc.data().shgId,
      role: "admin",
    });

    toast.success("Admin login successful!");

  } catch (err) {
    console.error(err);
    toast.error("Invalid admin credentials");
  }
};




  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">SHG Portal</h1>
          <p className="text-gray-600">Self Help Group Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Login to Your Account</CardTitle>
            <CardDescription>Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="member" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="member">Member</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>

              {/* Member Login */}
              <TabsContent value="member">
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-id">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="member-id"
                        placeholder="member@email"
                        value={memberCredentials.memberId}
                        onChange={(e) => setMemberCredentials({ ...memberCredentials, memberId: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="member-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="member-password"
                        type="password"
                        placeholder="••••••••"
                        value={memberCredentials.password}
                        onChange={(e) => setMemberCredentials({ ...memberCredentials, password: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Login as Member
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    <p>Demo credentials:</p>
                    <p className="text-xs">ID: PM-2023-045 | Password: member123</p>
                  </div>
                </form>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@shg.com"
                        value={adminCredentials.email}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={adminCredentials.password}
                        onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Login as Admin
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    <p>Demo credentials:</p>
                    <p className="text-xs">Email: admin@shg.com | Password: admin123</p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Signup Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={onNavigateToSignup}
                  className="text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Empowering communities through financial inclusion</p>
        </div>
      </div>
    </div>
  );
}
