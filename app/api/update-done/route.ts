import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, done, isInstagram, doneField } = body;

    // Debug environment variables
    console.log('Environment check:', {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      hasRedditBaseId: !!process.env.AIRTABLE_REDDIT_BASE_ID,
      hasIgTable: !!process.env.AIRTABLE_IG,
      hasRedditTable: !!process.env.AIRTABLE_REDDIT_TABLE_ID,
      isInstagram
    });

    if (!process.env.AIRTABLE_API_KEY) {
      throw new Error('Missing Airtable API key');
    }

    // Use different base IDs for Instagram and Reddit
    const baseId = isInstagram ? 
      process.env.AIRTABLE_BASE_ID : 
      process.env.AIRTABLE_REDDIT_BASE_ID;

    if (!baseId) {
      throw new Error(`Missing ${isInstagram ? 'AIRTABLE_BASE_ID' : 'AIRTABLE_REDDIT_BASE_ID'}`);
    }

    // Initialize Airtable with the correct base
    const base = new Airtable({ 
      apiKey: process.env.AIRTABLE_API_KEY 
    }).base(baseId);

    // Get the correct table ID
    const tableId = isInstagram ? 
      process.env.AIRTABLE_IG : 
      process.env.AIRTABLE_REDDIT_TABLE_ID;

    if (!tableId) {
      throw new Error(`Missing ${isInstagram ? 'AIRTABLE_IG' : 'AIRTABLE_REDDIT_TABLE_ID'}`);
    }

    console.log('Updating record:', {
      taskId,
      done,
      isInstagram,
      doneField,
      baseId: baseId.substring(0, 5) + '...',
      tableId: tableId.substring(0, 5) + '...',
      recordData: { [doneField]: done }
    });

    // Update the record
    const record = await base(tableId).update(taskId, {
      [doneField]: done
    });

    return NextResponse.json({ 
      success: true, 
      record: {
        id: record.id,
        fields: record.fields
      }
    });

  } catch (error) {
    console.error('Error updating done status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 