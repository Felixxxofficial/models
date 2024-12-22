import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface ContentDisplayProps {
  content: IGPost | RedditPost;
  type: 'instagram' | 'reddit';
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isReel = type === 'instagram' && 'Instagram GDrive' in content && content['Instagram GDrive'];
  const isRedditVideo = type === 'reddit' && content.Media === 'Gif/Video';
  const isVideo = isReel || isRedditVideo;

  // Convert Google Drive view URL to embed URL
  const getDirectVideoUrl = (driveUrl: string) => {
    if (!driveUrl) return '';
    
    // Extract file ID from various Google Drive URL formats
    let fileId = '';
    if (driveUrl.includes('/file/d/')) {
      fileId = driveUrl.split('/file/d/')[1].split('/')[0];
    } else if (driveUrl.includes('id=')) {
      fileId = driveUrl.split('id=')[1].split('&')[0];
    }
    
    if (!fileId) {
      console.error('Could not extract file ID from URL:', driveUrl);
      return '';
    }

    // Use the embed URL format
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const handleVideoClick = () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing video:', error);
          });
        }
      }
    } catch (error) {
      console.error('Error handling video click:', error);
    }
  };

  if (type === 'instagram') {
    const igPost = content as IGPost;
    const thumbnail = igPost.Thumbnail?.[0]?.url;
    const videoUrl = igPost['Instagram GDrive'];
    const directVideoUrl = videoUrl ? getDirectVideoUrl(videoUrl) : '';

    return (
      <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto">
        {thumbnail ? (
          isReel && directVideoUrl ? (
            <div className="relative w-full h-full">
              <iframe
                src={directVideoUrl}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          ) : (
            <Image
              src={thumbnail}
              alt={igPost.title || 'Instagram post'}
              fill
              sizes="(max-width: 400px) 100vw, 400px"
              priority={true}
              className="object-cover rounded-lg"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-400">No preview available</span>
          </div>
        )}
      </div>
    );
  }

  // Reddit content display
  const redditPost = content as RedditPost;
  const redditImage = redditPost.Image?.[0]?.url;
  const redditVideoUrl = redditPost['URL Gdrive'];
  const directVideoUrl = redditVideoUrl ? getDirectVideoUrl(redditVideoUrl) : '';

  // Debug logs
  console.log('Reddit Video Debug:', {
    isRedditVideo,
    originalUrl: redditVideoUrl,
    processedUrl: directVideoUrl,
    content: redditPost
  });

  return (
    <>
      <div className="relative w-full aspect-[9/16] max-w-[400px] mx-auto">
        {isRedditVideo && directVideoUrl ? (
          <div className="relative w-full h-full">
            <iframe
              src={directVideoUrl}
              className="w-full h-full"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        ) : redditImage ? (
          <div 
            className="cursor-pointer" 
            onClick={() => setIsLightboxOpen(true)}
          >
            <Image
              src={redditImage}
              alt={redditPost.Title || 'Reddit post'}
              fill
              sizes="(max-width: 400px) 100vw, 400px"
              priority={true}
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <span className="text-gray-400">No preview available</span>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[{ src: redditImage || '' }]}
        carousel={{ finite: true }}
        render={{ 
          buttonPrev: () => null,
          buttonNext: () => null
        }}
      />
    </>
  );
} 