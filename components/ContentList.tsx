import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Camera, Video, FileText, AlertTriangle, ExternalLink } from 'lucide-react'
import Image from 'next/image'

const contentItems = [
  { 
    id: 1, 
    type: 'image', 
    title: 'Beach Photoshoot', 
    caption: 'Summer vibes at the beach #SummerFun #BeachDay', 
    deadline: 'Tomorrow, 2pm',
    urgent: true,
    preview: '/placeholder.svg?height=300&width=300'
  },
  { 
    id: 2, 
    type: 'video', 
    title: 'Workout Routine', 
    caption: 'My daily workout routine for staying fit #FitnessMotivation', 
    deadline: 'Friday, 10am',
    urgent: false,
    preview: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  { 
    id: 3, 
    type: 'story', 
    title: 'Fashion Week BTS', 
    caption: 'Behind the scenes at Fashion Week #FashionWeek #BTS', 
    deadline: 'Saturday, 6pm',
    urgent: false,
    preview: 'https://www.instagram.com/reel/ABC123/'
  },
]

export default function ContentList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Upcoming Content</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contentItems.map((item) => (
            <Card key={item.id} className={`bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 ${item.urgent ? 'border-red-500 dark:border-red-700 border-2' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {item.type === 'image' && <Camera className="text-blue-500 mr-2" />}
                    {item.type === 'video' && <Video className="text-green-500 mr-2" />}
                    {item.type === 'story' && <FileText className="text-purple-500 mr-2" />}
                    <h3 className="font-medium text-gray-800 dark:text-white">{item.title}</h3>
                  </div>
                  {item.urgent && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.caption}</p>
                <div className="mb-2 aspect-video relative overflow-hidden rounded-md">
                  {item.type === 'image' && (
                    <Image 
                      src={item.preview} 
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  )}
                  {item.type === 'video' && (
                    <iframe
                      src={item.preview}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  )}
                  {item.type === 'story' && (
                    <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                      <a 
                        href={item.preview} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        <ExternalLink className="w-6 h-6 mr-2" />
                        View Instagram Reel
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.deadline}</span>
                  <Button>Upload</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

