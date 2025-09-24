/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { JWTPayload } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
  Activity
} from "lucide-react";

interface AdminDashboardClientProps {
  user: JWTPayload;
}

interface DataAnalyst {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isFirstLogin: boolean;
  createdAt: string;
}

export default function AdminDashboardClient({
  user,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("analysts");
  const [analysts, setAnalysts] = useState<DataAnalyst[]>([]);
  const [filteredAnalysts, setFilteredAnalysts] = useState<DataAnalyst[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [createAnalystForm, setCreateAnalystForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingAnalysts, setFetchingAnalysts] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    email: "",
    phoneNumber: "",
  });
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const router = useRouter();

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalAnalysts: 0,
    verifiedAnalysts: 0,
    pendingVerification: 0,
    newThisMonth: 0
  });

  // Regex patterns
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[+]?[\d\s\-()]{10,15}$/;
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  // Fetch analysts on component mount
  useEffect(() => {
    if (activeTab === "analysts" || activeTab === "dashboard") {
      fetchAnalysts();
    }
  }, [activeTab]);

  // Update stats when analysts change
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const newThisMonth = analysts.filter(analyst => {
      const createdDate = new Date(analyst.createdAt);
      return createdDate.getMonth() === currentMonth && 
             createdDate.getFullYear() === currentYear;
    }).length;

    setStats({
      totalAnalysts: analysts.length,
      verifiedAnalysts: analysts.filter(a => a.isEmailVerified).length,
      pendingVerification: analysts.filter(a => !a.isEmailVerified).length,
      newThisMonth: newThisMonth
    });
  }, [analysts]);

  // Filter analysts based on search term
  useEffect(() => {
    const filtered = analysts.filter(
      (analyst) =>
        analyst.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analyst.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        analyst.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAnalysts(filtered);
  }, [analysts, searchTerm]);

  const fetchAnalysts = async () => {
    setFetchingAnalysts(true);
    try {
      const response = await fetch("/api/auth/admin/analysts");
      const data = await response.json();
      
      if (response.ok) {
        setAnalysts(data.analysts || []);
      } else {
        console.error("Failed to fetch analysts:", data.error);
      }
    } catch (error) {
      console.error("Error fetching analysts:", error);
    } finally {
      setFetchingAnalysts(false);
    }
  };

  const validateField = (field: string, value: string) => {
    let error = "";
    
    switch (field) {
      case "username":
        if (value && !usernameRegex.test(value)) {
          error = "Username can only contain letters, numbers, and underscores";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters long";
        }
        break;
      case "email":
        if (value && !emailRegex.test(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phoneNumber":
        if (value && !phoneRegex.test(value)) {
          error = "Please enter a valid phone number (10-15 digits)";
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "username") {
      value = value.replace(/[^a-zA-Z0-9_]/g, "");
    }

    setCreateAnalystForm(prev => ({
      ...prev,
      [field]: value
    }));

    validateField(field, value);
  };

  const isFormValid = () => {
    const { username, email, fullName, phoneNumber } = createAnalystForm;
    const { username: usernameError, email: emailError, phoneNumber: phoneError } = validationErrors;
    
    return username.length >= 3 && email && fullName.trim() && phoneNumber && 
           !usernameError && !emailError && !phoneError;
  };

  const handleCreateAnalyst = async (e: React.FormEvent) => {
    e.preventDefault();
    
    validateField("username", createAnalystForm.username);
    validateField("email", createAnalystForm.email);
    validateField("phoneNumber", createAnalystForm.phoneNumber);

    if (!isFormValid()) {
      setMessage({
        type: "error",
        content: "Please fix all validation errors before submitting",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch("/api/auth/admin/create-analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createAnalystForm),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          content: `Data Analyst created successfully!`,
        });
        setTempPassword(data.user?.tempPassword || "");
        setShowTempPassword(true);
        setCreateAnalystForm({
          username: "",
          email: "",
          fullName: "",
          phoneNumber: "",
        });
        setValidationErrors({
          username: "",
          email: "",
          phoneNumber: "",
        });
        
        // Refresh analysts list
        fetchAnalysts();
        
        // Auto switch to analysts tab after 5 seconds
        setTimeout(() => {
          setActiveTab("analysts");
          setShowTempPassword(false);
          setTempPassword("");
        }, 5000);
      } else {
        setMessage({
          type: "error",
          content: data.error || "Failed to create data analyst",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        content: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Activity },
    { id: "analysts", label: "Data Analysts", icon: Users },
    { id: "create-analyst", label: "Add New Analyst", icon: UserPlus },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-3xl font-bold text-slate-800 mt-2">{value}</p>
            {trend && (
              <span className={`text-xs font-medium mt-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
              </span>
            )}
          </div>
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-100">
            <Icon className="w-7 h-7 text-sky-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-72 bg-white shadow-xl min-h-screen border-r border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-sky-400 to-sky-600 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Admin Portal</h1>
                <p className="text-sm text-slate-500 mt-1">Welcome, {user.username}</p>
              </div>
            </div>
          </div>
          
          {/* Sign Out Button at the Top */}
          <div className="p-4 border-b border-slate-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <nav className="mt-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-6 py-4 text-left transition-all duration-200 group ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-sky-50 to-sky-100 border-r-3 border-sky-500 text-sky-700 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-4 transition-all duration-200 ${
                  activeTab === item.id ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span className="font-medium">{item.label}</span>
                <ChevronRight className={`w-4 h-4 ml-auto transition-all duration-200 ${
                  activeTab === item.id ? 'text-sky-500 transform rotate-90' : 'text-slate-300 group-hover:translate-x-1'
                }`} />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2">
                  {activeTab === "dashboard" && "Dashboard Overview"}
                  {activeTab === "analysts" && "Data Analysts"}
                  {activeTab === "create-analyst" && "Add New Analyst"}
                  {activeTab === "settings" && "System Settings"}
                </h2>
                <p className="text-slate-600 text-lg">
                  {activeTab === "dashboard" && "Monitor your team's performance and activity"}
                  {activeTab === "analysts" && "Manage your data analysts team"}
                  {activeTab === "create-analyst" && "Create a new analyst account"}
                  {activeTab === "settings" && "Configure system preferences"}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-800">{user.username}</p>
                  <p className="text-sm text-slate-500">System Administrator</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Analysts"
                  value={stats.totalAnalysts}
                  icon={Users}
                  trend={12}
                  color="blue"
                />
                <StatCard
                  title="Verified Accounts"
                  value={stats.verifiedAnalysts}
                  icon={Shield}
                  trend={8}
                  color="green"
                />
                <StatCard
                  title="Pending Verification"
                  value={stats.pendingVerification}
                  icon={UserPlus}
                  trend={-3}
                  color="orange"
                />
                <StatCard
                  title="New This Month"
                  value={stats.newThisMonth}
                  icon={Activity}
                  trend={15}
                  color="purple"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-sky-50 to-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-800 flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-sky-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button 
                        onClick={() => setActiveTab("create-analyst")}
                        className="w-full justify-start bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <UserPlus className="w-5 h-5 mr-3" />
                        Create New Analyst
                      </Button>
                      <Button 
                        onClick={() => setActiveTab("analysts")}
                        variant="outline" 
                        className="w-full justify-start border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                      >
                        <Users className="w-5 h-5 mr-3" />
                        View All Analysts
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-sky-50 to-slate-50 border-b border-slate-100">
                    <CardTitle className="text-slate-800 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-sky-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {analysts.slice(0, 3).map((analyst) => (
                        <div key={analyst.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors duration-200">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-sky-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{analyst.fullName}</p>
                            <p className="text-xs text-slate-500">Joined {new Date(analyst.createdAt).toLocaleDateString()}</p>
                          </div>
                          <Badge 
                            variant={analyst.isEmailVerified ? "default" : "secondary"} 
                            className={analyst.isEmailVerified ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}
                          >
                            {analyst.isEmailVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Data Analysts Tab */}
          {activeTab === "analysts" && (
            <div className="space-y-6">
              {/* Search and Actions */}
              <Card className="bg-white border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="relative flex-1 max-w-md w-full">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Search analysts by name, email, or username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 border-slate-300 focus:border-sky-400 focus:ring-sky-200 h-12"
                      />
                    </div>
                    <Button
                      onClick={() => setActiveTab("create-analyst")}
                      className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 flex items-center whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Add New Analyst
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysts Grid */}
              {fetchingAnalysts ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAnalysts.map((analyst) => (
                    <Card key={analyst.id} className="bg-white border-slate-200 hover:shadow-lg hover:border-sky-200 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-slate-800 group-hover:text-sky-700 transition-colors duration-200">
                              {analyst.fullName}
                            </CardTitle>
                            <p className="text-sm text-sky-600 font-medium">@{analyst.username}</p>
                          </div>
                          <div className="flex flex-col space-y-2 items-end">
                            <Badge 
                              variant={analyst.isEmailVerified ? "default" : "secondary"} 
                              className={analyst.isEmailVerified 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-100 text-amber-700 border-amber-200'
                              }
                            >
                              {analyst.isEmailVerified ? "Verified" : "Pending"}
                            </Badge>
                            {analyst.isFirstLogin && (
                              <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
                                First Login
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="w-4 h-4 mr-3 text-sky-500" />
                          <span className="truncate">{analyst.email}</span>
                        </div>
                        {analyst.phoneNumber && (
                          <div className="flex items-center text-sm text-slate-600">
                            <Phone className="w-4 h-4 mr-3 text-sky-500" />
                            {analyst.phoneNumber}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-3 text-sky-500" />
                          Created: {new Date(analyst.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!fetchingAnalysts && filteredAnalysts.length === 0 && (
                <Card className="text-center py-16 bg-white border-slate-200">
                  <CardContent>
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-sky-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                      {searchTerm ? "No analysts found" : "No analysts yet"}
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      {searchTerm
                        ? "Try adjusting your search terms to find what you're looking for"
                        : "Get started by creating your first data analyst account"}
                    </p>
                    {!searchTerm && (
                      <Button 
                        onClick={() => setActiveTab("create-analyst")}
                        className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add New Analyst
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

              {/* Create Analyst Tab */}
          {activeTab === "create-analyst" && (
            <div className="max-w-4xl">
              <Card className="border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                  <CardTitle className="text-blue-900">Create New Data Analyst</CardTitle>
                  <p className="text-sm text-blue-600">
                    Fill in the details to create a new data analyst account. All fields are required.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCreateAnalyst} className="space-y-6">
                    {message.content && (
                      <Alert variant={message.type === 'success' ? 'default' : 'destructive'} 
                             className={message.type === 'success' ? 'border-green-200 bg-green-50' : ''}>
                        <AlertDescription>{message.content}</AlertDescription>
                      </Alert>
                    )}

                    {showTempPassword && tempPassword && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="flex items-center justify-between">
                          <div>
                            <strong className="text-blue-900">Temporary Password:</strong>
                            <span className="ml-2 font-mono text-blue-700">{tempPassword}</span>
                            <p className="text-sm text-blue-600 mt-1">
                              Share this password securely with the analyst. They will be prompted to change it on first login.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(tempPassword)}
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            Copy
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Username *
                        </label>
                        <Input
                          placeholder="Enter username"
                          value={createAnalystForm.username}
                          onChange={(e) => handleInputChange("username", e.target.value)}
                          required
                          disabled={loading}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {validationErrors.username && (
                          <p className="text-sm text-red-600">{validationErrors.username}</p>
                        )}
                        <p className="text-xs text-gray-500">Letters, numbers, and underscores only. Min 3 characters.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <Input
                          placeholder="Enter full name"
                          value={createAnalystForm.fullName}
                          onChange={(e) =>
                            setCreateAnalystForm((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          required
                          disabled={loading}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          value={createAnalystForm.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                          disabled={loading}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {validationErrors.email && (
                          <p className="text-sm text-red-600">{validationErrors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                          Phone Number *
                        </label>
                        <Input
                          placeholder="Enter phone number"
                          value={createAnalystForm.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                          required
                          disabled={loading}
                          className="border-blue-200 focus:border-blue-400"
                        />
                        {validationErrors.phoneNumber && (
                          <p className="text-sm text-red-600">{validationErrors.phoneNumber}</p>
                        )}
                        <p className="text-xs text-gray-500">10-15 digits, international format supported</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4 border-t border-blue-100">
                      <Button 
                        type="submit" 
                        disabled={loading || !isFormValid()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          'Create Data Analyst'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("analysts")}
                        className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </div>
      
    </div>
  );
}