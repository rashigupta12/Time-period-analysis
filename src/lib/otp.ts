import { createTransport } from 'nodemailer';
// src/lib/otp.ts

import { db } from '@/db'
import { otpVerifications } from '@/db/schema'
import { eq, and, gt } from 'drizzle-orm'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createOTP(userId: bigint): Promise<string> {
  const otp = generateOTP()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await db.insert(otpVerifications).values({
    userId,
    otp,
    expiresAt,
  })

  return otp
}

export async function verifyOTP(userId: bigint, otp: string): Promise<boolean> {
  const verification = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.userId, userId),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.isUsed, false),
        gt(otpVerifications.expiresAt, new Date())
      )
    )
    .limit(1)

  if (verification.length === 0) {
    return false
  }

  // Mark OTP as used
  await db
    .update(otpVerifications)
    .set({ isUsed: true })
    .where(eq(otpVerifications.id, verification[0].id))

  return true
}


const transporter = createTransport({
  host: process.env.NODEMAILER_HOST,
  port: parseInt(process.env.NODEMAILER_PORT as string, 10),
  secure: true,
  auth: {
    user: process.env.NODEMAILER_EMAIL_USER,
    pass: process.env.NODEMAILER_EMAIL_PASSWORD,
  },
});


export async function sendOTPEmail(email: string, otp: string , userId: bigint ): Promise<void> {
  console.log(userId)
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-otp?email=${encodeURIComponent(email)}&userId=${userId}`

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'OTP Verification - Futuretek Institute of Astrological Sciences',
    text: `
Dear User,

Your One-Time Password (OTP) for email verification is: ${otp}

You can also verify your OTP directly by clicking the link below:
${verificationUrl}

This OTP will expire in 10 minutes. Please do not share it with anyone.

Regards,  
Futuretek Institute of Astrological Sciences
    `,
    html: `
      <p>Dear User,</p>
      <p>Your One-Time Password (OTP) for email verification is: <b>${otp}</b></p>
      <p>You can also verify your OTP directly by clicking the link below:</p>
      <p><a href="${verificationUrl}" target="_blank">Verify OTP</a></p>
      <p><i>This OTP will expire in 10 minutes. Please do not share it with anyone.</i></p>
      <br/>
      <p>Regards,<br/>Futuretek Institute of Astrological Sciences</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent OTP to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }
}


export async function sendWelcomeEmail(username: string, tempPassword: string, email: string): Promise<void> {
  const loginUrl = `${process.env.NEXTAUTH_URL}/login`

  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Welcome to Futuretek Institute of Astrological Sciences',
    text: `
Dear Student,

Welcome to the Futuretek Institute of Astrological Sciences!

Your account has been created successfully. Please use the following credentials to log in:

Username: ${username}
Temporary Password: ${tempPassword}

Login here: ${loginUrl}

Instructions:
1. Log in with the username and temporary password.
2. You will be prompted to verify your email.
3. You will be required to change your password after your first login.

We’re glad to have you with us!

Regards,  
Futuretek Institute of Astrological Sciences
    `,
    html: `
      <p>Dear Student,</p>
      <p>Welcome to the <b>Futuretek Institute of Astrological Sciences</b>!</p>
      <p>Your account has been created successfully. Please use the following credentials to log in:</p>
      <ul>
        <li><b>Username:</b> ${username}</li>
        <li><b>Temporary Password:</b> ${tempPassword}</li>
      </ul>
      <p><a href="${loginUrl}" target="_blank">Click here to log in</a></p>
      <p><b>Instructions:</b></p>
      <ol>
        <li>Log in with the username and temporary password.</li>
        <li>You will be prompted to verify your email.</li>
        <li>You will be required to change your password after your first login.</li>
      </ol>
      <p>We’re glad to have you with us!</p>
      <br/>
      <p>Regards,<br/>Futuretek Institute of Astrological Sciences</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent welcome email to ${email}`);
  } catch (error) {
    console.error(`Failed to send welcome email to ${email}:`, error);
    throw new Error('Failed to send welcome email.');
  }
}

