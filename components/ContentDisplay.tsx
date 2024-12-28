import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import confetti from 'canvas-confetti';

interface ContentDisplayProps {
  content: IGPost | RedditPost;
  platform: "instagram" | "reddit";
  onComplete?: () => void;
}

export default function ContentDisplay({ content, platform, onComplete }: ContentDisplayProps) {
  const [isError, setIsError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getMediaUrl = () => {
    if (content['Cloudinary URL']) {
      return content['Cloudinary URL'];
    }
    if (content.type === 'video') {
      return content['Instagram GDrive'];
    }
    return content.Thumbnail?.[0]?.url || '';
  };

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const isVideo = () => {
    const url = content['Cloudinary URL']?.toLowerCase();
    if (!url) return content.type === 'video';
    
    return url.endsWith('.mp4') || 
           url.endsWith('.mov') || 
           url.endsWith('.webm') || 
           url.includes('reel');
  };

  const handleToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      await onDone(
        task.id, 
        checked, 
        isInstagramPost,
        doneField || ''
      );
      setIsDone(checked);
      
      // Trigger confetti and callback when marking as done
      if (checked) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        onComplete?.();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      setIsDone(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {isVideo() ? (
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-md"
            controls={isPlaying}
            playsInline
            src={getMediaUrl()}
            onError={() => setIsError(true)}
          >
            Your browser does not support the video tag.
          </video>
          
          {/* Big Play Button Overlay */}
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md cursor-pointer"
              onClick={handlePlayClick}
            >
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-colors">
                <svg 
                  className="w-8 h-8 text-black ml-1" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Image
          src={getMediaUrl()}
          alt={content.title || 'Content'}
          width={400}
          height={400}
          className="w-full h-full object-cover rounded-md"
          onError={() => setIsError(true)}
        />
      )}
      {isError && <div className="text-red-500">Error loading media</div>}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white rounded">
        {platform}
      </div>
    </div>
  );
} 