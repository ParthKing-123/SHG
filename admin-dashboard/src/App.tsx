// // // import { useState } from "react";
// // // import { Sidebar } from "./components/Sidebar";
// // // import { DashboardView } from "./components/DashboardView";
// // // import { LogActivityView } from "./components/LogActivityView";
// // // import { MembersListView } from "./components/MembersListView";
// // // import { MemberProfileView } from "./components/MemberProfileView";
// // // import { ReportsView } from "./components/ReportsView";
// // // import { SettingsView } from "./components/SettingsView";

// // // export default function App() {
// // //   const [activeView, setActiveView] = useState("dashboard");
// // //   const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
//PARTHBKULKARNI
////////////////////////////////AAYUSH
//EXLEADER

//SHRIYASHKULKARNI
//////////////////////////////////////////////////////////////////////////////////////Heheheheh
//EXLEADERr
// // //   const handleSelectMember = (memberId: number) => {
// // //     setSelectedMemberId(memberId);
// // //     setActiveView("member-profile");
// // //   };

// // //   const renderView = () => {
// // //     switch (activeView) {
// // //       case "dashboard":
// // //         return <DashboardView />;
// // //       case "log-activity":
// // //         return <LogActivityView />;
// // //       case "members":
// // //         return <MembersListView onSelectMember={handleSelectMember} />;
// // //       case "member-profile":
// // //         return <MemberProfileView />;
// // //       case "reports":
// // //         return <ReportsView />;
// // //       case "settings":
// // //         return <SettingsView />;
// // //       default:
// // //         return <DashboardView />;
// // //     }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-gray-50">
// // //       <Sidebar activeView={activeView} onNavigate={setActiveView} />
      
// // //       {/* Main Content Area */}
// // //       <main className="ml-64 p-8">
// // //         {renderView()}
// // //       </main>
// // //     </div>
// // //   );
// // // }
// // import { useState } from "react";
// // // Import the LoginPage component
// // import LoginPage from "./components/loginPage.tsx"; // Ensure the path is correct

// // import { Sidebar } from "./components/Sidebar";
// // import { DashboardView } from "./components/DashboardView";
// // import { LogActivityView } from "./components/LogActivityView";
// // import { MembersListView } from "./components/MembersListView";
// // import { MemberProfileView } from "./components/MemberProfileView";
// // import { ReportsView } from "./components/ReportsView";
// // import { SettingsView } from "./components/SettingsView";

// // export default function App() {
// //   // 1. New state to track login status
// //   const [isLoggedIn, setIsLoggedIn] = useState(false); 
  
// //   // New function to be passed to the LoginPage
// //   const handleLoginSuccess = () => {
// //     setIsLoggedIn(true);
// //   };

// //   const [activeView, setActiveView] = useState("dashboard");
// //   const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

// //   const handleSelectMember = (memberId: number) => {
// //     setSelectedMemberId(memberId);
// //     setActiveView("member-profile");
// //   };

// //   // Optional: Add a logout function
// //   const handleLogout = () => {
// //     setIsLoggedIn(false);
// //     setActiveView("dashboard"); // Reset view on logout
// //   };

// //   const renderView = () => {
// //     // This function only renders the internal app views
// //     switch (activeView) {
// //       case "dashboard":
// //         return <DashboardView />;
// //       case "log-activity":
// //         return <LogActivityView />;
// //       case "members":
// //         return <MembersListView onSelectMember={handleSelectMember} />;
// //       case "member-profile":
// //         // You might need to pass selectedMemberId to MemberProfileView
// //         return <MemberProfileView />; 
// //       case "reports":
// //         return <ReportsView />;
// //       case "settings":
// //         return <SettingsView />;
// //       default:
// //         return <DashboardView />;
// //     }
// //   };

// //   // 2. Conditional Rendering at the top level
// //   if (!isLoggedIn) {
// //     // If not logged in, only show the LoginPage
// //     return <LoginPage onLoginSuccess={handleLoginSuccess} />;
// //   }

