import type { NextApiRequest, NextApiResponse } from 'next'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  
  // Try to get from cache first
  const cached = await redis.get(`video:${id}`)
  if (cached) {
    return res.status(200).json(cached)
  }

  // If not in cache, fetch from Google Drive
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${process.env.GOOGLE_API_KEY}`)
  const data = await response.json()
  
  // Cache for 1 hour
  await redis.set(`video:${id}`, data, { ex: 3600 })
  
  res.status(200).json(data)
} 