'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Video, FileText, ExternalLink, Upload, ImageIcon, AlertTriangle, FileVideo } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import ReactConfetti from 'react-confetti'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NoteDialog } from './NoteDialog'
import { MotivationalMessage } from './MotivationalMessage'
import { fetchIGPosts, type IGPost } from '@/lib/airtable'
import { Instagram } from 'react-content-loader'
import { Video as VideoComponent } from './Video'
import { ErrorBoundary } from './ErrorBoundary'
import { VideoIcon } from './VideoIcon'
import Link from 'next/link'

const ITEMS_PER_LOAD = 9

type ContentType = 'all' | 'image' | 'video' | 'story'

const celebrationMessages = [
  "Amazing job! 🎉",
  "You're on fire! 🔥",
  "Keep crushing it! 💪",
  "Fantastic work! 🌟",
  "You're a superstar! ⭐",
  "Incredible progress! 🚀",
  "You're unstoppable! 🏆",
  "Brilliant effort! 👏",
  "You're nailing it! 🎯",
  "Outstanding work! 🌈"
]

const getCelebrationMessage = () => {
  const messages = [
    "🎉 Awesome job! You're crushing it!",
    "🚀 Another one bites the dust! Keep soaring!",
    "💪 You're on fire! Nothing can stop you now!",
    "🌟 Stellar work! You're a content superstar!",
    "🏆 Champion move! You're dominating this!",
    "🎯 Bullseye! Your precision is unmatched!",
    "🌈 Magical! You're turning tasks into gold!",
    "🦸‍♀️ Superhero status achieved! What's next?",
    "🏄‍♂️ Riding the wave of productivity! Cowabunga!",
    "🧙‍♂️ You're wizarding through these tasks!"
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}

const getEmbedUrl = (url: string | null) => {
  if (!url) return null;
  
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return null;
  
  const fileId = match[1];
  // Convert to preview URL format
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const TaskCard = ({ task, index }: { task: IGPost; index?: number }) => {
  const getVideoUrl = (url: string) => {
    if (!url || url === 'No video URL') return null;

    // Extract file ID from Google Drive URL
    const fileId = url.match(/[-\w]{25,}/);
    return fileId 
      ? `https://drive.google.com/file/d/${fileId[0]}/preview`
      : url;
  };

  const videoUrl = task['Instagram GDrive'];
  const embedUrl = videoUrl ? getVideoUrl(videoUrl) : null;

  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index ? index * 0.1 : 0 }}
    >
      <CardContent>
        {embedUrl && (
          <div className="relative w-[315px] mx-auto pt-[177.77%] mb-4">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="autoplay"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}
        
        <div className="flex justify-between mt-4">
          <Button variant="outline">
            <a 
              href={videoUrl || '#'} 
              target="_blank"
              rel="noopener noreferrer"
            >
              Upload to Google Drive
            </a>
          </Button>
          <Button>Done</Button>
        </div>
      </CardContent>
    </motion.div>
  );
};

