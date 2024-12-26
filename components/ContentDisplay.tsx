import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import VideoPlayer from './VideoPlayer';

interface ContentDisplayProps {
  content: any;
  type: 'instagram' | 'reddit';
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [isError, setIsError] = useState(false);

  const getMediaUrl = () => {
    if (type === 'instagram') {
      // Instagram reels - keep existing logic
      return content['Instagram GDrive']?.replace('/preview', '/view');
    } else {
      // Reddit content
      if (content.Media === 'Gif/Video') {
        // For videos, use the Google Drive URL
        return content['URL Gdrive'];
      } else {
        // For images, use the attachment URL
        return content.Image?.[0]?.url;
      }
    }
  };

  const getThumbnailUrl = () => {
    if (type === 'instagram') {
      return content.Thumbnail?.[0]?.url;
    } else if (type === 'reddit' && content.Media === 'Gif/Video') {
      // Use Image field as thumbnail for Reddit videos
      return content.Image?.[0]?.url;
    }
    return null;
  };

  const isVideo = () => {
    if (type === 'instagram') {
      return true; // Instagram content is always video (reels)
    } else {
      return content.Media === 'Gif/Video';
    }
  };

  const mediaUrl = getMediaUrl();
  const thumbnailUrl = getThumbnailUrl();

  if (!mediaUrl) {
    return <div className="h-48 bg-gray-100 flex items-center justify-center">No media</div>;
  }

  if (isVideo()) {
    return (
      <VideoPlayer 
        src={mediaUrl}
        thumbnail={thumbnailUrl}
      />
    );
  }

  // Handle images
  return (
    <>
      {!isError ? (
        <Image
          src={mediaUrl}
          alt="Content"
          width={300}
          height={192}
          className="w-full h-48 object-cover"
          onError={() => setIsError(true)}
        />
      ) : (
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          Failed to load image
        </div>
      )}
    </>
  );
} 