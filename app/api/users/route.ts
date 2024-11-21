import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

const dbname = "articlewriting";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);

    const users = await db.collection('users').find().sort({ name: 1 }).toArray();

    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const { name, email, password,user_type } = await req.json()

    const client = await clientPromise
    const db = client.db(dbname);

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user
    const user = await db.collection('users').insertOne({
      name,
      email,
      user_type,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(user);

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}