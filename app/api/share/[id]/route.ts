import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
const dbname = "articlewriting";
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get('user')
    const client = await clientPromise;
    const db = client.db(dbname);
    
    if (!userCookie || !verifyToken(JSON.parse(userCookie.value).session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const clientData = await db.collection('history').findOne({ _id: new ObjectId(params.id) });
    console.log(clientData);

    if (!clientData) {
        return NextResponse.json({ error: 'Article not found' }, { status: 404 });
      }

    console.log(clientData)
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