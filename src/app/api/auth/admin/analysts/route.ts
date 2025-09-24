// src/app/api/admin/analysts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, userDetails } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth';

/**
 * Handles the GET request to fetch all DATA_ANALYST users.
 * This route is protected and can only be accessed by an admin.
 * @param {NextRequest} request The incoming Next.js request.
 * @returns {NextResponse} The response with the list of data analysts.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate and authorize the request.
    // Ensure the current user has an 'ADMIN' role.
    await requireAdmin();

    // 2. Parse query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // 3. Query the database to get all DATA_ANALYST users with their details
    const query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        isFirstLogin: users.isFirstLogin,
        createdAt: users.createdAt,
        fullName: userDetails.fullName,
        phoneNumber: userDetails.phoneNumber,
        aadharCardNumber: userDetails.aadharCardNumber,
      })
      .from(users)
      .leftJoin(userDetails, eq(users.id, userDetails.userId))
      .where(eq(users.role, 'DATA_ANALYST'))
      .orderBy(users.createdAt);

    const analysts = await query;

    // 4. Filter results based on search term if provided
    let filteredAnalysts = analysts;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAnalysts = analysts.filter(analyst => 
        analyst.username?.toLowerCase().includes(searchLower) ||
        analyst.email?.toLowerCase().includes(searchLower) ||
        analyst.fullName?.toLowerCase().includes(searchLower)
      );
    }

    // 5. Apply pagination
    const totalCount = filteredAnalysts.length;
    const paginatedAnalysts = filteredAnalysts.slice(offset, offset + limit);

    // 6. Transform the data for frontend consumption
    const formattedAnalysts = paginatedAnalysts.map(analyst => ({
      id: analyst.id.toString(),
      username: analyst.username,
      email: analyst.email,
      fullName: analyst.fullName || '',
      phoneNumber: analyst.phoneNumber || '',
      aadharCardNumber: analyst.aadharCardNumber || '',
      role: analyst.role,
      isEmailVerified: analyst.isEmailVerified,
      isFirstLogin: analyst.isFirstLogin,
      createdAt: analyst.createdAt?.toISOString() || new Date().toISOString(),
    }));

    // 7. Return the successful response with pagination metadata
    return NextResponse.json({
      success: true,
      analysts: formattedAnalysts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: offset + limit < totalCount,
      },
    });

  } catch (error) {
    console.error('Fetch analysts error:', error);

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
      { 
        error: 'Internal server error',
        success: false 
      },
      { status: 500 }
    );
  }
}

/**
 * Handles the DELETE request to delete a DATA_ANALYST user.
 * This route is protected and can only be accessed by an admin.
 * @param {NextRequest} request The incoming Next.js request.
 * @returns {NextResponse} The response with the result of the operation.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Authenticate and authorize the request.
    await requireAdmin();

    // 2. Parse the request body to get the analyst ID
    const { analystId } = await request.json();

    if (!analystId) {
      return NextResponse.json(
        { error: 'Analyst ID is required.' },
        { status: 400 }
      );
    }

    // 3. Verify the user exists and is a DATA_ANALYST
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, BigInt(analystId)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'Analyst not found.' },
        { status: 404 }
      );
    }

    if (existingUser[0].role !== 'DATA_ANALYST') {
      return NextResponse.json(
        { error: 'Can only delete DATA_ANALYST users.' },
        { status: 400 }
      );
    }

    // 4. Delete the user (this will cascade delete user details due to foreign key constraint)
    await db
      .delete(users)
      .where(eq(users.id, BigInt(analystId)));

    // 5. Return success response
    return NextResponse.json({
      success: true,
      message: 'Data analyst deleted successfully.',
    });

  } catch (error) {
    console.error('Delete analyst error:', error);

    // Handle specific errors
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