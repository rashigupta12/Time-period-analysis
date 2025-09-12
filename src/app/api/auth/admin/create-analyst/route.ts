import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userDetails } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, requireAdmin } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/otp';

/**
 * Generates a random temporary password of 8 characters.
 * @returns {string} The temporary password.
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Handles the POST request to create a new DATA_ANALYST.
 * This route is protected and can only be accessed by an admin.
 * @param {NextRequest} request The incoming Next.js request.
 * @returns {NextResponse} The response with the result of the operation.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate and authorize the request.
    // Ensure the current user has an 'ADMIN' role.
    await requireAdmin();

    // 2. Parse and validate the request body.
    const { username, email, fullName, phoneNumber } = await request.json();

    if (!username || !email || !fullName) {
      return NextResponse.json(
        { error: 'Username, email, and full name are required.' },
        { status: 400 }
      );
    }

    // 3. Check for existing users to prevent duplicates.
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists.' },
        { status: 400 }
      );
    }

    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists.' },
        { status: 400 }
      );
    }

    // 4. Generate a temporary password and hash it.
    const tempPassword = generateTempPassword();
    const hashedPassword = await hashPassword(tempPassword);

    // 5. Create a new user and user details in a single transaction.
    // Note: Drizzle ORM does not have built-in transaction support for `insert` and `update` across different tables in a simple chain.
    // A more robust solution might use `db.transaction()` if your database supports it, to ensure atomicity.
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        passwordHash: hashedPassword,
        role: 'DATA_ANALYST',
        isEmailVerified: false,
        isFirstLogin: true,
      })
      .returning();

    const userId = newUser[0].id;

    await db
      .insert(userDetails)
      .values({
        userId,
        fullName,
        phoneNumber,
      });

    // 6. Send a welcome email to the new DATA_ANALYST.
    try {
      await sendWelcomeEmail(username, tempPassword ,email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Decide if this is a critical failure. For this case, we log the error but proceed with a success response.
      // This prevents the user creation from failing if the email service is down.
    }

    // 7. Return a success response.
    return NextResponse.json({
      success: true,
      message: 'DATA_ANALYST account created successfully.',
      user: {
        id: userId.toString(),
        username,
        email,
        role: 'DATA_ANALYST',
        tempPassword, // You might want to remove this in a production environment for security.
      },
    });
  } catch (error) {
    console.error('Create DATA_ANALYST error:', error);

    // 8. Handle specific errors with appropriate HTTP status codes.
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      if (error.message === 'Admin access required') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}