import { useState, useEffect } from 'react'

interface ProgressiveImageProps {
  lowQualitySrc: string;
  highQualitySrc: string;
  className?: string;
}

export function ProgressiveImage({ 
  lowQualitySrc, 
  highQualitySrc,
  className = "w-full h-full object-cover rounded-lg"
}: ProgressiveImageProps) {
  const [src, setSrc] = useState(lowQualitySrc)

  useEffect(() => {
    const img = new Image()
    img.src = highQualitySrc
    img.onload = () => {
      setSrc(highQualitySrc)
    }
  }, [highQualitySrc])

  return (
    <img
      src={src}
      className={`transition-opacity duration-300 ${
        src === lowQualitySrc ? 'blur-sm' : 'blur-0'
      } ${className}`}
      alt="Content"
    />
  )
} 