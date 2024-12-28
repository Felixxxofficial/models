'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
}

export default function VideoPlayer({ src, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')

  const getGoogleDriveId = (url: string) => {
    const match = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/)
    return match ? match[1] : null
  }

  const getGoogleApiUrl = (url: string) => {
    const driveId = getGoogleDriveId(url)
    if (driveId) {
      return `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&supportsAllDrives=true&acknowledgeAbuse=true`
    }
    return url
  }

  const playVideo = async () => {
    if (!isPlaying) {
      try {
        const embedUrl = src.includes('uc?export=view') ? getGoogleApiUrl(src) : src
        setVideoUrl(embedUrl)
        setIsPlaying(true)
        
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.muted = false
            videoRef.current.play()
            .catch(error => {
              console.error('Error playing video:', error)
            })
          }
        }, 100)
      } catch (error) {
        console.error('Error accessing video:', error)
      }
    }
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full touch-none select-none aspect-[9/16]"
      style={{ touchAction: 'none' }}
    >
      {!isPlaying ? (
        <>
          {thumbnail && (
            <img 
              src={thumbnail.includes('uc?export=view') ? getGoogleApiUrl(thumbnail) : thumbnail}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={playVideo}
              onError={(e) => console.error('Thumbnail failed to load:', thumbnail)}
            />
          )}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer"
            onClick={playVideo}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90">
              <svg 
                className="w-8 h-8 text-black ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <div className="relative w-full h-full bg-black rounded-lg">
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            controls
            playsInline
            muted
            onError={(e) => console.error('Video failed to load:', videoUrl)}
          />
        </div>
      )}
    </div>
  )
} 