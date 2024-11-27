import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'

const dbname = "articlewriting";
export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);

    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name'); // Example: ?name=value
    const type = searchParams.get('type'); // Example: ?type=value
    const mode = searchParams.get('mode'); // Example: ?type=value

    // Build a query object based on the parameters
    const query: Record<string, any> = {};
    if (name) query.name = name;
    if (type) query.type = type;
    if (mode) query.mode = mode;
    // Fetch and sort the results
    const result = await db.collection('siteOptions').find(query).sort({ name: 1 }).toArray();

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch site options' }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const { name, guideline } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);

    const result = await db.collection('siteOptions').insertOne({
      name,
      guideline,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create site option' }, { status: 500 });
  }
}