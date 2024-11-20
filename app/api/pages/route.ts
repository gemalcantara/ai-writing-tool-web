import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'
const dbname = "articlewriting";
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);

    const pages = await db.collection('pages').find().sort({ name: 1 }).toArray();

    return NextResponse.json(pages);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const { name, guideline } = await request.json();
      const client = await clientPromise;
      const db = client.db(dbname);
  
      const result = await db.collection('pages').insertOne({
        name,
        guideline,
        createdAt: new Date(),
      });
  
      return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }
}
export async function HEAD(request: Request, { params }: { params: { pageId: string } }) {
    return NextResponse.json({params});

    try {
      const client = await clientPromise;
      const db = client.db(dbname);
      const clientData = await db.collection('pages').findOne({ _id: new ObjectId(params.pageId) });
  
      if (!clientData) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }
  
      return NextResponse.json(clientData);
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
    }
  }