import { Home, Activity, Users, FileText, Settings, LogOut , Wallet } from "lucide-react";
import { cn } from "./ui/utils";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/firebase";
//import { Home, Activity, Users, FileText, Settings, LogOut, Wallet } from "lucide-react";


interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
   onLogout: () => void; 
}

export function Sidebar({ activeView, onNavigate, onLogout }: SidebarProps) {
  const { role, shgId } = useAuth();

  const [shgName, setShgName] = useState<string>("");

  // ✅ Firestore fetch inside useEffect
  useEffect(() => {
    if (!shgId) return;

    const fetchShg = async () => {
      const snap = await getDoc(doc(db, "ShgGroups", shgId));
      if (snap.exists()) {
        setShgName(snap.data().groupName);
      }
    };

    fetchShg();
  }, [shgId]);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "log-activity", label: "Log Activity", icon: Activity },
    { id: "members", label: "Members", icon: Users },
    { id: "loan-approvals", label: "Loan Approvals", icon: FileText },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "monthly-round", label: "Monthly Round", icon: Wallet },
    { id: "settings", label: "Settings", icon: Settings },
    {id: "logout", label: "Logout", icon: LogOut}
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-teal-50 to-blue-50 border-r border-gray-200 h-screen fixed left-0 top-0">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">TL</span>
          </div>
          <div>
            <h1 className="text-teal-900">TrustLedger</h1>
            <p className="text-xs text-gray-600">SHG Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                     if (item.id === "logout") {
                      onLogout();        // ✅ CALL LOGOUT HERE
                    } else {
                      onNavigate(item.id);
                    }
                  }
                  }
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    activeView === item.id
                      ? "bg-teal-500 text-white shadow-md"
                      : "text-gray-700 hover:bg-white/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* SHG Group Selector */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Active SHG Group</p>
          <p className="text-teal-700">{shgName || "Loading..."}</p>
          <button className="text-xs text-blue-600 mt-2 hover:underline">
            Switch Group
          </button>
        </div>
      </div>
    </div>
  );
}
