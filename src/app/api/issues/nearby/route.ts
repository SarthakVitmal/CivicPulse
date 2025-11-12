import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import User from '@/models/User';
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

    // Get user's location
    const user = await User.findById(decoded.userId);
    if (!user || !user.location) {
      return NextResponse.json(
        { message: 'User location not found' },
        { status: 400 }
      );
    }

    const userCoordinates = user.location.coordinates; // [longitude, latitude]

    // Find nearby issues within 10km radius
    // $near requires a geospatial index on location field
    const maxDistance = 10000; // 10 km in meters
    
    const nearbyIssues = await Issue.find({
      userId: { $ne: decoded.userId }, // Exclude user's own issues
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoordinates,
          },
          $maxDistance: maxDistance,
        },
      },
    })
      .limit(50) // Limit to 50 nearby issues
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📍 Found ${nearbyIssues.length} nearby issues for user ${decoded.userId}`);

    return NextResponse.json({
      message: 'Nearby issues fetched successfully',
      issues: nearbyIssues,
      count: nearbyIssues.length,
      radius: maxDistance / 1000, // Convert to km
    });
  } catch (error) {
    console.error('❌ Error fetching nearby issues:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
