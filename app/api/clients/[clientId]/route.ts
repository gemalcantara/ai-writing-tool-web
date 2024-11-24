import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
const dbname = "articlewriting";

export async function GET(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    const clientData = await db.collection('clients').findOne({ _id: new ObjectId(params.clientId) });

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const { name, guideline } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('clients').updateOne(
      { _id: new ObjectId(params.clientId) },
      { $set: { name, guideline } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { clientId: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    
    const result = await db.collection('clients').deleteOne({ _id: new ObjectId(params.clientId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}