// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { verifyOTP } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const { userId, otp } = await request.json()

    if (!userId || !otp) {
      return NextResponse.json(
        { error: 'User ID and OTP are required' },
        { status: 400 }
      )
    }

    // Verify OTP
    const isValidOTP = await verifyOTP(BigInt(userId), otp)
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Update user's email verification status
    await db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, BigInt(userId)))

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

