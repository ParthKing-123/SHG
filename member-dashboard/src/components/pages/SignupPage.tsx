import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { User, Mail, Phone, Lock, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase"; // adjust path if needed
import { collection, getDocs } from "firebase/firestore";


interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export function SignupPage({ onNavigateToLogin }: SignupPageProps) {
  const [shgGroups, setShgGroups] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    groupName: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  useEffect(() => {
  const fetchGroups = async () => {
    try {
      const snap = await getDocs(collection(db, "ShgGroups"));
      const groups = snap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().groupName,
      }));
      setShgGroups(groups);
    } catch (err) {
      console.error("Failed to load SHGs", err);
    }
  };

  fetchGroups();
}, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.groupName) {
  toast.error("Please select a SHG group");
  return;
}

    
    // Phone number validation (India)
if (!/^[6-9]\d{9}$/.test(formData.phone)) {
  toast.error("Enter a valid 10-digit mobile number");
  return;
}

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

   try {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );

  const user = userCredential.user;

  const groupId = formData.groupName; // this is ID now

// 1️⃣ Save global user (optional but recommended)
await setDoc(doc(db, "users", user.uid), {
  uid: user.uid,
  email: formData.email,
  phoneNumber: "+91" + formData.phone,
  phoneVerified:false,
  role: "member",
  shgId: groupId,
  createdAt: serverTimestamp(),
});

// 2️⃣ Save member INSIDE SHG (THIS IS WHAT FIXES EVERYTHING)
await setDoc(
  doc(db, "ShgGroups", groupId, "members", user.uid),
  {
    uid: user.uid,
    name: formData.fullName,
    email: formData.email,
    phoneNumber: "+91" + formData.phone,
    role: "member",
    trustScore: 50,
    status: "ACTIVE",
    shgId: groupId,
    address: formData.address,
    occupation: formData.occupation,
    joinedAt: serverTimestamp(),
  }
);


  toast.success("Registration successful! Please verify your phone number.");

  setTimeout(() => {
    onNavigateToLogin();
  }, 1500);

} catch (error: any) {
  if (error.code === "auth/email-already-in-use") {
  toast.error("This email is already registered");
  return;
}

  console.error(error);
  toast.error(error.message || "Signup failed");
}

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl text-gray-900 mb-2">Join SHG Portal</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Member Registration</CardTitle>
            <CardDescription>Fill in your details to join a Self Help Group</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm text-gray-700">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="occupation"
                        placeholder="e.g., Tailor, Farmer"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="address"
                      placeholder="Your complete address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Group Selection */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm text-gray-700">Group Selection</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="groupName">Select SHG Group</Label>
                  <Select value={formData.groupName} onValueChange={(value: any) => setFormData({ ...formData, groupName: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a group to join" />
                    </SelectTrigger>
                    <SelectContent>
  {shgGroups.map(group => (
    <SelectItem key={group.id} value={group.id}>
      {group.name}
    </SelectItem>
  ))}
</SelectContent>

                  </Select>
                  <p className="text-xs text-gray-500">Your application will be reviewed by the group administrator</p>
                </div>
              </div>

              {/* Security */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm text-gray-700">Security</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked: boolean) => setFormData({ ...formData, agreeToTerms: checked === true })}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the terms and conditions of the SHG and understand that my application will be reviewed by the group administrator
                </label>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={onNavigateToLogin}
                  className="text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Login here
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
