import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from './ui/dialog';
import { Video, FileVideo, Play } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import { ImageLightbox } from './ImageLightbox';
import { IGPost, RedditPost } from '@/lib/airtable';

interface ContentDisplayProps {
  content: IGPost | RedditPost;
  type: 'instagram' | 'reddit';
}

// Use type guards from airtable.ts or redefine them here
function isRedditPost(content: IGPost | RedditPost): content is RedditPost {
  return 'Media' in content;
}

function isIGPost(content: IGPost | RedditPost): content is IGPost {
  return 'Instagram GDrive' in content;
}

function getGoogleDriveDirectUrl(url: string) {
  const fileId = url.match(/[-\w]{25,}/);
  if (!fileId) return null;
  return `https://drive.google.com/file/d/${fileId[0]}/preview`;
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Handle Reddit content
  if (type === 'reddit' && isRedditPost(content)) {
    // Video/GIF content
    if (content.Media === 'Gif/Video' && content['URL Gdrive']) {
      const videoUrl = getGoogleDriveDirectUrl(content['URL Gdrive']);
      if (!videoUrl) {
        console.error('Invalid Google Drive URL:', content['URL Gdrive']);
        return null;
      }

      return (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            src={videoUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="autoplay"
            allowFullScreen
          />
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
              alt={content.Title || 'Reddit content'}
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
    if (content['Instagram GDrive']) {
      const videoUrl = getGoogleDriveDirectUrl(content['Instagram GDrive']);
      if (!videoUrl) {
        console.error('Invalid Google Drive URL:', content['Instagram GDrive']);
        return null;
      }

      return (
        <div className="relative w-full pt-[100%]">
          <iframe
            src={videoUrl}
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            allow="autoplay"
            allowFullScreen
          />
        </div>
      );
    }

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

  return null;
} 