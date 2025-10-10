// src/app/dashboard/salesperson-dashboard-client.tsx
"use client";
import { JWTPayload } from "@/lib/auth";
import { useRouter } from "next/navigation";
import MarketDataDashboard from "../dashboard/MarketdataDashboard";

interface SalespersonDashboardClientProps {
  user: JWTPayload;
}

export default function SalespersonDashboardClient({
  user,
}: SalespersonDashboardClientProps) {
  const router = useRouter();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="text-black px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
          <span className="font-medium">Welcome, {user.username}</span>
        </div>
        <form onSubmit={handleLogout}>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign Out
          </button>
        </form>
      </nav>
      <main className="">
        <MarketDataDashboard />
      </main>
    </div>
  );
}