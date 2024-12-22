import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from './ui/dialog';
import { Video, FileVideo, Play } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { ImageLightbox } from './ImageLightbox';

// Define types inline
interface IGPost {
  id: string;
  caption?: string;
  'Instagram GDrive'?: string;
  'Done Meli': boolean;
}

interface RedditPost {
  id: string;
  Title: string;
  Link: string;
  Media: 'Image' | 'Gif/Video';
  Image?: Array<{ url: string }>;
  'URL Gdrive'?: string;
  'Done Meli': boolean;
}

interface ContentDisplayProps {
  content: IGPost | RedditPost;
  type: 'instagram' | 'reddit';
}

// Type guards need to be fixed
function isRedditPost(content: any): content is RedditPost {
  return (
    content &&
    typeof content === 'object' &&
    (
      // For video content
      (content.Media === 'Gif/Video' && 'URL Gdrive' in content) ||
      // For image content
      (content.Media === 'Image' && Array.isArray(content.Image) && content.Image.length > 0)
    )
  );
}

function isIGPost(content: any): content is IGPost {
  return (
    content &&
    typeof content === 'object' &&
    Array.isArray(content.Thumbnail) &&
    content.Thumbnail.length > 0
  );
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Handle Reddit content
  if (type === 'reddit' && isRedditPost(content)) {
    // Video/GIF content
    if (content.Media === 'Gif/Video' && content['URL Gdrive']) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content['URL Gdrive']} />
        </div>
      );
    }
    
    // Image content
    if (content.Media === 'Image' && content.Image?.[0]) {
      return (
        <>
          <div 
            className="relative w-full pt-[100%] mb-3 cursor-pointer overflow-hidden"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={content.Image[0].url}
              alt={content.Caption || 'Reddit content'}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <ImageLightbox
            isOpen={isLightboxOpen}
            onClose={() => setIsLightboxOpen(false)}
            imageUrl={content.Image[0].url}
          />
        </>
      );
    }
  }

  // Handle Instagram content
  if (type === 'instagram' && isIGPost(content)) {
    if (content.Instagram_GDrive) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content.Instagram_GDrive} />
        </div>
      );
    }

    // Show thumbnail image if available
    if (content.Thumbnail?.[0]) {
      return (
        <>
          <div 
            className="relative w-full pt-[100%] mb-3 cursor-pointer overflow-hidden"
            onClick={() => setIsLightboxOpen(true)}
          >
            <img
              src={content.Thumbnail[0].url}
              alt={content.caption || 'Instagram content'}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
            />
          </div>
          
          <ImageLightbox
            isOpen={isLightboxOpen}
            onClose={() => setIsLightboxOpen(false)}
            imageUrl={content.Thumbnail[0].url}
          />
        </>
      );
    }
  }

  // Log why nothing was rendered
  console.log('No content rendered because:', {
    contentType: type,
    hasRedditImage: isRedditPost(content) && content.Media === 'Image' && content.Image?.[0]?.url,
    hasRedditVideo: isRedditPost(content) && content.Media === 'Gif/Video' && content['URL Gdrive'],
    hasIGVideo: isIGPost(content) && content.Instagram_GDrive,
    hasIGImage: isIGPost(content) && content.Thumbnail?.[0]?.url,
    content: JSON.stringify(content, null, 2)
  });

  return null;
} 