interface Task {
  id: string;
  title: string;
  caption?: string;
  deadline?: string;
  "Instagram GDrive"?: string;
  isUrgent?: boolean;
  notes?: string;
  status?: string;
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<IGPost[]>([])
  const [loading, setLoading] = useState(true)
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [confettiColors, setConfettiColors] = useState<string[]>([])
  const loader = useRef(null)
  const nextIdRef = useRef(ITEMS_PER_LOAD + 1)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true)
      try {
        const igPosts = await fetchIGPosts()
        setTasks(igPosts)
      } catch (error) {
        console.error('Error loading tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const handleObserver = (entities: IntersectionObserverEntry[]) => {
    const target = entities[0]
    if (target.isIntersecting && !loading) {
      loadMoreTasks()
    }
  }

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: "20px",
      threshold: 0
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loader.current) observer.observe(loader.current)
    return () => observer.disconnect()
  }, [])

  const loadMoreTasks = () => {
    setLoading(true)
    setTimeout(() => {
      setTasks(prevTasks => [...prevTasks, ...generateTasks(ITEMS_PER_LOAD, nextIdRef.current)])
      nextIdRef.current += ITEMS_PER_LOAD
      setLoading(false)
    }, 500) // Simulating API delay
  }

  const handleUploadToggle = (id: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, uploaded: !task.uploaded, transitioning: true } : task
      )
    )
    
    setTimeout(() => {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, transitioning: false } : task
        )
      )
    }, 300)

    if (!tasks.find(task => task.id === id)?.uploaded) {
      setShowConfetti(true)
      setCelebrationMessage(getCelebrationMessage())
      setTimeout(() => {
        setShowConfetti(false)
        setCelebrationMessage('')
      }, 3000)
    }
  }

  // Remove this function
  // const handleNoteUpdate = (id: number, note: string) => {
  //   setTasks(prevTasks =>
  //     prevTasks.map(task =>
  //       task.id === id ? { ...task, note } : task
  //     )
  //   )
  // }

  const filteredTasks = tasks
  .filter(task => contentTypeFilter === 'all' || task.type === contentTypeFilter)
  .sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0))

  const todoTasks = filteredTasks.filter(task => !task.uploaded)
  const doneTasks = filteredTasks.filter(task => task.uploaded)

  const getRandomColors = () => {
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9', '#e4c1f9']
    return colors.sort(() => 0.5 - Math.random()).slice(0, 5)
  }

  useEffect(() => {
    console.log('All tasks:', tasks);
    tasks.forEach((task, index) => {
      console.log(`Task ${index} gdrive URL:`, task.gdrive);
    });
  }, [tasks]);

  useEffect(() => {
    // Log the first task with all its fields
    console.log('First task with all fields:', tasks[0]);
    // Log all available field names
    if (tasks[0]) {
      console.log('Available fields:', Object.keys(tasks[0]));
    }
  }, [tasks]);

  useEffect(() => {
    // Debug log to see which tasks have videos
    tasks.forEach((task, index) => {
      console.log(`Task ${index} - ${task.title}:`, {
        hasVideo: !!task.gdrive,
        url: task.gdrive || 'No video URL'
      });
    });
  }, [tasks]);

  useEffect(() => {
    // Debug log to see what URLs we're getting
    tasks.forEach((task, index) => {
      console.log(`Task ${index} video URL:`, {
        raw: task["Instagram GDrive"],
        converted: task["Instagram GDrive"]?.replace('/view', '/preview')
      });
    });
  }, [tasks]);

  useEffect(() => {
    // Debug log to see the URLs we're generating
    tasks.forEach((task, index) => {
      const originalUrl = task["Instagram GDrive"];
      const embedUrl = getEmbedUrl(originalUrl);
      console.log(`Task ${index}:`, {
        title: task.title,
        original: originalUrl,
        embed: embedUrl
      });
    });
  }, [tasks]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Today's Content</CardTitle>
      </CardHeader>
      <CardContent>
        <MotivationalMessage todoCount={todoTasks.length} doneCount={doneTasks.length} />
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Filter by Content Type</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Button
              variant={contentTypeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('all')}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <span className="mr-2">All</span>
              <Badge>{filteredTasks.length}</Badge>
            </Button>
            <Button
              variant={contentTypeFilter === 'image' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('image')}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <ImageIcon className="mr-2 h-4 w-4" />
              <span className="mr-2">Images</span>
              <Badge>{tasks.filter(t => t.type === 'image').length}</Badge>
            </Button>
            <Button
              variant={contentTypeFilter === 'video' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('video')}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <Video className="mr-2 h-4 w-4" />
              <span className="mr-2">Videos</span>
              <Badge>{tasks.filter(t => t.type === 'video').length}</Badge>
            </Button>
            <Button
              variant={contentTypeFilter === 'story' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setContentTypeFilter('story')}
              className="flex items-center justify-center w-full sm:w-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="mr-2">Reels</span>
              <Badge>{tasks.filter(t => t.type === 'story').length}</Badge>
            </Button>
          </div>
        </div>
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="todo">To-Do ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="done">Done ({doneTasks.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="todo">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {todoTasks.map((task, index) => {
                  console.log(`Task ${index}:`, task);
                  
                  const videoUrl = task["Instagram GDrive"];
                  
                  console.log(`Task ${index} raw URL:`, videoUrl);
                  
                  return (
                    <TaskCard key={task.id} task={task} index={index} />
                  );
                })}
              </div>
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="done">
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doneTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
        <div ref={loader} className="h-10 flex items-center justify-center">
          {loading && <p>Loading more...</p>}
        </div>
      </CardContent>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      {celebrationMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-green-500 animate-bounce">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{celebrationMessage}</p>
        </div>
      )}
    </Card>
  )
}

