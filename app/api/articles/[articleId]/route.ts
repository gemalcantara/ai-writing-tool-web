import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
const dbname = "articlewriting";

export async function GET(request: Request, { params }: { params: { articleId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    const clientData = await db.collection('history').findOne({ _id: new ObjectId(params.articleId) });

    if (!clientData) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { articleId: string } }) {
  try {
    const { id, ...updateData } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);

    const result = await db.collection('history').updateOne(
      { _id: new ObjectId(params.articleId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { articleId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('history').deleteOne({ _id: new ObjectId(params.articleId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete history' }, { status: 500 });
  }
}