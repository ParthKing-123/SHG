import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  Building2, 
  User, 
  Bell, 
  Shield, 
  Link2, 
  Database, 
  Save,
  CheckCircle,
  AlertCircle,
  Upload,
  Download
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useMembers } from "../MembersContext";

export function SettingsView() {
  const {shgId} = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [shgName, setShgName] = useState<string>("");
  const [trueObj, setCreate] = useState<DocumentData>();
  const [adminObj,setAdmin] = useState<DocumentData>();
  const {members} = useMembers();
  useEffect(() => {
        if (!shgId) return;
        const fetchShg = async () => {
              const snap = await getDoc(doc(db, "ShgGroups", shgId));
              if (snap.exists()) {
                setShgName(snap.data().groupName);
                setCreate(snap.data());
              }
            };
        
        fetchShg();

  },[shgId]);

  useEffect(() => {
  if (!trueObj?.createdBy) return;

  const fetchAdminDetails = async () => {
    const snap = await getDoc(
      doc(db, "users", trueObj.createdBy)
    );
    if (snap.exists()) {
      setAdmin(snap.data());
    }
  };

  fetchAdminDetails();
}, [trueObj?.createdBy]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your SHG configuration and preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="shg" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shg">
            <Building2 className="w-4 h-4 mr-2" />
            SHG Info
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="blockchain">
            <Link2 className="w-4 h-4 mr-2" />
            Blockchain
          </TabsTrigger>
        </TabsList>

        {/* SHG Information */}
        <TabsContent value="shg" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SHG Details</CardTitle>
              <CardDescription>Manage your Self-Help Group information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shg-name">SHG Name</Label>
                  <Input id="shg-name" defaultValue={trueObj?.groupName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shg-id">Registration ID</Label>
                  <Input id="shg-id" defaultValue={shgId!} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formed-date">Formation Date</Label>
                  <Input id="formed-date" type="string" defaultValue={trueObj?.createdAt.toDate().toLocaleDateString()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-count">Total Members</Label>
                  <Input id="member-count" type="number" defaultValue={members.length} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="Maharashtra" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank">Linked Bank Account</Label>
                  <Input id="bank" defaultValue="State Bank of India - ****6789" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Group Configuration</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-frequency">Meeting Frequency</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger id="meeting-frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-savings">Minimum Monthly Savings</Label>
                    <Input id="min-savings" type="number" defaultValue="500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest-rate">Loan Interest Rate (%)</Label>
                    <Input id="interest-rate" type="number" step="0.1" defaultValue="12.0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-loan">Maximum Loan Amount</Label>
                    <Input id="max-loan" type="number" defaultValue="50000" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Profile */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leader Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue= {adminObj?.name}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue={adminObj?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Admin ID</Label>
                  <Input id="phone" type="tel" defaultValue= {trueObj?.createdBy} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input defaultValue="Admin" disabled>
                  
                  </Input>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Change Password</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notif">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms-notif"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-reports">Weekly Summary Reports</Label>
                    <p className="text-sm text-gray-500">Get weekly performance summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={weeklyReports}
                    onCheckedChange={setWeeklyReports}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Notification Types</h3>
                <div className="space-y-3">
                  {[
                    { label: "New Transaction", enabled: true },
                    { label: "Loan Applications", enabled: true },
                    { label: "Meeting Reminders", enabled: true },
                    { label: "Payment Due Alerts", enabled: true },
                    { label: "System Updates", enabled: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <Switch defaultChecked={item.enabled} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Default</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Protect your account and data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Your account is protected with industry-standard encryption.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="2fa">Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Switch
                    id="2fa"
                    checked={twoFactorAuth}
                    onCheckedChange={setTwoFactorAuth}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Active Sessions</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900">Desktop - Chrome</p>
                      <p className="text-xs text-gray-500">Mumbai, India • Active now</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900">Mobile - Android</p>
                      <p className="text-xs text-gray-500">Mumbai, India • 2 hours ago</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-600">
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Privacy Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: "Profile Visibility", value: "SHG Members Only" },
                    { label: "Transaction History", value: "Private" },
                    { label: "Activity Status", value: "Visible to Leaders" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <Badge variant="outline">{item.value}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="text-red-600 hover:bg-red-50">
                  Deactivate Account
                </Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blockchain */}
        <TabsContent value="blockchain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Configuration</CardTitle>
              <CardDescription>Manage blockchain network and data settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  All transactions are recorded on an immutable blockchain ledger for transparency and security.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-6">
                <Card className="border-teal-200 bg-teal-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">Network Status</p>
                      <Badge className="bg-green-600">Connected</Badge>
                    </div>
                    <p className="text-2xl text-gray-900">Ethereum</p>
                    <p className="text-xs text-gray-500 mt-1">Mainnet</p>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>
                    <p className="text-2xl text-gray-900">1,247</p>
                    <p className="text-xs text-gray-500 mt-1">Since inception</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Smart Contract Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Contract Address</span>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      0x742d35Cc6634C0532925a3b8...
                    </code>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Deployed On</span>
                    <span className="text-sm text-gray-900">Jan 15, 2024</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Gas Optimization</span>
                    <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-gray-900">Data Management</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="border-teal-500 text-teal-700 hover:bg-teal-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Verify All Records
                  </Button>
                  <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export Blockchain Data
                  </Button>
                </div>
              </div>

              <Alert>
                <Database className="h-4 w-4 text-teal-600" />
                <AlertDescription>
                  <strong>Backup Status:</strong> Last backup was performed on Nov 5, 2025 at 11:30 PM. 
                  All data is securely stored on IPFS.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <Button variant="outline">View Audit Log</Button>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Save className="w-4 h-4 mr-2" />
                  Update Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
