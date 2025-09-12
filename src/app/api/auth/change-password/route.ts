// src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Get user details
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

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update user password and mark as not first login
    await db
      .update(users)
      .set({ 
        passwordHash: hashedPassword,
        isFirstLogin: false
      })
      .where(eq(users.id, BigInt(userId)))

    // Create JWT token for automatic login
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
      message: 'Password changed successfully',
      user: {
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}