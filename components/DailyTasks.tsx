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
import { Video, FileText, ExternalLink, Upload, ImageIcon, AlertTriangle, FileVideo, Play } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import ReactConfetti from 'react-confetti'
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { NoteDialog } from './NoteDialog'
import { MotivationalMessage } from './MotivationalMessage'
import { fetchIGPosts, type IGPost, updateDoneStatus } from '@/lib/airtable'
import { Instagram } from 'react-content-loader'
import { Video as VideoComponent } from './Video'
import { ErrorBoundary } from './ErrorBoundary'
import { VideoIcon } from './VideoIcon'
import Link from 'next/link'

const ITEMS_PER_PAGE = 3; // Initial and subsequent load amount

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

interface TaskCardProps {
  task: IGPost;
  index?: number;
  onDone: (taskId: string, done: boolean) => Promise<void>;
}

const TaskCard = ({ task, index, onDone }: TaskCardProps) => {
  const [isDone, setIsDone] = useState(task['Done Meli'] || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onDone(task.id.toString(), checked);
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

  const videoUrl = task['Instagram GDrive'];
  const uploadUrl = task['Upload Content Meli'];
  const embedUrl = videoUrl ? getVideoUrl(videoUrl) : null;

  return (
    <motion.div
      className="relative bg-white rounded-lg shadow-md overflow-hidden w-full max-w-[315px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index ? index * 0.1 : 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <CardContent className="p-3">
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
              href={uploadUrl || '#'} 
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
  const [tasks, setTasks] = useState<IGPost[]>([]);
  const [displayedItems, setDisplayedItems] = useState<number>(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'image' | 'video' | 'story'>('all');
  const observerTarget = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Filter tasks first
  const filteredTasks = tasks
    .filter(task => {
      return task && 
        task['Instagram GDrive'] &&
        (contentTypeFilter === 'all' || task.type === contentTypeFilter);
    })
    .sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));

  const todoTasks = filteredTasks.filter(task => !task['Done Meli']);
  const doneTasks = filteredTasks.filter(task => task['Done Meli']);
  const currentTasks = activeTab === 'todo' ? todoTasks : doneTasks;
  const visibleTasks = currentTasks.slice(0, displayedItems);
  const hasMore = visibleTasks.length < currentTasks.length;

  useEffect(() => {
    const fetchTasks = async () => {
      const allTasks = await fetchIGPosts();
      setTasks(allTasks);
      setIsLoading(false);
    };
    fetchTasks();
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);
          await new Promise(resolve => setTimeout(resolve, 500));
          setDisplayedItems(prev => {
            const nextValue = prev + ITEMS_PER_PAGE;
            return nextValue <= currentTasks.length ? nextValue : prev;
          });
          setIsLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current && hasMore) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, currentTasks.length, isLoadingMore]);

  // Reset displayed items when switching tabs or filters
  useEffect(() => {
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [activeTab, contentTypeFilter]);

  const handleTaskDone = async (taskId: string, done: boolean) => {
    try {
      const success = await updateDoneStatus(taskId, done);
      if (success) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id.toString() === taskId 
              ? { ...task, 'Done Meli': done, uploaded: done } 
              : task
          )
        );

        if (done) {
          setShowConfetti(true);
          setCelebrationMessage('Task completed! 🎉');
          setTimeout(() => {
            setShowConfetti(false);
            setCelebrationMessage('');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Calculate progress
  const totalTasks = filteredTasks.length;
  const completedTasks = doneTasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      {/* Progress Section */}
      <div className="mb-8 max-w-[640px] mx-auto">
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Today's Progress</h2>
          <p className="mb-4">{totalTasks} tasks to conquer! Let's get started! 💪</p>
          <div className="w-full bg-white/30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-white/90">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mb-6 max-w-[640px] mx-auto">
        <h3 className="text-lg font-semibold mb-2">Filter by Content Type</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={contentTypeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('all')}
          >
            All {totalTasks}
          </Button>
          <Button 
            variant={contentTypeFilter === 'image' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('image')}
          >
            Images {tasks.filter(t => t.type === 'image').length}
          </Button>
          <Button 
            variant={contentTypeFilter === 'video' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('video')}
          >
            Videos {tasks.filter(t => t.type === 'video').length}
          </Button>
          <Button 
            variant={contentTypeFilter === 'story' ? 'default' : 'outline'}
            onClick={() => setContentTypeFilter('story')}
          >
            Reels {tasks.filter(t => t.type === 'story').length}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        <AnimatePresence>
          {visibleTasks.map((task, index) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              index={index}
              onDone={handleTaskDone}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Observer target - always present but only shows loading indicator when needed */}
      <div ref={observerTarget} className="w-full py-8 flex justify-center">
        {hasMore && isLoadingMore && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        )}
      </div>

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

