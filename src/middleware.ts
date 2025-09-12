import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Add this to force Node.js runtime
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log("=== MIDDLEWARE DEBUG ===")
  console.log("1. Pathname:", pathname)

  console.log("JWT_SECRET from env:", process.env.JWT_SECRET); 

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/verify-otp', 
    '/change-password', 
    '/admin/login',
    '/api/auth/login',
    '/api/auth/admin/login',
    '/api/auth/verify-otp',
    '/api/auth/resend-otp',
    '/api/auth/change-password'
  ]

  // Check if the current route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    console.log("2. Public route - allowing access")
    return NextResponse.next()
  }
  
  // Handle DevTools requests
  if (pathname.startsWith('/.well-known')) {
    console.log("3. DevTools route - allowing access")
    return NextResponse.next()
  }

  // Skip middleware for other API routes
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
    console.log("4. API route - allowing access")
    return NextResponse.next()
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value
  console.log("5. Token exists:", !!token)

  if (!token) {
    console.log('6. No token found, redirecting to login')
    // Redirect to appropriate login page based on route
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  try {
    // Verify token
    const payload = await verifyToken(token)
    if (!payload) {
      console.log('7. Invalid token, redirecting to login')
      // Invalid token, redirect to login
      if (pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    console.log("8. Token valid, payload:", payload)

    // Check role-based access
    if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
      console.log('9. Non-admin trying to access admin routes')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect admin to admin dashboard if accessing salesperson routes
    if (pathname.startsWith('/dashboard') && payload.role === 'ADMIN') {
      console.log('10. Admin accessing salesperson routes, redirecting to admin dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    console.log('11. Access granted for:', pathname, 'Role:', payload.role)
    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    // Redirect to appropriate login page on error
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}