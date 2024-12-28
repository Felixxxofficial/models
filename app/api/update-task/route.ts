import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const { taskId, done, isInstagram, userName } = body;

    // Log environment variables (safely)
    console.log('Environment check:', {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasRedditBaseId: !!process.env.AIRTABLE_REDDIT_BASE_ID,
      hasIgTable: !!process.env.AIRTABLE_IG,
      hasRedditTable: !!process.env.AIRTABLE_REDDIT_TABLE_ID
    });

    // Validate inputs
    if (!taskId || typeof done !== 'boolean' || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields', received: { taskId, done, userName } },
        { status: 400 }
      );
    }

    // Get correct base and table IDs
    const baseId = isInstagram 
      ? process.env.AIRTABLE_BASE_ID 
      : process.env.AIRTABLE_REDDIT_BASE_ID;
    const tableName = isInstagram 
      ? process.env.AIRTABLE_IG 
      : process.env.AIRTABLE_REDDIT_TABLE_ID;

    if (!process.env.AIRTABLE_API_KEY || !baseId || !tableName) {
      console.error('Missing environment variables:', {
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!baseId,
        hasTableName: !!tableName
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Configure Airtable
    const airtable = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });
    const base = airtable.base(baseId);

    console.log('Updating record:', {
      taskId,
      done,
      tableName,
      field: `Done ${userName}`
    });

    // Update the record
    const records = await base(tableName).update([
      {
        id: taskId,
        fields: {
          [`Done ${userName}`]: done
        }
      }
    ]);

    console.log('Update successful:', records);

    return NextResponse.json({
      success: true,
      data: records[0]
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update task',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 