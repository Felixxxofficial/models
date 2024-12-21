'use client'

import { useEffect, useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
}

export default function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const playVideo = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      // Remove controls temporarily
      video.controls = false
      
      // Try multiple play methods
      const playPromise = video.play()
      if (playPromise !== undefined) {
        await playPromise
        setIsPlaying(true)
        
        // Re-enable controls after successful play
        video.controls = true
        
        // Try fullscreen
        try {
          if ((video as any).webkitEnterFullscreen) {
            await (video as any).webkitEnterFullscreen()
          } else if (video.requestFullscreen) {
            await video.requestFullscreen()
          }
        } catch (e) {
          console.log('Fullscreen failed:', e)
        }
      }
    } catch (error) {
      console.error('Play failed:', error)
      // Reset on failure
      video.controls = false
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const handlePress = async (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      
      if (!isPlaying) {
        await playVideo()
      }
    }

    // Add multiple event listeners to catch all interactions
    container.addEventListener('touchstart', handlePress, { passive: false })
    container.addEventListener('click', handlePress)
    video.addEventListener('touchstart', handlePress, { passive: false })
    video.addEventListener('click', handlePress)

    // Track video state
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      video.controls = false
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      container.removeEventListener('touchstart', handlePress)
      container.removeEventListener('click', handlePress)
      video.removeEventListener('touchstart', handlePress)
      video.removeEventListener('click', handlePress)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [isPlaying])

  return (
    <div 
      ref={containerRef}
      className="relative w-full touch-none select-none"
      style={{ touchAction: 'none' }}
    >
      <video
        ref={videoRef}
        src={src}
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        preload="auto"
        muted={false}
        controls={isPlaying}
        className="w-full rounded-lg cursor-pointer"
        style={{ 
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none'
        }}
      />
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg"
          style={{ touchAction: 'none' }}
        >
          <svg 
            className="w-16 h-16 text-white pointer-events-none"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  )
} 