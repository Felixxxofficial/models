import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const videoUrl = url.searchParams.get('url')
  const method = request.method
  const apiKey = request.headers.get('x-api-key')

  if (!videoUrl) {
    return new NextResponse('Missing video URL', { status: 400 })
  }

  if (!apiKey) {
    return new NextResponse('Missing API key', { status: 401 })
  }

  try {
    console.log(`Video proxy ${method} request for:`, videoUrl)

    // For HEAD requests, we just need to verify the video exists
    if (method === 'HEAD') {
      const response = await fetch(videoUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'video/*'
        }
      })

      console.log('HEAD response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        console.error('HEAD request failed:', response.status, response.statusText)
        throw new Error(`HEAD request failed: ${response.status} - ${response.statusText}`)
      }

      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('content-type') || 'video/mp4',
          'Content-Length': response.headers.get('content-length') || '',
          'Accept-Ranges': 'bytes'
        }
      })
    }

    // Handle range request for video streaming
    const range = request.headers.get('range')
    const fetchOptions: RequestInit = {
      headers: {
        'Range': range || 'bytes=0-',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'video/*'
      }
    }

    console.log('Fetching with options:', {
      url: videoUrl,
      range: range || 'bytes=0-',
      hasApiKey: !!apiKey
    })

    const response = await fetch(videoUrl, fetchOptions)

    if (!response.ok) {
      console.error('Video fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      throw new Error(`Video fetch failed: ${response.status} - ${response.statusText}`)
    }

    // Get content details
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type') || 'video/mp4'

    console.log('Video response headers:', {
      contentType,
      contentLength,
      range: response.headers.get('content-range')
    })

    // Prepare response headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': contentLength || '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*'
    })

    // If this was a range request, add Content-Range header
    if (range && response.headers.get('content-range')) {
      headers.set('Content-Range', response.headers.get('content-range')!)
    }

    // Return the proxied response
    return new NextResponse(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    console.error('Video proxy error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: error.message || 'Error fetching video',
        details: {
          url: videoUrl,
          hasApiKey: !!apiKey,
          method: method
        }
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

// Add support for HEAD requests
export { GET as HEAD } 