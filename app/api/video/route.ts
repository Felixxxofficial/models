import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: Request) {
  // Get the session and access token
  const session = await getServerSession(authOptions);
  
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  try {
    // Direct download URL format
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    
    // Use the session's access token
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Drive API error: ${response.statusText}`);
    }

    // Stream the response
    const data = await response.blob();
    return new NextResponse(data, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'video/mp4',
        'Content-Length': response.headers.get('content-length') || '',
      },
    });
  } catch (error) {
    console.error('Video proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
} 