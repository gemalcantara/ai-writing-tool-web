import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb';
const dbname = "articlewriting";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbname);
    const articles = await db.collection('history').aggregate([
      {
        $addFields: {
          sortField: {
            $cond: {
              if: { $eq: ["$production_date", null] }, // If dateField is null
              then: "$created_at",               // Fallback to createdAt
              else: "$production_date"                // Otherwise use dateField
            }
          }
        }
      },
      {
        $sort: { sortField: 1, _id: -1 } // Sort by sortField in ascending order, then by _id in descending order
      }
    ]).toArray();
    return NextResponse.json(articles);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { created_by, article_output, article_title, outline, outline_input_data } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);
    const currentDate = new Date();

    // Get the month and year in mm/yy format
    const monthYear = `${String(currentDate.getMonth() + 1).padStart(2, '0')}/${String(currentDate.getFullYear()).slice(-2)}`;
    
    // Get the full date in yyyy/mm/dd format
    const fullDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    const result = await db.collection('history').insertOne({
      created_by,
      article_output,
      article_title,
      outline,
      outline_input_data,
      created_at: fullDate,
      production_date: monthYear
    });

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updateData } = await request.json();
    const client = await clientPromise;
    const db = client.db(dbname);

    const result = await db.collection('history').updateOne(
      { _id: new ObjectId(id) },
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