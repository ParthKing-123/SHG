import { createContext, useContext } from "react";

export interface AuthData {
  uid: string;
  role: "admin" | "member";
  shgId: string | null;
   name: string;
   phoneNumber: string;
  email: string; 
}

export const AuthContext = createContext<AuthData | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
