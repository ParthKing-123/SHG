import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "./components/firebase";
import { useState } from "react";
import { Home, BookOpen, User, Target, TrendingUp, GraduationCap, Users, MessageSquare, Award, LogOut } from "lucide-react";
import { Dashboard } from "./components/pages/Dashboard";
import { MyLedger } from "./components/pages/MyLedger";
import { ProfilePage } from "./components/pages/ProfilePage";
import { SavingsGoals } from "./components/pages/SavingsGoals";
import { LoanManagement } from "./components/pages/LoanManagement";
import { FinancialLiteracy } from "./components/pages/FinancialLiteracy";
import { GroupDirectory } from "./components/pages/GroupDirectory";
import { Communication } from "./components/pages/Communication";
import { Achievements } from "./components/pages/Achievements";
import { LoginPage } from "./components/pages/LoginPage";
import { SignupPage } from "./components/pages/SignupPage";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { AuthContext, AuthData } from "./components/AuthContext";
import { Wallet } from "lucide-react";
import { MonthlyRound } from "./components/pages/MonthlyRound";
import { VerifyPhone } from "./components/pages/VerifyPhone";
import { Chatbot } from "./components/ChatBot";
import { useLanguage } from "./LanguageContext";

type Page = 
  | "dashboard" 
  | "ledger" 
  | "profile" 
  | "goals" 
  | "loans" 
  |"monthly-round"
  | "learning" 
  | "group" 
  | "messages"
  | "achievements";

type AuthState = {
  isAuthenticated: boolean;
  userType: "member" | "admin" | null;
  userId: string | null;
};

type AppView = "login" | "signup" | "member-dashboard" | "admin-dashboard" | "verify-phone";

export default function App() {
  const [appView, setAppView] = useState<AppView>("login");
  const [memberData, setMemberData] = useState<any>(null);
  const [loadingMember, setLoadingMember] = useState(true);

  const { t, language, setLanguage } = useLanguage();

  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null
  });
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authData, setAuthData] = useState<AuthData | null>(null);
 useEffect(() => {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
  // ❗ allow OTP flow to continue
  if (appView === "verify-phone") return;

  setAuth({
    isAuthenticated: false,
    userType: null,
    userId: null
  });
  setAppView("login");
  setMemberData(null);
  setLoadingMember(false);
  return;
}

    try {
     
const userRef = doc(db, "users", user.uid);
const userSnap = await getDoc(userRef);

if (!userSnap.exists()) {
  console.error("User document not found in -> waiting");
  setLoadingMember(true);
  return;
}

const userData = userSnap.data();
const uid = user.uid;
const { role, shgId, phoneVerified } = userData;

// 🔐 OTP CHECK
if (!phoneVerified) {
  console.log("Phone not verified → redirecting to OTP");

  setAuth({
    isAuthenticated: true,
    userType: "member",
    userId: user.uid,
  });

  setAuthData({
    uid: user.uid,
    role,
    shgId,
    name: userData.fullName || "",
    phoneNumber: userData.phoneNumber,
    email: userData.email,
  });

  setAppView("verify-phone"); // ✅ THIS WAS MISSING
  setLoadingMember(false);
  return; // ⛔ STOP HERE
}



if (!shgId) {
  console.error("User has no shgId");
  setLoadingMember(false);
  return;
}


     
      const memberRef = doc(
        db,
        "ShgGroups",
        userData.shgId,
        "members",
        user.uid
      );
      const memberRef2 = doc(
        db,
        "ShgGroups",userData.shgId
      );
      const memberSnap2 = await getDoc(memberRef2);
      const memberSnap = await getDoc(memberRef);
      if (!memberSnap.exists()) return;

      const member = memberSnap.data();
      const member2 = memberSnap2.data();
      // 3️⃣ Format joined date
      const joinedDate = member.joinedAt?.toDate();
      const memberSince = joinedDate
        ? joinedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";

      // 4️⃣ SET REAL DASHBOARD DATA
      setMemberData({
        name: member.name,
        groupName: member2!.groupName,
        memberSince,
        memberId: user.uid.slice(0, 8),
        trustScore: {
          total: member.trustScore,
          financial: 38,
          timeliness: 37,
          attendance: 17,
          history: [
            { month: "Jan", score: Math.max(0, member.trustScore - 10) },
            { month: "Feb", score: Math.max(0, member.trustScore - 5) },
            { month: "Mar", score: member.trustScore },
          ]
        },
        financials: {
          totalSavings: 45000,
          loanBalance: 12000,
          monthlyContribution: 500,
          totalContributed: 24000,
          interestEarned: 2100,
        },
        transactions: [],
        reminders: {
        nextPaymentDate: "",
        nextPaymentAmount: 0,
        nextMeetingDate: "",
        nextMeetingLocation: ""
      },

        goals: [],
        loans: [],
        achievements: [],
        groupStats: {
          totalMembers: 0,
          averageTrustScore: 0,
          totalGroupSavings: 0,
          activeLoans: 0,
        },
      });

      setAuth({
        isAuthenticated: true,
        userType: "member",
        userId: user.uid
      });
      setAuthData({
        uid,
        role,
        shgId,
        name: member.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
      });

      setAppView("member-dashboard");
      setCurrentPage("dashboard");

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMember(false);
    }
  });

  return () => unsubscribe();
}, []);
function buildWelcomeEmail(name: string) {
  return `
Hello ${name} 👋,

🎉 Your phone number has been successfully verified!

Welcome to **SHG Portal** — we’re really glad to have you with us 💚

SHG Portal is designed to help you:
• Track your savings and contributions  
• Manage loans transparently  
• Stay connected with your group  
• Grow financially with confidence  

If you ever need help, our AI assistant is always there to guide you 🤖

Wishing you a great journey ahead!

Warm regards,  
**Team SHG Portal**
`;
}

