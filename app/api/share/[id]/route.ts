import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const dbname = "articlewriting";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    const clientData = await db.collection('history').findOne({ _id: new ObjectId(params.id) });

    if (!clientData) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(clientData, {
      headers: {
        'X-Robots-Tag': 'noindex, nofollow',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      }
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}