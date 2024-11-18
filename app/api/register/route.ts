import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    const client = await clientPromise
    const db = client.db('articlewriting')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const user = {
      id: result.insertedId.toString(),
      name,
      email,
    }

    // Generate JWT
    const token = signToken(user)

    return NextResponse.json({ user, token })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}