async function sendWelcomeEmail(email: string, name: string) {
  try {
    await fetch("http://localhost:5001/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: email,
        subject: "Welcome to SHG Portal",
        body:buildWelcomeEmail(name),
          
      }),
    });
  } catch (err) {
    console.error("Email failed", err);
  }
}

  const navigationItems = [
    { id: "dashboard" as Page, label: t("dashboard", "sidebar"), icon: Home },
    { id: "ledger" as Page, label: t("ledger", "sidebar"), icon: BookOpen },
    { id: "goals" as Page, label: t("goals", "sidebar"), icon: Target },
    { id: "loans" as Page, label: t("loans", "sidebar"), icon: TrendingUp },
    { id: "monthly-round" as Page, label: t("monthly_round", "sidebar"), icon: Wallet },
    { id: "learning" as Page, label: t("learning", "sidebar"), icon: GraduationCap },
    { id: "group" as Page, label: t("group", "sidebar"), icon: Users },
    { id: "messages" as Page, label: t("messages", "sidebar"), icon: MessageSquare },
    { id: "achievements" as Page, label: t("achievements", "sidebar"), icon: Award },
    { id: "profile" as Page, label: t("profile", "sidebar"), icon: User },
  ];

  const handleLogin = () => {
  
};


  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      userType: null,
      userId: null
    });
    setAppView("login");
    setCurrentPage("dashboard");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard memberData={memberData} />;
      case "ledger":
        return <MyLedger transactions={memberData.transactions} financials={memberData.financials} />;
      case "profile":
        return <ProfilePage memberData={memberData} />;
    case "goals":
  
        return <SavingsGoals totalSavings={memberData.financials.totalSavings ?? 0} userId={auth.userId!}/> ;

      case "loans":
        return <LoanManagement loans={memberData.loans} trustScore={memberData.trustScore.total} savings={memberData.financials.totalSavings} />;
      case "learning":
        return <FinancialLiteracy />;
      case "group":
        return <GroupDirectory
  groupStats={{ ...memberData.groupStats, shgId: authData?.shgId }}
  groupName={memberData.groupName}
/>
      case "messages":
        return <Communication groupName={memberData.groupName} />;
        case "monthly-round":
  return <MonthlyRound />;

      case "achievements":
        return <Achievements achievements={memberData.achievements} trustScore={memberData.trustScore.total} />;
      default:
        return <Dashboard memberData={memberData} />;
    }
  };

// 🔐 OTP HAS HIGHEST PRIORITY
if (appView === "verify-phone") {
  return (
<VerifyPhone
  uid={authData?.uid || ""}
  phone={authData?.phoneNumber || ""}
  onVerified={async() => {
    await sendWelcomeEmail(authData?.email || authData?.phoneNumber || "", authData?.name || "");

    // 🔹 CONTINUE NORMAL FLOW
    setAppView("member-dashboard");
  }}
/>

  );
}

if (appView === "login") {
  return (
    <>
      <LoginPage
        onLogin={handleLogin}
        onNavigateToSignup={() => setAppView("signup")}
      />
      <Toaster />
    </>
  );
}

if (appView === "signup") {
  return (
    <>
      <SignupPage onNavigateToLogin={() => setAppView("login")} />
      <Toaster />
    </>
  );
}


if (loadingMember) {
  return <div className="p-8">Loading member dashboard...</div>;
}

if (appView === "admin-dashboard") {
  return (
    <>
      <AdminDashboard />
      <Toaster />
    </>
  );
}

  return (
    <AuthContext.Provider value={authData}>
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar Navigation */}
      <aside 
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } flex-shrink-0`}
      >
        <div className="p-6">
          <h1 className={`text-teal-600 text-2xl mb-8 transition-all ${!sidebarOpen && 'text-center text-xl'}`}>
            {sidebarOpen ? "SHG Portal" : "SHG"}
          </h1>
          
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {sidebarOpen && (
            <div className="mt-8 space-y-4">
              <div className="px-2">
                <p className="text-xs text-gray-500 mb-2">Language / भाषा</p>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                </select>
              </div>
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                {t("logout", "sidebar") === "logout" ? "Logout" : t("logout", "sidebar")}
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div>
                <h1 className="text-gray-900 text-2xl">Welcome Back, {memberData.name}</h1>
                <p className="text-gray-600">{memberData.groupName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Trust Score</div>
                <div className="text-xl text-teal-600">{memberData.trustScore.total}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <span className="text-teal-700">{getInitials(memberData.name)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {renderPage()}
        </div>
      </main>

      <Toaster />
    </div>
    <Chatbot/>
    </AuthContext.Provider>
  );
}
