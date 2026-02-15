import { createContext, useContext } from "react";

export interface Member {
  id: string;
  name: string;
  role: string;
  joinedAt: string;

  trustScore: number;
  totalSavings: number;
  outstandingLoan: number;
  attendance: number;
  trend: "up" | "down" | "stable";
  status: string;
}

interface MembersContextType {
  members: Member[];
  loading: boolean;
}

export const MembersContext = createContext<MembersContextType | null>(null);

export const useMembers = () => {
  const ctx = useContext(MembersContext);
  if (!ctx) throw new Error("useMembers must be used inside MembersProvider");
  return ctx;
};
