import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from './ui/dialog';
import { Video, FileVideo, Play } from 'lucide-react';
import VideoPlayer from './VideoPlayer';
import type { IGPost, RedditPost } from '../types/airtable';

interface ContentDisplayProps {
  content: IGPost | RedditPost;
  type: 'instagram' | 'reddit';
}

function isRedditPost(content: IGPost | RedditPost): content is RedditPost {
  return 'Media' in content && 'Title' in content;
}

export default function ContentDisplay({ content, type }: ContentDisplayProps) {
  const [showDialog, setShowDialog] = useState(false);

  // Handle Reddit content
  if (type === 'reddit' && isRedditPost(content)) {
    if (content.Media === 'Gif/Video' && content['URL Gdrive']) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content['URL Gdrive']} />
        </div>
      );
    } else if (content.Media === 'Image' && content.Image?.[0]?.url) {
      return (
        <div className="relative aspect-square">
          <Image
            src={content.Image[0].url}
            alt={content.Title || ''}
            fill
            className="object-cover"
          />
        </div>
      );
    }
  }

  // Handle Instagram content
  if (type === 'instagram' && 'Instagram GDrive' in content) {
    return (
      <div className="touch-none" style={{ touchAction: 'none' }}>
        <VideoPlayer src={content['Instagram GDrive']} />
      </div>
    );
  }

  return null;
} 