// //   // If logged in, show the main application layout
// //   return (
// //     <div className="min-h-screen bg-gray-50">
// //       {/* 3. Pass handleLogout to Sidebar or a Header component if you have one */}
// //       <Sidebar activeView={activeView} onNavigate={setActiveView} /* Add onLogout={handleLogout} here */ /> 
      
// //       {/* Main Content Area */}
// //       <main className="ml-64 p-8">
// //         {renderView()}
// //       </main>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from "react";
// // Import Firebase functions and auth instance
// import { auth } from "./firebase"
// import { onAuthStateChanged, signOut, User } from "firebase/auth";

// import LoginPage from "./components/loginPage"; // Use correct relative path
// import { Sidebar } from "./components/Sidebar";
// import { DashboardView } from "./components/DashboardView";
// import { LogActivityView } from "./components/LogActivityView";
// import { MembersListView } from "./components/MembersListView";
// import { MemberProfileView } from "./components/MemberProfileView";
// import { ReportsView } from "./components/ReportsView";
// import { SettingsView } from "./components/SettingsView";

// export default function App() {
//   // 🛑 1. AUTHENTICATION STATES (CRUCIAL FOR PERSISTENCE)
//   const [user, setUser] = useState<User | null>(null); 
//   const [isLoadingAuth, setIsLoadingAuth] = useState(true); 
//THIS IS PARTH AMIT KULKARNI
//   // Application States (unchanged)
//   const [activeView, setActiveView] = useState("dashboard");
//   const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
////////////////////SHRIyash
//   // 🛑 2. FIREBASE SESSION CHECK
//   useEffect(() => {
//     // This listener checks the local token immediately and runs on login/logout
//     const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
//       setUser(currentUser); 
//       setIsLoadingAuth(false); // Stop loading once status is determined
//     });
//     return () => unsubscribe();
//   }, []);
  
//   // Handlers
//   const handleLoginSuccess = () => {
//     // The onAuthStateChanged listener handles setting the `user` state after login, 
//     // so this function can just be a placeholder or confirmation.
//     console.log("Login success handled by Firebase listener.");
//   };

//   const handleLogout = async () => {
//     try {
//       await signOut(auth); // 🛑 LOGS OUT OF FIREBASE 🛑
//       setActiveView("dashboard"); // Reset view after successful logout
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   };

//   const handleSelectMember = (memberId: number) => {
//     setSelectedMemberId(memberId);
//     setActiveView("member-profile");
//   };

//   const renderView = () => {
//     // Renders the appropriate view based on the activeView state
//     switch (activeView) {
//       case "dashboard":
//         return <DashboardView />;
//       case "log-activity":
//         return <LogActivityView />;
//       case "members":
//         return <MembersListView onSelectMember={handleSelectMember} />;
//       case "member-profile":
//         return <MemberProfileView />; 
//       case "reports":
//         return <ReportsView />;
//       case "settings":
//         return <SettingsView />;
//       default:
//         return <DashboardView />;
//     }
//   };

//   // 🛑 3. CONDITIONAL RENDERING LOGIC

//   // Show Loading Screen while waiting for Firebase to check the token
//   if (isLoadingAuth) {
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100">
//             <p className="text-lg font-semibold text-gray-700">Loading Session...</p>
//         </div>
//     );
//   }

//   // Show LoginPage if no user is found (user is null)
//   if (!user) {
//     // We only pass onLoginSuccess, as the user state is managed by the listener
//     return <LoginPage onLoginSuccess={handleLoginSuccess} />;
//   }

//   // Show main app if a user is logged in (user is a User object)
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* 🛑 Pass handleLogout to Sidebar 🛑 */}
//       <Sidebar 
//         activeView={activeView} 
//         onNavigate={setActiveView} 
//         onLogout={handleLogout}
//       /> 
      
