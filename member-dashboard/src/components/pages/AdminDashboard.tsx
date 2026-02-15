import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

// This is a placeholder for your existing Admin Dashboard
// Replace this entire component with your actual admin dashboard component

export function AdminDashboard() {
  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 mb-2">Admin Dashboard</h2>
        <p className="text-gray-600">Manage your SHG groups and members</p>
      </div>

      {/* Placeholder Content - Replace with your actual admin dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-2xl text-gray-900">12</p>
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
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl text-gray-900">180</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl text-gray-900">5</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl text-gray-900">45</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-200 bg-teal-50/30">
        <CardHeader>
          <CardTitle>Replace This Component</CardTitle>
          <CardDescription>
            This is a placeholder admin dashboard. Please replace the entire AdminDashboard component 
            in /components/pages/AdminDashboard.tsx with your existing admin dashboard code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>The authentication and routing system is already set up</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Simply replace this component with your admin dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Login credentials: admin@shg.com / admin123</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
