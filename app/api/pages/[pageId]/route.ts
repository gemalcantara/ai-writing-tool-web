import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
const dbname = "articlewriting";

export async function GET(request: Request, { params }: { params: { pageId: string } }) {
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

export async function PUT(request: Request, { params }: { params: { pageId: string } }) {
  try {
    const { name, guideline } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('pages').updateOne(
      { _id: new ObjectId(params.pageId) },
      { $set: { name, guideline } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { pageId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('pages').deleteOne({ _id: new ObjectId(params.pageId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}