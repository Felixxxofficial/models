import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  try {
    const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${process.env.GOOGLE_API_KEY}&supportsAllDrives=true&acknowledgeAbuse=true`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://drive.google.com/',
        'Origin': 'https://drive.google.com'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Google API Error: ${response.status} ${response.statusText}`);
    }

    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch thumbnail',
      details: error.message
    });
  }
} 