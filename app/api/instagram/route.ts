import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const viewId = searchParams.get('viewId');

  // Log environment variables
  console.log('Instagram API Environment Check:', {
    AIRTABLE_API_KEY: !!process.env.AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID: !!process.env.AIRTABLE_BASE_ID,
    AIRTABLE_IG: !!process.env.AIRTABLE_IG,
    viewId
  });

  if (!process.env.AIRTABLE_API_KEY) {
    return NextResponse.json(
      { error: 'Airtable API key is missing' },
      { status: 500 }
    );
  }

  if (!process.env.AIRTABLE_BASE_ID) {
    return NextResponse.json(
      { error: 'Airtable Base ID is missing' },
      { status: 500 }
    );
  }

  if (!process.env.AIRTABLE_IG) {
    return NextResponse.json(
      { error: 'AIRTABLE_IG environment variable is missing' },
      { status: 500 }
    );
  }

  if (!viewId) {
    return NextResponse.json(
      { error: 'View ID is required' },
      { status: 400 }
    );
  }

  try {
    // Initialize Airtable with detailed logging
    console.log('Initializing Airtable connection...');
    
    const base = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(process.env.AIRTABLE_BASE_ID);

    console.log('Airtable base initialized, attempting query...');

    const records = await base(process.env.AIRTABLE_IG)
      .select({
        view: viewId
      })
      .all();

    console.log('Records fetched successfully:', {
      count: records.length,
      firstRecordId: records[0]?.id
    });

    const posts = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return NextResponse.json(posts);
  } catch (error) {
    // Detailed error logging
    console.error('Error in Instagram API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      viewId,
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Instagram posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 