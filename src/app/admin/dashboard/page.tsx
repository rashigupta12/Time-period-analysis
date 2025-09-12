
// src/app/admin/dashboard/page.tsx
import AdminDashboardClient from '@/components/admin/Clientdashboh'
import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'


export default async function AdminDashboard() {
  console.log("admin")
  try {
    const user = await requireAdmin()
    return <AdminDashboardClient user={user} />
  } catch {
    redirect('/admin/login')
  }
}