import React, { useState } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import VideoPlayer from './VideoPlayer';
import { ImageLightbox } from '@/components/ImageLightbox';

interface ContentDisplayProps {
  content: any;
  type: 'instagram' | 'reddit';
}

const formatGDriveUrl = (url: string) => {
  if (!url) return '';
  
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/(.+?)\/view/) || url.match(/id=([^&]+)/);
  if (!match) return url;
  
  const fileId = match[1];
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
};

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [isError, setIsError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const getMediaUrl = () => {
    if (type === 'instagram') {
      return formatGDriveUrl(content['Instagram GDrive']);
    } else {
      return formatGDriveUrl(content['URL Gdrive']);
    }
  };

  const getThumbnailUrl = () => {
    if (type === 'instagram') {
      return formatGDriveUrl(content['GDrive Thumbnail']);
    } else if (type === 'reddit' && content.Media === 'Gif/Video') {
      return formatGDriveUrl(content['URL Thumbnail']);
    }
    return null;
  };

  const isVideo = () => {
    if (type === 'instagram') {
      return true;
    } else {
      return content.Media === 'Gif/Video';
    }
  };

  const mediaUrl = getMediaUrl();
  const thumbnailUrl = getThumbnailUrl();

  if (!mediaUrl) {
    return <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">No media</div>;
  }

  if (isVideo()) {
    console.log('Video URL:', mediaUrl);
    console.log('Thumbnail URL:', thumbnailUrl);
    return (
      <VideoPlayer 
        src={mediaUrl}
        thumbnail={thumbnailUrl}
      />
    );
  }

  // Handle images with lightbox
  return (
    <>
      {!isError ? (
        <div className="relative h-[400px] w-full cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setShowLightbox(true)}>
          <Image
            src={mediaUrl}
            alt="Content"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain rounded-lg"
            onError={() => setIsError(true)}
          />
        </div>
      ) : (
        <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center rounded-lg">
          Failed to load image
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && (
        <ImageLightbox
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          imageUrl={mediaUrl}
        />
      )}
    </>
  );
} 