// src/app/api/auth/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { verifyPassword, createToken } from '@/lib/auth'
import { db } from '@/db'
import { users } from '@/db/schema'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const user = userResult[0]

    // Verify user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id.toString(),
      role: user.role,
      username: user.username,
      email: user.email
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

    // Set the cookie directly on the response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