//       {/* Main Content Area */}
//       <main className="ml-64 p-8">
//         {renderView()}
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { auth } from "./components/firebase";
import { LoanApprovalsView } from "./components/LoanApprovalsView";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {LoginPage } from "./components/loginPage";
import { Sidebar } from "./components/Sidebar";
import  SignupPage  from "./components/SignUpPage";
import { DashboardView } from "./components/DashboardView";
import { LogActivityView } from "./components/LogActivityView";
import { MembersListView } from "./components/MembersListView";
import { MemberProfileView } from "./components/MemberProfileView";
import { ReportsView } from "./components/ReportsView";
import { SettingsView } from "./components/SettingsView";
import { AuthContext, AuthData } from "./AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "./components/firebase";
import { Member, MembersContext, } from "./MembersContext";
import { MonthlyRound } from "./components/pages/MonthlyRound.tsx";

export default function App() {
  // const [user, setUser] = useState<User | null>(null);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [authView, setAuthView] = useState<"login" | "signup">("login");

  const [activeView, setActiveView] = useState("dashboard");
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
 ////HHIII
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setAuthData(null);
      setIsLoadingAuth(false);
      return;
    }

    const uid = firebaseUser.uid;

    // 🔥 fetch Firestore user profile
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) {
      setAuthData(null);
      setIsLoadingAuth(false);
      return;
    }

    const { role, shgId } = snap.data();

    setAuthData({
      uid,
      role,
      shgId: shgId ?? null
    });

    setIsLoadingAuth(false);
  });

  return () => unsubscribe();
}, []);

  const [members, setMembers] = useState<Member[]>([]);
const [membersLoading, setMembersLoading] = useState(true);

useEffect(() => {
  if (!authData?.shgId) return;

  const fetchMembers = async () => {
    const snap = await getDocs(
      collection(db, "ShgGroups", authData!.shgId!, "members")
    );

    const list:  Member[] = snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name ?? "Unknown",
      role: doc.data().role ?? "member",
      joinedAt: doc.data().joinedAt
        ? doc.data().joinedAt.toDate().toLocaleDateString()
        : "N/A",

      trustScore: 0,
      totalSavings: 0,
      outstandingLoan: 0,
      attendance: 0,
      trend: "stable",
      status: "Active"
    }));

    setMembers(list);
    setMembersLoading(false);
  };

  fetchMembers();
}, [authData?.shgId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSelectMember = (memberId: number) => {
    setSelectedMemberId(memberId);
    setActiveView("member-profile");
  };

  const renderView = () => {
  switch (activeView) {
    case "dashboard":
      return <DashboardView />;
    case "monthly-round":
     return <MonthlyRound />;
    case "log-activity":
      return <LogActivityView />;
    case "members":
      return <MembersListView onSelectMember={handleSelectMember} />;
    case "member-profile":
      return <MemberProfileView memberId={selectedMemberId} />;
    case "reports":
      return <ReportsView />;
    case "settings":
      return <SettingsView />;
    case "loan-approvals":
      return <LoanApprovalsView />;
    default:
      return <DashboardView />;
  }
};



  if (isLoadingAuth) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading Session...
    </div>
  );
}

if (!authData) {
  return authView === "login" ? (
    <LoginPage
      onLoginSuccess={setAuthData}
      onShowSignup={() => setAuthView("signup")}
    />
  ) : (
    <SignupPage
      onSignupSuccess={() => setAuthView("login")}
      onShowLogin={() => setAuthView("login")}
    />
  );
}

    return (
    <AuthContext.Provider value={authData}>
  <MembersContext.Provider value={{ members, loading: membersLoading }}>
    <div className="min-h-screen bg-gray-50">
      <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          onLogout={handleLogout}
        />
      <main className="ml-64 p-8">{renderView()}</main>
    </div>
  </MembersContext.Provider>
</AuthContext.Provider>
  );
}
