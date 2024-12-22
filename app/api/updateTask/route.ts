import { NextRequest, NextResponse } from 'next/server';
import { updateTask } from '@/lib/airtable';

export async function POST(request: Request) {
  try {
    const { taskId, done, isInstagram } = await request.json();
    
    if (!taskId || typeof done !== 'boolean' || typeof isInstagram !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const result = await updateTask(taskId, done, isInstagram);
    return NextResponse.json({ success: true, data: result });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
} 