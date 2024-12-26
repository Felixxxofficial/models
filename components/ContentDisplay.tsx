import React, { useState } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import VideoPlayer from './VideoPlayer';
import { ImageLightbox } from '@/components/ImageLightbox';

interface ContentDisplayProps {
  content: any;
  type: 'instagram' | 'reddit';
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [isError, setIsError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const getMediaUrl = () => {
    if (type === 'instagram') {
      return content['Instagram GDrive']?.replace('/preview', '/view');
    } else {
      if (content.Media === 'Gif/Video') {
        return content['URL Gdrive'];
      } else {
        return content.Image?.[0]?.url;
      }
    }
  };

  const getThumbnailUrl = () => {
    if (type === 'instagram') {
      return content.Thumbnail?.[0]?.url;
    } else if (type === 'reddit' && content.Media === 'Gif/Video') {
      return content.Image?.[0]?.url;
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