// src/app/page.tsx
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()
  
  if (!user) {
    // Not logged in, redirect to salesperson login
    redirect('/login')
  }
  
  if (user.role === 'ADMIN') {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}