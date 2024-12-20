'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Video, FileText, ExternalLink, Upload, ImageIcon, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import ReactConfetti from 'react-confetti'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NoteDialog } from './NoteDialog'
import { MotivationalMessage } from './MotivationalMessage'


// Simulating a larger dataset
const generateTasks = (count: number, startId: number) => Array.from({ length: count }, (_, i) => ({
  id: startId + i,
  type: ['image', 'video', 'story'][i % 3],
  title: `Content ${startId + i}`,
  preview: i % 3 === 0 ? '/placeholder.svg?height=300&width=300' :
           i % 3 === 1 ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' :
           'https://www.instagram.com/reel/ABC123/',
  uploaded: false,
  note: i % 7 === 0 ? 'Focus on the face expression' : '',
  isUrgent: i % 5 === 0
}))

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

export default function DailyTasks() {
  const [tasks, setTasks] = useState(() => generateTasks(ITEMS_PER_LOAD, 1))
  const [loading, setLoading] = useState(false)
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>('all')
  const [showConfetti, setShowConfetti] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState('')
  const [confettiColors, setConfettiColors] = useState<string[]>([])
  const loader = useRef(null)
  const nextIdRef = useRef(ITEMS_PER_LOAD + 1)

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

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: task.uploaded ? 0.98 : 1,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      }}
      exit={{ 
        opacity: 0,
        x: task.uploaded ? 300 : -300,
        transition: { duration: 0.5 }
      }}
      whileHover={{ scale: 1.02 }}
      className={`
        bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 
        ${task.uploaded ? 'border-green-500' : ''}
        ${task.transitioning ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {task.type === 'image' && <ImageIcon className="text-blue-500 mr-2" />}
            {task.type === 'video' && <Video className="text-green-500 mr-2" />}
            {task.type === 'story' && <FileText className="text-purple-500 mr-2" />}
            <h3 className="font-medium text-gray-800 dark:text-white">{task.title}</h3>
          </div>
          <Badge variant={task.isUrgent ? "destructive" : "secondary"} className="flex items-center">
            {task.isUrgent ? (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgent
              </>
            ) : (
              'Regular'
            )}
          </Badge>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <div className="mb-2 aspect-square relative overflow-hidden rounded-md cursor-pointer">
              {task.type === 'image' && (
                <Image 
                  src={task.preview} 
                  alt={task.title} 
                  layout="fill" 
                  objectFit="cover"
                />
              )}
              {task.type === 'video' && (
                <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {task.type === 'story' && (
                <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            {task.type === 'image' && (
              <Image 
                src={task.preview} 
                alt={task.title} 
                width={400}
                height={400}
                layout="responsive"
              />
            )}
            {task.type === 'video' && (
              <iframe
                src={task.preview}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              ></iframe>
            )}
            {task.type === 'story' && (
              <div className="flex items-center justify-center h-64 bg-gray-200 dark:bg-gray-700">
                <a 
                  href={task.preview} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  <ExternalLink className="w-6 h-6 mr-2" />
                  View Instagram Reel
                </a>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <div className="flex items-center justify-between mt-2">
          <a
            href="https://drive.google.com/drive/my-drive"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Upload className="w-4 h-4 mr-1" />
            Upload to Drive
          </a>
          <div className="flex items-center">
            <span className="mr-2 text-sm">Done</span>
            <Switch
              checked={task.uploaded}
              onCheckedChange={() => handleUploadToggle(task.id)}
              aria-label="Toggle upload status"
            />
          </div>
        </div>
        {task.note && (
          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded-md text-sm">
            <p className="text-gray-800 dark:text-gray-200">{task.note}</p>
          </div>
        )}
      </CardContent>
    </motion.div>
  )

  const getRandomColors = () => {
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff99c8', '#fcf6bd', '#d0f4de', '#a9def9', '#e4c1f9']
    return colors.sort(() => 0.5 - Math.random()).slice(0, 5)
  }

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
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
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

