'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
}

export default function VideoPlayer({ src, thumbnail }: VideoPlayerProps) {
  const videoRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const getGoogleDriveId = (url: string) => {
    const match = url.match(/\/d\/([^/]+)/)
    return match ? match[1] : null
  }

  const getVideoUrl = (url: string) => {
    const driveId = getGoogleDriveId(url)
    if (driveId) {
      return `https://drive.google.com/file/d/${driveId}/preview`
    }
    return url
  }

  const playVideo = async () => {
    setIsPlaying(true)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handlePress = async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!isPlaying) {
        await playVideo()
      }
    }

    container.addEventListener('touchstart', handlePress, { passive: false })
    container.addEventListener('click', handlePress)

    return () => {
      container.removeEventListener('touchstart', handlePress)
      container.removeEventListener('click', handlePress)
    }
  }, [isPlaying])

  const videoUrl = getVideoUrl(src)

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
              src={thumbnail} 
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
          )}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg cursor-pointer"
            style={{ touchAction: 'none' }}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors">
              <svg 
                className="w-8 h-8 text-black ml-1 pointer-events-none"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </>
      ) : (
        <iframe
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  )
} 