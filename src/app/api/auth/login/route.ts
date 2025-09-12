// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth'
import { createOTP, sendOTPEmail } from '@/lib/otp'

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

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Check if this is first login and email needs verification
    if (user.isFirstLogin && !user.isEmailVerified) {
      // Generate and send OTP
      const otp = await createOTP(user.id)
      await sendOTPEmail(user.email, otp ,user.id)
      
      return NextResponse.json({
        requiresOTP: true,
        userId: user.id.toString(),
        message: 'OTP sent to your email for verification',
        email: user.email
      })
    }

    // Check if password needs to be changed (first login but email verified)
    if (user.isFirstLogin && user.isEmailVerified) {
      return NextResponse.json({
        requiresPasswordChange: true,
        userId: user.id.toString(),
        message: 'Please change your password'
      })
    }

    // Normal login - create JWT token
    const token = await createToken({
      userId: user.id.toString(),
      role: user.role,
      username: user.username,
      email: user.email
    })

    // Set auth cookie
    await setAuthCookie(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}