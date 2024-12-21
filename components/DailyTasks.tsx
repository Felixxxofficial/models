'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
import { Video, FileText, ExternalLink, Upload, ImageIcon, AlertTriangle, FileVideo, Play } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import ReactConfetti from 'react-confetti'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NoteDialog } from './NoteDialog'
import { MotivationalMessage } from './MotivationalMessage'
import { fetchIGPosts, fetchRedditPosts, type IGPost, type RedditPost, updateDoneStatus } from '@/lib/airtable'
import { Instagram } from 'react-content-loader'
import { Video as VideoComponent } from './Video'
import { ErrorBoundary } from './ErrorBoundary'
import { VideoIcon } from './VideoIcon'
import Link from 'next/link'
import ContentDisplay from '@/components/ContentDisplay'
import { ImageLightbox } from './ImageLightbox'

const ITEMS_PER_PAGE = 9; // Changed from 3 to 9

type ContentType = 'all' | 'story' | 'image' | 'video';

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
    "🏄‍♂️ You're wizarding through these tasks!"
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

interface TaskCardProps {
  task: IGPost;
  index?: number;
  onDone: (taskId: string, done: boolean, isInstagram: boolean) => Promise<void>;
  type: 'instagram' | 'reddit';
}

const TaskCard = ({ task, index, onDone, type }: TaskCardProps) => {
  const [isDone, setIsDone] = useState(task['Done Meli'] || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleToggle = async (checked: boolean) => {
    console.log('Toggle task:', { 
      id: task.id, 
      type,
      isInstagram: 'Instagram GDrive' in task,
      checked 
    });

    setIsUpdating(true);
    try {
      const isInstagram = 'Instagram GDrive' in task;
      await onDone(task.id.toString(), checked, isInstagram);
      setIsDone(checked);
    } catch (error) {
      console.error('Error toggling done status:', error);
    }
    setIsUpdating(false);
  };

  const getVideoUrl = (url: string) => {
    if (!url || url === 'No video URL') return null;

    const fileId = url.match(/[-\w]{25,}/);
    return fileId 
      ? `https://drive.google.com/file/d/${fileId[0]}/preview`
      : url;
  };

  const isRedditVideo = type === 'reddit' && (task as RedditPost).Media === 'Gif/Video';
  const imageUrl = type === 'reddit' && !isRedditVideo ? (task as RedditPost).Image?.[0]?.url : null;
  const videoUrl = type === 'instagram' 
    ? task['Instagram GDrive'] 
    : isRedditVideo 
      ? (task as RedditPost)['URL Gdrive']
      : null;
  const uploadUrl = task['Upload Content Meli'];
  const embedUrl = videoUrl ? getVideoUrl(videoUrl) : null;

  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-md overflow-hidden w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index ? index * 0.1 : 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <CardContent className="p-4">
        {type === 'reddit' && !isRedditVideo && imageUrl && (
          <>
            <div 
              className="relative w-full pt-[100%] mb-3 cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={imageUrl}
                alt="Reddit content"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <ImageLightbox
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
              imageUrl={imageUrl}
            />
          </>
        )}
        
        {embedUrl && (
          <div className="relative w-full pt-[177.77%] mb-3">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              allow="autoplay; encrypted-media"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between gap-2 mt-2">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
            asChild
          >
            <a 
              href={task['Upload Content Meli'] || '#'} 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span className="text-sm">Upload</span>
            </a>
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Done</span>
            <Switch
              checked={isDone}
              onCheckedChange={handleToggle}
              disabled={isUpdating}
              className="scale-75"
            />
          </div>
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
  const [igTasks, setIgTasks] = useState<IGPost[]>([]);
  const [redditTasks, setRedditTasks] = useState<RedditPost[]>([]);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'story' | 'image' | 'video'>('all');
  const observerTarget = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({
    all: 0,
    reels: 0,
    images: 0,
    videos: 0
  });

  const fetchData = async () => {
    try {
      const [instagramTasks, redditTasks] = await Promise.all([
        fetchIGPosts(),
        fetchRedditPosts()
      ]);
      
      setIgTasks(instagramTasks);
      setRedditTasks(redditTasks);
      console.log('Instagram Data:', instagramTasks);
      console.log('Reddit Data:', redditTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const totalCount = igTasks.length + redditTasks.length;
    const reelsCount = igTasks.length;
    const imagesCount = redditTasks.filter(t => t.Media === 'Image').length;
    const videosCount = redditTasks.filter(t => t.Media === 'Gif/Video').length;

    setCounts({
      all: totalCount,
      reels: reelsCount,
      images: imagesCount,
      videos: videosCount
    });
  }, [igTasks, redditTasks]);

  // Filter tasks based on content type
  const filteredTasks = useMemo(() => {
    let tasks = [...igTasks, ...redditTasks];
    
    // First filter by done status
    tasks = tasks.filter(task => {
      const isDone = task['Done Meli'] === true;
      return activeTab === 'done' ? isDone : !isDone;
    });

    // Then filter by content type
    if (contentTypeFilter === 'reels') {
      return tasks.filter(task => 'Instagram GDrive' in task);
    } else if (contentTypeFilter === 'image') {
      return tasks.filter(task => 
        'Media' in task && task.Media === 'Image'
      );
    } else if (contentTypeFilter === 'video') {
      return tasks.filter(task => 
        'Media' in task && task.Media === 'Gif/Video'
      );
    }

    return tasks;
  }, [igTasks, redditTasks, contentTypeFilter, activeTab]);

  const todoTasks = useMemo(() => {
    let filtered = [];
    if (contentTypeFilter === 'all') {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === 'reels') {
      filtered = igTasks;
    } else if (contentTypeFilter === 'image') {
      filtered = redditTasks.filter(task => task.Media === 'Image');
    } else if (contentTypeFilter === 'video') {
      filtered = redditTasks.filter(task => task.Media === 'Gif/Video');
    }
    return filtered.filter(task => !task['Done Meli']);
  }, [igTasks, redditTasks, contentTypeFilter]);

  const doneTasks = useMemo(() => {
    let filtered = [];
    if (contentTypeFilter === 'all') {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === 'reels') {
      filtered = igTasks;
    } else if (contentTypeFilter === 'image') {
      filtered = redditTasks.filter(task => task.Media === 'Image');
    } else if (contentTypeFilter === 'video') {
      filtered = redditTasks.filter(task => task.Media === 'Gif/Video');
    }
    return filtered.filter(task => task['Done Meli'] === true);
  }, [igTasks, redditTasks, contentTypeFilter]);

  const currentTasks = activeTab === 'todo' ? todoTasks : doneTasks;
  const visibleTasks = useMemo(() => {
    return filteredTasks.slice(0, displayedItems);
  }, [filteredTasks, displayedItems]);
  const hasMore = visibleTasks.length < filteredTasks.length;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allTasks = await fetchIGPosts();
        console.log('Fetched tasks:', allTasks.length);
        setIgTasks(allTasks);
      } catch (err) {
        console.error('Error in component:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoadingMore && filteredTasks.length > displayedItems) {
          console.log('Loading more items...', displayedItems, filteredTasks.length); // Debug log
          setIsLoadingMore(true);
          setDisplayedItems(prev => {
            const next = prev + ITEMS_PER_PAGE;
            console.log('New displayed items count:', next); // Debug log
            return next;
          });
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isLoadingMore, displayedItems, filteredTasks.length]);

  const handleTaskDone = async (taskId: string, done: boolean, isInstagram: boolean) => {
    try {
      await updateDoneStatus(taskId, done, isInstagram);
      // Refresh data after updating
      await fetchData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Update handleToggle to pass isInstagram
  const handleToggle = async (task: Task) => {
    console.log('Toggle task:', task);
    await handleTaskDone(task.id, !task.checked, task.isInstagram);
  };

  // Calculate progress
  const totalTasks = filteredTasks.length;
  const completedTasks = doneTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Add a log to check filtered tasks
  useEffect(() => {
    console.log('Current Reddit Tasks:', redditTasks);
    console.log('Filtered Reddit Images:', redditTasks.filter(t => t.Media === 'image').length);
    console.log('Filtered Reddit Videos:', redditTasks.filter(t => t.Media === 'video').length);
  }, [redditTasks]);

  // Add this near your other useMemo hooks
  const progressStats = useMemo(() => {
    const allTasks = [...igTasks, ...redditTasks];
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(task => task['Done Meli'] === true).length;
    const remainingTasks = totalTasks - completedTasks;
    const progressPercentage = (completedTasks / totalTasks) * 100;

    return {
      total: totalTasks,
      completed: completedTasks,
      remaining: remainingTasks,
      percentage: progressPercentage
    };
  }, [igTasks, redditTasks]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      {/* Progress Section */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-2">Today's Progress</h1>
        <p className="mb-4">
          {progressStats.remaining} tasks to conquer! Let's get started! 💪
        </p>
        
        {/* Progress bar */}
        <div className="w-full bg-white/30 rounded-full h-4 mb-2">
          <div 
            className="bg-white rounded-full h-4 transition-all duration-500"
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>
        
        <p>
          {progressStats.completed} of {progressStats.total} tasks completed
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6 max-w-[640px] mx-auto">
        <h3 className="text-lg font-semibold mb-2">Filter by Content Type</h3>
        <div className="flex gap-2">
          <Button 
            variant={contentTypeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('all')}
            className={`${contentTypeFilter === 'all' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            All {counts.all}
          </Button>
          <Button 
            variant={contentTypeFilter === 'reels' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('reels')}
            className={`${contentTypeFilter === 'reels' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            Reels {counts.reels}
          </Button>
          <Button 
            variant={contentTypeFilter === 'image' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('image')}
            className={`${contentTypeFilter === 'image' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            Images {counts.images}
          </Button>
          <Button 
            variant={contentTypeFilter === 'video' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('video')}
            className={`${contentTypeFilter === 'video' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            Videos {counts.videos}
          </Button>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mb-6 max-w-[640px] mx-auto">
        <div className="flex gap-2">
          <Button 
            variant={activeTab === 'todo' ? 'default' : 'outline'}
            onClick={() => setActiveTab('todo')}
            className={`${activeTab === 'todo' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            To-Do ({todoTasks.length})
          </Button>
          <Button 
            variant={activeTab === 'done' ? 'default' : 'outline'}
            onClick={() => setActiveTab('done')}
            className={`${activeTab === 'done' ? 'bg-[#0A0D14] text-white hover:bg-[#0A0D14]/90' : ''}`}
          >
            Done ({doneTasks.length})
          </Button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence>
          {visibleTasks.map((task, index) => (
            <div key={task.id} className="w-full max-w-none md:max-w-[315px]">
              <TaskCard 
                task={task} 
                index={index}
                onDone={handleTaskDone}
                type={'Instagram GDrive' in task ? 'instagram' : 'reddit'}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Observer target - show only if there are more items to load */}
      {filteredTasks.length > displayedItems && (
        <div 
          ref={observerTarget}
          className="w-full h-20 flex items-center justify-center mt-4"
        >
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          ) : (
            <div className="text-gray-500">Scroll for more</div>
          )}
        </div>
      )}

      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      {celebrationMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {celebrationMessage}
        </div>
      )}
    </div>
  );
}

