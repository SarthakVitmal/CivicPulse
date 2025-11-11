import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Signup Request Started ===')
    
    // Connect to database
    await connectDB()
    console.log('Database connected')

    const body = await request.json()
    console.log('Request body received:', { ...body, password: '***' })
    
    const { name, email, phone, address, password, coordinates } = body

    // Validate required fields
    if (!name || !email || !password) {
      console.log('Missing required fields')
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log('Checking if user exists:', email)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('User already exists:', email)
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Prepare location data
    let locationData = {
      type: 'Point',
      coordinates: [0, 0]
    }
    
    if (coordinates && coordinates.lat && coordinates.lng) {
      locationData.coordinates = [coordinates.lng, coordinates.lat]
    }

    // Create user
    console.log('Creating user...')
    const user = await User.create({
      name,
      email,
      phone: phone || '',
      address: address || '',
      password: hashedPassword,
      location: locationData
    })

    console.log('User created successfully:', user._id)

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Signup error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { message: errorMessage, details: String(error) },
      { status: 500 }
    )
  }
}
