// src/app/admin/dashboard/admin-dashboard-client.tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JWTPayload } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AdminDashboardClientProps {
  user: JWTPayload;
}

export default function AdminDashboardClient({
  user,
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("create-analyst");
  const [createAnalystForm, setCreateAnalystForm] = useState({
    username: "",
    email: "",
    fullName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const router = useRouter();

  const handleCreateAnalyst = async (e: React.FormEvent) => {
    e.preventDefault();
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
          content: `Data Analyst created successfully! Temporary password: ${data.tempPassword}`,
        });
        setCreateAnalystForm({
          username: "",
          email: "",
          fullName: "",
          phoneNumber: "",
        });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className=" text-black px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="font-medium">Welcome, {user.username}</span>
        </div>

        <form>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </form>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        {/* <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'create-analyst' ? 'default' : 'outline'}
            onClick={() => setActiveTab('create-analyst')}
          >
            Create Data Analyst
          </Button>
        </div> */}

        {activeTab === "create-analyst" && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Data Analyst</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreateAnalyst}
                className="space-y-4 max-w-md"
              >
                
                <Input
                  placeholder="Username"
                  value={createAnalystForm.username}
                  onChange={(e) =>
                    setCreateAnalystForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                />

                <Input
                  type="email"
                  placeholder="Email"
                  value={createAnalystForm.email}
                  onChange={(e) =>
                    setCreateAnalystForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                />

                <Input
                  placeholder="Full Name"
                  value={createAnalystForm.fullName}
                  onChange={(e) =>
                    setCreateAnalystForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                />

                <Input
                  placeholder="Phone Number"
                  value={createAnalystForm.phoneNumber}
                  onChange={(e) =>
                    setCreateAnalystForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  required
                  disabled={loading}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Data Analyst"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
