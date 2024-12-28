import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { taskId, done, isInstagram, doneField } = await request.json();
    
    const baseId = isInstagram ? process.env.AIRTABLE_BASE_ID : process.env.AIRTABLE_REDDIT_BASE_ID;
    const tableId = isInstagram ? process.env.AIRTABLE_IG : process.env.AIRTABLE_REDDIT_TABLE_ID;

    console.log('Updating task:', { 
      taskId, 
      done, 
      isInstagram, 
      doneField,
      baseId,
      tableId 
    });

    if (!baseId || !tableId) {
      console.error('Missing configuration:', { baseId, tableId, isInstagram });
      return NextResponse.json(
        { error: 'Missing configuration' },
        { status: 500 }
      );
    }

    const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            id: taskId,
            fields: {
              [doneField]: done
            }
          }
        ]
      })
    });

    const responseText = await response.text();
    console.log('Airtable response:', responseText);

    if (!response.ok) {
      console.error('Airtable API error:', {
        status: response.status,
        response: responseText,
        request: { taskId, done, isInstagram, doneField }
      });
      return NextResponse.json(
        { error: 'Failed to update status', details: responseText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 