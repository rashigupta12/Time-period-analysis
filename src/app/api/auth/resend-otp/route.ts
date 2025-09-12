// src/app/api/auth/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createOTP, sendOTPEmail } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user email
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, BigInt(userId)))
      .limit(1)

    if (userResult.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = userResult[0]

    // Generate and send new OTP
    const otp = await createOTP(user.id)
    await sendOTPEmail(user.email, otp ,user.id)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    })
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}