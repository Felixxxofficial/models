import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_KEY 
}).base(process.env.AIRTABLE_REDDIT_BASE_ID!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewId = searchParams.get('viewId');

  if (!viewId) {
    return NextResponse.json(
      { error: 'View ID is required' },
      { status: 400 }
    );
  }

  try {
    const records = await base(process.env.AIRTABLE_REDDIT_TABLE_ID!)
      .select({
        view: viewId
      })
      .all();

    const posts = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Reddit posts' },
      { status: 500 }
    );
  }
} 