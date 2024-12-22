import { fetchIGPosts, fetchRedditPosts, updateDoneStatus } from '@/lib/airtable';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [instagramData, redditData] = await Promise.all([
      fetchIGPosts(),
      fetchRedditPosts(),
    ]);

    return NextResponse.json({
      instagram: instagramData,
      reddit: redditData,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { taskId, done, isInstagram } = await request.json();
    
    const result = await updateDoneStatus(taskId, done, isInstagram);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 