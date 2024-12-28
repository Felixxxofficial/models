import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Upstream server error:', {
        status: response.status,
        statusText: response.statusText,
        url
      })
      return new NextResponse('Failed to fetch media', { status: response.status })
    }

    const blob = await response.blob()
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Media proxy error:', error)
    return new NextResponse('Failed to fetch media', { status: 500 })
  }
} 