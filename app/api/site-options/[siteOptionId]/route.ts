import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs'

const dbname = "articlewriting";

export async function GET(request: Request, { params }: { params: { siteOptionId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    const clientData = await db.collection('siteOptions').findOne({ _id: new ObjectId(params.siteOptionId) });

    if (!clientData) {
      return NextResponse.json({ error: 'Site option not found' }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch site option' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { siteOptionId: string } }) {
  try {
    const { name, password,user_type } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.collection('siteOptions').updateOne(
      { _id: new ObjectId(params.siteOptionId) },
      { $set: { name, password:hashedPassword,user_type } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Site option not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update site option' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { siteOptionId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('siteOptions').deleteOne({ _id: new ObjectId(params.siteOptionId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Site option not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete site option' }, { status: 500 });
  }
}