import VideoPlayer from '@/components/VideoPlayer'
import Image from 'next/image'
import { Instagram, Play } from 'lucide-react'
import type { IGPost } from '@/lib/airtable'
import type { RedditPost } from '@/lib/airtable'

type ContentProps = {
  content: IGPost | RedditPost;
  type: 'instagram' | 'reddit';
}

export default function ContentDisplay({ content, type }: ContentProps) {
  const [showDialog, setShowDialog] = React.useState(false);

  // Handle Instagram content
  if (type === 'instagram' && 'Instagram GDrive' in content) {
    if (content['Instagram GDrive']) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content['Instagram GDrive']} />
        </div>
      )
    }
    return null;
  }

  // Handle Reddit content
  if (type === 'reddit' && isRedditPost(content)) {
    if (content.Media === 'Gif/Video' && content['URL Gdrive']) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content['URL Gdrive']} />
        </div>
      )
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
      )
    }
  }

  return null;
} 