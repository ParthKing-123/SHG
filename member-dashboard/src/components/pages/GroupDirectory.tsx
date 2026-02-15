
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Users, Search, TrendingUp, Award, Phone, Mail } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Progress } from "../ui/progress";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";


interface Member {
  id: string;
  name: string;
  role: string;
  trustScore: number;
  joinedDate: string;
  totalSavings: number;
  activeLoan: boolean;
  phone: string;
  email: string;
}

interface GroupDirectoryProps {
  groupStats: any;
  groupName: string;
}

export function GroupDirectory({ groupStats, groupName }: GroupDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);



  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topPerformers = [...members].sort((a, b) => b.trustScore - a.trustScore).slice(0, 3);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "president":
        return "bg-purple-100 text-purple-800";
      case "secretary":
        return "bg-blue-100 text-blue-800";
      case "treasurer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalMembers = members.length;

const avgTrustScore =
  totalMembers === 0
    ? 0
    : Math.round(
        members.reduce((sum, m) => sum + m.trustScore, 0) / totalMembers
      );

//const topPerformers = members.slice(0, 3);
if (!groupStats?.shgId) {
  return <div className="p-6">Loading group information...</div>;
}


  useEffect(() => {
  if (!groupStats?.shgId) return;

  const fetchMembers = async () => {
    try {
      const membersRef = collection(
        db,
        "ShgGroups",
        groupStats.shgId,
        "members"
      );

      const q = query(membersRef, orderBy("trustScore", "desc"));
      const snapshot = await getDocs(q);

      const fetchedMembers: Member[] = snapshot.docs.map(doc => {
        const data = doc.data();

        return {
          id: doc.id,
          name: data.name || "—",
          role: data.role || "Member",
          trustScore: data.trustScore || 0,
          joinedDate: data.joinedAt
            ? data.joinedAt.toDate().toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })
            : "—",
          totalSavings: data.totalSavings || 0,
          activeLoan: data.activeLoan || false,
          phone: data.phone || "—",
          email: data.email || "—",
        };
      });

      setMembers(fetchedMembers);
    } catch (err) {
      console.error("Error fetching members", err);
    } finally {
      setLoading(false);
    }
  };

  fetchMembers();
}, [groupStats?.shgId]);



if (loading) {
  return <div className="p-6">Loading group members...</div>;
}
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">{groupName}</h2>
        <p className="text-gray-600">Meet your fellow group members</p>
      </div>

      {/* Group Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl text-gray-900">{totalMembers}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Trust Score</p>
                <p className="text-2xl text-gray-900">{avgTrustScore}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Group Savings</p>
                <p className="text-2xl text-gray-900">₹{(groupStats.totalGroupSavings / 1000).toFixed(0)}K</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl text-gray-900">{groupStats.activeLoans}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top Performers This Month
          </CardTitle>
          <CardDescription>Members with the highest trust scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-4 bg-white rounded-lg">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
                      🏆
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">{member.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={member.trustScore} className="h-1.5 flex-1" />
                    <span className="text-sm text-gray-600">{member.trustScore}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Member Directory</CardTitle>
              <CardDescription>Connect with your group members</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div 
                key={member.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900">{member.name}</p>
                      <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">Joined {member.joinedDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Trust Score</p>
                    <p className="text-lg text-teal-600">{member.trustScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Savings</p>
                    <p className="text-lg text-gray-900">₹{(member.totalSavings / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Loan</p>
                    <Badge variant={member.activeLoan ? "default" : "secondary"}>
                      {member.activeLoan ? "Active" : "None"}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Group Info */}
      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            About Our Group
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Formation Date</p>
              <p className="text-gray-900">January 2023</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Meeting Schedule</p>
              <p className="text-gray-900">Every Sunday, 2:00 PM</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Meeting Location</p>
              <p className="text-gray-900">Community Center, Main Hall</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Group Registration</p>
              <p className="text-gray-900">MH/SHG/2023/0145</p>
            </div>
          </div>
          <div className="pt-3 border-t border-teal-200">
            <p className="text-sm text-gray-600 mb-2">Group Mission</p>
            <p className="text-gray-700">
              Empowering women through financial inclusion, mutual support, and collective growth. 
              We believe in uplifting each member to achieve financial independence and security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
