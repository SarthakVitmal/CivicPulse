import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Issue from '@/models/Issue';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { calculateIssuePriority } from '@/lib/priorityCalculator';
import {
  uploadMultipleImagesToCloudinary,
  validateCloudinaryConfig,
  CloudinaryUploadResult
} from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const latitude = parseFloat(formData.get('latitude') as string);
    const longitude = parseFloat(formData.get('longitude') as string);
    const address = formData.get('address') as string;

    // Get uploaded files
    const photoFiles = formData.getAll('photos') as File[];

    // Validate required fields
    if (!title || !description || !category || !latitude || !longitude || !address) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Find similar issues in the area (within 5km) with same category
    const similarIssues = await Issue.find({
      category,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: 5000, // 5km
        },
      },
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    }).limit(10);

    // Calculate priority automatically using AI
    const priorityResult = await calculateIssuePriority({
      category,
      title,
      description,
      similarIssuesCount: similarIssues.length,
      useAI: true, // Enable AI-powered detection
    });

    console.log('🎯 Priority calculated:', priorityResult);

    // Handle photo uploads to Cloudinary
    let uploadedPhotos: { url: string; publicId: string }[] = [];

    if (photoFiles && photoFiles.length > 0) {
      try {
        // Validate Cloudinary config
        if (!validateCloudinaryConfig()) {
          console.warn('⚠️ Cloudinary not configured, skipping photo uploads');
        } else {
          console.log(`📸 Uploading ${photoFiles.length} photos to Cloudinary...`);

          // Upload all photos in parallel
          const uploadResults = await uploadMultipleImagesToCloudinary(
            photoFiles,
            'civic-pulse/issues'
          );

          uploadedPhotos = uploadResults.map(result => ({
            url: result.secure_url,
            publicId: result.public_id,
          }));

          console.log(`✅ Successfully uploaded ${uploadedPhotos.length} photos`);
        }
      } catch (uploadError) {
        console.error('❌ Photo upload failed:', uploadError);
        // Continue with issue creation even if photo upload fails
        // uploadedPhotos remains empty array
      }
    }

    // Create issue
    const issue = await Issue.create({
      title,
      description,
      category,
      priority: priorityResult.priority,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON format: [lng, lat]
      },
      address,
      userId: decoded.userId,
      photos: uploadedPhotos,
      status: 'Pending',
    });

    console.log('✅ Issue created:', issue._id);

    return NextResponse.json(
      {
        message: 'Issue reported successfully',
        issue: {
          _id: issue._id,
          title: issue.title,
          status: issue.status,
          priority: issue.priority,
          priorityScore: priorityResult.score,
          priorityFactors: priorityResult.factors,
          aiAnalysis: priorityResult.aiAnalysis, // AI reasoning if available
          photos: uploadedPhotos, // Include uploaded photo URLs
          createdAt: issue.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error creating issue:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
