import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { IGPost, RedditPost } from '@/lib/airtable';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import VideoPlayer from './VideoPlayer';

interface ContentDisplayProps {
  content: any;
  type: 'instagram' | 'reddit';
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  console.log('Content fields available:', Object.keys(content));
  console.log('Full content object:', JSON.stringify(content, null, 2))

  const [isError, setIsError] = useState(false);

  const getMediaUrl = () => {
    console.log('Getting media URL from:', content);
    
    if (type === 'instagram') {
      const instagramUrl = content['Instagram GDrive']?.replace('/preview', '/view')
      console.log('Instagram URL:', instagramUrl);
      return instagramUrl;
    } else {
      const mediaUrl = content['Image']?.[0]?.url || content['URL Gdrive']
      console.log('Reddit URL:', mediaUrl);
      return mediaUrl;
    }
  };

  const getThumbnailUrl = () => {
    return content.Thumbnail?.[0]?.url;
  };

  const isVideo = (url: string | undefined) => {
    if (!url || typeof url !== 'string') return false;
    
    return url.match(/\.(mp4|webm|ogg)$/i) || 
           url.includes('video') ||
           url.includes('drive.google.com') ||
           content.Type === 'Reels' ||
           content.Type === 'video';
  };

  const mediaUrl = getMediaUrl();
  const thumbnailUrl = getThumbnailUrl();
  
  console.log('Content type:', type);
  console.log('Content Type field:', content.Type);
  console.log('Final mediaUrl:', mediaUrl);
  console.log('Final thumbnailUrl:', thumbnailUrl);

  if (!mediaUrl) {
    return <div className="h-48 bg-gray-100 flex items-center justify-center">No media</div>;
  }

  if (isVideo(mediaUrl)) {
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