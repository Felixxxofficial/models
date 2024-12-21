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
  if (type === 'reddit' && 'Media' in content) {
    if (content.Media === 'video' && content['URL Gdrive']) {
      return (
        <div className="touch-none" style={{ touchAction: 'none' }}>
          <VideoPlayer src={content['URL Gdrive']} />
        </div>
      )
    }

    if (content.Media === 'image' && content.Image?.[0]?.url) {
      return (
        <div className="relative w-full pt-[100%] bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={content.Image[0].url}
            alt="Reddit image"
            fill
            className="object-cover"
          />
        </div>
      )
    }
  }

  return null;
} 