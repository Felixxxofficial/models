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
import confetti from 'canvas-confetti';

const ITEMS_PER_PAGE = 9; // Changed from 3 to 9

type ContentType = 'all' | 'story' | 'image' | 'video' | 'reels';

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

function isRedditPost(task: IGPost | RedditPost): task is RedditPost {
  if (!isRedditPost.logged) {
    console.log('Sample task fields:', Object.keys(task));
    isRedditPost.logged = true;
  }
  return 'Media' in task;
}

isRedditPost.logged = false;

function isIGPost(task: IGPost | RedditPost): task is IGPost {
  return 'Instagram GDrive' in task;
}

interface TaskCardProps {
  task: IGPost | RedditPost;
  index?: number;
  onDone: (taskId: string, done: boolean, isInstagram: boolean) => Promise<void>;
  type: 'instagram' | 'reddit';
}

const getVideoUrl = (url: string) => {
  // Extract file ID from Google Drive URL
  const match = url.match(/\/d\/([^/]+)/);
  if (!match) return url;
  
  const fileId = match[1];
  // Convert to preview URL format
  return `https://drive.google.com/file/d/${fileId}/preview`;
};

const TaskCard = ({ task, index, onDone, type }: TaskCardProps) => {
  const [isDone, setIsDone] = useState(task['Done Meli'] || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  interface MediaContent {
    isVideo: boolean;
    url?: string;
    imageUrl?: string;
  }

  const getMediaContent = (): MediaContent | null => {
    if (isRedditPost(task)) {
      if (task.Media === 'Gif/Video') {
        return {
          isVideo: true,
          url: task['URL Gdrive']
        };
      } else if (task.Media === 'Image' && task.Image?.[0]?.url) {
        return {
          isVideo: false,
          imageUrl: task.Image[0].url,
          url: task.Image[0].url
        };
      }
    } else if (isIGPost(task)) {
      return {
        isVideo: true,
        url: task['Instagram GDrive']
      };
    }
    return null;
  };

  const getUploadUrl = (task: IGPost | RedditPost) => {
    if ('Upload Content Meli' in task) {
      return task['Upload Content Meli'];
    }
    return null;
  };

  const mediaContent = getMediaContent();
  const uploadUrl = getUploadUrl(task);
  const embedUrl = mediaContent?.url ? getVideoUrl(mediaContent.url) : null;

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      const isInstagram = isIGPost(task);
      await onDone(task.id.toString(), checked, isInstagram);
      setIsDone(checked);
    } catch (error) {
      console.error('Error toggling done status:', error);
    }
    setIsUpdating(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {type === 'reddit' && !mediaContent?.isVideo && mediaContent?.imageUrl && (
          <>
            <div 
              className="relative w-full pt-[100%] mb-3 cursor-pointer"
              onClick={() => setIsLightboxOpen(true)}
            >
              <img
                src={mediaContent.imageUrl}
                alt="Reddit content"
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              />
            </div>
            
            <ImageLightbox
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
              imageUrl={mediaContent.imageUrl}
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
        
        <div className="flex justify-between items-center mb-2">
          <Badge variant="outline">{type}</Badge>
          <Switch 
            checked={isDone}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="scale-75"
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface Task {
  id: string;
  'Done Meli': boolean;
  isInstagram: boolean;
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState<(IGPost | RedditPost)[]>([]);
  const [igTasks, setIgTasks] = useState<IGPost[]>([]);
  const [redditTasks, setRedditTasks] = useState<RedditPost[]>([]);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>('all');
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
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [instagramTasks, redditTasks] = await Promise.all([
        fetchIGPosts(),
        fetchRedditPosts()
      ]);
      
      // Debug logs
      console.log('Reddit Data Details:', {
        total: redditTasks.length,
        images: redditTasks.filter(t => t.Media === 'Image').length,
        sampleTask: redditTasks[0],
        mediaTypes: [...new Set(redditTasks.map(t => t.Media))]
      });
      
      setIgTasks(instagramTasks);
      setRedditTasks(redditTasks);
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

  const getFilteredTasks = (tasks: (IGPost | RedditPost)[]) => {
    console.log('Tasks to filter:', {
      total: tasks.length,
      sample: tasks[0],
      contentTypeFilter
    });

    const statusFilteredTasks = tasks.filter(task => 
      activeTab === 'done' ? task['Done Meli'] : !task['Done Meli']
    );

    let filtered: (IGPost | RedditPost)[] = [];
    
    switch (contentTypeFilter) {
      case 'reels':
        filtered = statusFilteredTasks.filter(task => !isRedditPost(task));
        break;
      case 'image':
        filtered = statusFilteredTasks.filter(task => 
          isRedditPost(task) && task.Media === 'Image'
        );
        break;
      case 'video':
        filtered = statusFilteredTasks.filter(task => 
          (isRedditPost(task) && task.Media === 'Gif/Video') ||
          !isRedditPost(task)
        );
        break;
      default: // 'all'
        filtered = statusFilteredTasks;
    }

    console.log('Filtered results:', {
      before: statusFilteredTasks.length,
      after: filtered.length,
      filterType: contentTypeFilter
    });

    return filtered;
  };

  const todoTasks = useMemo(() => {
    console.log('Creating todoTasks with:', {
      igTasks: igTasks.length,
      redditTasks: redditTasks.length,
      sample: redditTasks[0]
    });

    let filtered: (IGPost | RedditPost)[] = [];
    
    if (contentTypeFilter === 'all') {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === 'reels') {
      filtered = igTasks;
    } else if (contentTypeFilter === 'image') {
      console.log('Filtering Reddit images:', {
        before: redditTasks.length,
        mediaTypes: redditTasks.map(t => t.Media)
      });
      filtered = redditTasks.filter(task => task.Media === 'Image');
    } else if (contentTypeFilter === 'video') {
      filtered = [
        ...redditTasks.filter(task => task.Media === 'Gif/Video'),
        ...igTasks
      ];
    }

    console.log('Filtered results:', {
      total: filtered.length,
      filter: contentTypeFilter
    });

    return filtered.filter(task => !task['Done Meli']);
  }, [igTasks, redditTasks, contentTypeFilter]);

  const doneTasks = useMemo(() => {
    let filtered: (IGPost | RedditPost)[] = [];
    
    if (contentTypeFilter === 'all') {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === 'reels') {
      filtered = igTasks;
    } else if (contentTypeFilter === 'image') {
      filtered = redditTasks.filter(task => task.Media === 'Image');
    } else if (contentTypeFilter === 'video') {
      filtered = [
        ...redditTasks.filter(task => task.Media === 'Gif/Video'),
        ...igTasks
      ];
    }

    return filtered.filter(task => task['Done Meli']);
  }, [igTasks, redditTasks, contentTypeFilter]);

  const currentTasks = activeTab === 'todo' ? todoTasks : doneTasks;
  const visibleTasks = useMemo(() => {
    return getFilteredTasks(currentTasks).slice(0, displayedItems);
  }, [currentTasks, contentTypeFilter, displayedItems]);
  const hasMore = visibleTasks.length < getFilteredTasks(currentTasks).length;

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
        if (entries[0].isIntersecting && !isLoadingMore && getFilteredTasks(currentTasks).length > displayedItems) {
          console.log('Loading more items...', displayedItems, getFilteredTasks(currentTasks).length); // Debug log
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
  }, [isLoadingMore, displayedItems, getFilteredTasks(currentTasks).length]);

  const handleTaskDone = async (taskId: string, done: boolean, isInstagram: boolean) => {
    try {
      const response = await fetch('/api/updateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, done, isInstagram }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Update local state
      if (isInstagram) {
        setIgTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, 'Done Meli': done } : task
          )
        );
      } else {
        setRedditTasks(prev => 
          prev.map(task => 
            task.id === taskId ? { ...task, 'Done Meli': done } : task
          )
        );
      }

      // Show success message
      setMessage('Task updated successfully!');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);

    } catch (error) {
      console.error('Error updating task:', error);
      // Show error message to user
    }
  };

  const handleToggle = async (task: IGPost | RedditPost) => {
    console.log('Toggle task:', task);
    const isInstagram = isIGPost(task);
    await handleTaskDone(task.id, !task['Done Meli'], isInstagram);
  };

  // Calculate progress
  const totalTasks = getFilteredTasks(currentTasks).length;
  const completedTasks = doneTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Add a log to check filtered tasks
  useEffect(() => {
    console.log('Current Reddit Tasks:', redditTasks);
    console.log('Filtered Reddit Images:', redditTasks.filter(t => t.Media === 'Image').length);
    console.log('Filtered Reddit Videos:', redditTasks.filter(t => t.Media === 'Gif/Video').length);
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

  // Update the type checking logic
  const getTaskDetails = (task: IGPost | RedditPost, type: 'instagram' | 'reddit') => {
    if (isRedditPost(task)) {
      const isRedditVideo = task.Media === 'Gif/Video';
      return {
        isRedditVideo,
        imageUrl: !isRedditVideo ? task.Image?.[0]?.url : null,
        videoUrl: isRedditVideo ? task['URL Gdrive'] : null
      };
    } else if (isIGPost(task)) {
      return {
        isRedditVideo: false,
        imageUrl: null,
        videoUrl: task['Instagram GDrive']
      };
    }
    return {
      isRedditVideo: false,
      imageUrl: null,
      videoUrl: null
    };
  };

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
          {visibleTasks.map((task, index) => {
            const type = isIGPost(task) ? 'instagram' : 'reddit';
            const { isRedditVideo, imageUrl, videoUrl } = getTaskDetails(task, type);

            return (
              <div key={task.id} className="w-full max-w-none md:max-w-[315px]">
                <TaskCard 
                  task={task} 
                  index={index}
                  onDone={handleTaskDone}
                  type={type}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Observer target - show only if there are more items to load */}
      {getFilteredTasks(currentTasks).length > displayedItems && (
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

      {showMessage && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
          {message}
        </div>
      )}
    </div>
  );
}

