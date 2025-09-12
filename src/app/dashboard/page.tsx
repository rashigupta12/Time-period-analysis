// src/app/dashboard/page.tsx
import SalespersonDashboardClient from '@/components/saleperson/salesperson-dashboard-client'
import { requireAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'


export default async function SalespersonDashboard() {
  try {
    const user = await requireAuth()
    
    if (user.role === 'ADMIN') {
      redirect('/admin/dashboard')
    }
    
    return <SalespersonDashboardClient user={user} />
  } catch {
    redirect('/login')
  }
}

