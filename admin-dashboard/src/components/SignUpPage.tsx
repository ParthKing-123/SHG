// import { useState } from "react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// import { auth, db } from "./firebase";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";

// interface SignupPageProps {
//   onSignupSuccess: () => void;
//   onShowLogin: () => void;
// }

// export function SignupPage({ onSignupSuccess, onShowLogin }: SignupPageProps) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [role, setRole] = useState("member");
//   const [shgGroup, setShgGroup] = useState("");
//   const [adminGroupMode, setAdminGroupMode] = useState<"new" | "existing">("existing");
//   const [newGroupDetails, setNewGroupDetails] = useState("");

//   const [error, setError] = useState("");

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {

//       // 1) Create user auth account
//       const userCred = await createUserWithEmailAndPassword(auth, email, password);
//       const userId = userCred.user.uid;

//       // Determine group name
//       const groupName =
//         role === "member"
//           ? shgGroup
//           : adminGroupMode === "existing"
//           ? shgGroup
//           : newGroupDetails;

//       // 2) If admin creating new group → add group record
//       if (role === "admin" && adminGroupMode === "new") {
//         await setDoc(doc(db, "ShgGroups", groupName), {
//           groupName,
//           createdBy: userId,
//           createdAt: new Date(),
//         });
//       }

//       // 3) Store user profile
//       await setDoc(doc(db, "users", userId), {
//         name,
//         email,
//         role,
//         shgGroup: groupName
//       });

//       onSignupSuccess();
//     } catch (err: any) {
//       console.log(err.code);
//       setError("Signup failed. Try again.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader>
//           <CardTitle className="text-2xl">Create Account</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSignup} className="space-y-4">
//             {error && <p className="text-red-600 text-sm">{error}</p>}

//             <div>
//               <Label>Name</Label>
//               <Input value={name} onChange={(e) => setName(e.target.value)} required />
//             </div>

//             <div>
//               <Label>Email</Label>
//               <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>

//             <div>
//               <Label>Password</Label>
//               <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//             </div>

//             <div>
//               <Label>Role</Label>
//               <select
//                 value={role}
//                 onChange={(e) => setRole(e.target.value)}
//                 className="w-full border rounded p-2"
//               >
//                 <option value="member">Member</option>
//                 <option value="admin">Admin</option>
//               </select>
//             </div>

//             {/* Conditional UI Section */}
//             {role === "member" && (
//               <div>
//                 <Label>SHG Group Name</Label>
//                 <Input value={shgGroup} onChange={(e) => setShgGroup(e.target.value)} required />
//               </div>
//             )}

//             {role === "admin" && (
//               <div className="space-y-3">
//                 <Label>SHG Group</Label>
//                 <select
//                   value={adminGroupMode}
//                   onChange={(e) => setAdminGroupMode(e.target.value as any)}
//                   className="w-full border rounded p-2"
//                 >
//                   <option value="existing">Join Existing Group</option>
//                   <option value="new">Create New Group</option>
//                 </select>

//                 {adminGroupMode === "existing" ? (
//                   <Input
//                     placeholder="Enter existing SHG group name"
//                     value={shgGroup}
//                     onChange={(e) => setShgGroup(e.target.value)}
//                     required
//                   />
//                 ) : (
//                   <Input
//                     placeholder="New SHG Group Name"
//                     value={newGroupDetails}
//                     onChange={(e) => setNewGroupDetails(e.target.value)}
//                     required
//                   />
//                 )}
//               </div>
//             )}

//             <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
//               Register
//             </Button>

//             <p className="text-center text-sm text-gray-600">
//               Already have an account?{" "}
//               <button className="text-teal-600 hover:underline" onClick={onShowLogin}>
//                 Login
//               </button>
//             </p>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";

import {
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
  getDoc
} from "firebase/firestore";
import { auth, db } from "./firebase";

interface SignupPageProps {
  onSignupSuccess: () => void;
  onShowLogin: () => void;
}

const SignupPage = ({ onSignupSuccess, onShowLogin }: SignupPageProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "member">("admin");

  const [groupName, setGroupName] = useState("");
  const [shgId, setShgId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      let finalShgId = "";

      // ADMIN → Create SHG
      if (role === "admin") {
        if (!groupName.trim()) {
          throw new Error("SHG name is required");
        }

        const shgRef = await addDoc(collection(db, "ShgGroups"), {
          groupName: groupName.trim(),
          createdBy: uid,
          createdAt: serverTimestamp(),
          averageTrustScore: 0
        });

        finalShgId = shgRef.id;

        await setDoc(doc(db, "ShgGroups", finalShgId, "members", uid), {
          name,
          role: "admin",
          joinedAt: serverTimestamp(),
          trustScore: 100
        });
      }

      // MEMBER → Join SHG
      if (role === "member") {
        if (!shgId.trim()) {
          throw new Error("SHG ID is required");
        }

        const shgDoc = await getDoc(doc(db, "ShgGroups", shgId));
        if (!shgDoc.exists()) {
          throw new Error("Invalid SHG ID");
        }

        finalShgId = shgId;

        await setDoc(doc(db, "ShgGroups", finalShgId, "members", uid), {
          name,
          role: "member",
          joinedAt: serverTimestamp(),
          trustScore: 50
        });
      }

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        shgId: finalShgId,
        createdAt: serverTimestamp()
      });

      onSignupSuccess();

    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSignup}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "member")}
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="admin">Admin (Create SHG)</option>
          <option value="member">Member (Join SHG)</option>
        </select>

        {role === "admin" && (
          <input
            type="text"
            placeholder="New SHG Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
        )}

        {role === "member" && (
          <input
            type="text"
            placeholder="SHG ID (Provided by Admin)"
            value={shgId}
            onChange={(e) => setShgId(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={onShowLogin}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
