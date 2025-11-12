import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'civic-pulse-jwt-secret-key-2025-change-in-production';

    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Fetch all issues created by this user
    const issues = await Issue.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📋 Found ${issues.length} issues for user ${decoded.userId}`);

    return NextResponse.json({
      message: 'Issues fetched successfully',
      issues,
      count: issues.length,
    });
  } catch (error) {
    console.error('❌ Error fetching user issues:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
