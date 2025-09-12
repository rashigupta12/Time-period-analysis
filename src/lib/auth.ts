// src/lib/auth.ts
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

// Log the JWT secret on the server start
console.log("jwt token in auth" , process.env.JWT_SECRET)

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

const JWT_SECRET = process.env.JWT_SECRET

export interface JWTPayload {
  userId: string
  role: 'ADMIN' | 'DATA_ANALYST'
  username: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Log the token string to inspect its value
    console.log("Received token for verification:", token);
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    return payload
  } catch (error) {
    // Log the specific error for better debugging
    console.error("Token verification failed:", error);
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload) return null

    // Verify user still exists in database
    const user = await db.select().from(users).where(eq(users.id, BigInt(payload.userId))).limit(1)
    if (user.length === 0) return null

    return payload
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<JWTPayload> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<JWTPayload> {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  return user
}