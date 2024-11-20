import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'

const dbname = "articlewriting";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);

    const clients = await db.collection('clients').find().sort({ name: 1 }).toArray();

    return NextResponse.json(clients);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const { name, guideline } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);

    const result = await db.collection('clients').insertOne({
      name,
      guideline,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}