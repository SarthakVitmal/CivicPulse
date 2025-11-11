import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Login Request Started ===')
    
    // Use a guaranteed value - check env first, then use hardcoded fallback
    const jwtSecret = process.env.JWT_SECRET || 'civic-pulse-jwt-secret-key-2025-change-in-production'
    console.log('JWT_SECRET loaded:', jwtSecret.substring(0, 10) + '...')

    await connectDB()
    console.log('Database connected')

    const body = await request.json()
    const { email, password } = body
    console.log('Login attempt for email:', email)

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    console.log('Searching for user...')
    const user = await User.findOne({ email })
    if (!user) {
      console.log('User not found:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('👤 User found:', { email: user.email, hasPassword: !!user.password })

    // Check password
    console.log('Verifying password...')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      console.log('Invalid password')
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    console.log('Generating JWT token...')
    const token = jwt.sign(
      { userId: String(user._id), email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    )
    console.log('✅ Token generated successfully')

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt
    }

    return NextResponse.json({
      message: 'Login successful',
      user: userResponse,
      token
    }, { status: 200 })

  } catch (error) {
    console.error('Login error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}