import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import clientPromise from '@/lib/mongodb'
import { signToken } from '@/lib/jwt'

export async function POST(req: Request) {
  try {
    // Check if the request body is empty
    const text = await req.text()
    if (!text) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 })
    }

    // Parse the JSON safely
    let body
    try {
      body = JSON.parse(text)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
    }

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('articlewriting')

    // Find user by email
    const user = await db.collection('users').findOne({ email: email })

    if (!user) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 400 })
    }

    const userForToken = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    }

    // Generate JWT
    const token = signToken(userForToken)

    return NextResponse.json({ user: userForToken, token })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}