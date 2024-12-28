"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ReactConfetti from "react-confetti";
import confetti from "canvas-confetti";

import ContentDisplay from "@/components/ContentDisplay";
import { ImageLightbox } from "@/components/ImageLightbox";

// Import your data fetchers from Airtable
import {
  fetchIGPosts,
  fetchRedditPosts,
  type IGPost,
  type RedditPost,
  updateDoneStatus,
} from "@/lib/airtable";

import { useSession } from "next-auth/react";
import { userConfigs } from "@/lib/user-config";
import { MotivationalMessage } from "./MotivationalMessage";

const ITEMS_PER_PAGE = 9;

// Helpers to distinguish Reddit vs Instagram
function isRedditPost(task: IGPost | RedditPost): task is RedditPost {
  return task['Cloudinary URL']?.toLowerCase().includes('reddit');
}

function isIGPost(task: IGPost | RedditPost): task is IGPost {
  return task['Cloudinary URL']?.toLowerCase().includes('reel');
}

type ContentType = "all" | "reels" | "image" | "video";
type TabType = "todo" | "done";

// ─────────────────────────────────────────────────────────────
// TaskCard: Renders one card (image or video) + Done switch
// ─────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: IGPost | RedditPost;
  index?: number;
  onDone: (taskId: string, done: boolean, isInstagram: boolean, doneField: string) => Promise<void>;
  type: "instagram" | "reddit";
}
function TaskCard({ task, index, onDone, type }: TaskCardProps) {
  const { data: session } = useSession();
  const userConfig = session?.user?.email ? userConfigs[session.user.email] : null;
  
  // Identify based on Cloudinary URL
  const isInstagramPost = task['Cloudinary URL']?.toLowerCase().includes('reel');
  const isRedditPost = task['Cloudinary URL']?.toLowerCase().includes('reddit');
  
  // Use the correct done field based on the content type
  const doneField = isInstagramPost ? userConfig?.doneFieldIG : userConfig?.doneFieldReddit;
  const [isDone, setIsDone] = useState(task[doneField || ''] || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  console.log('TaskCard Debug:', {
    taskId: task.id,
    type,
    isInstagramPost,
    isRedditPost,
    doneField,
    currentDoneValue: task[doneField || '']
  });

  const handleToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      await onDone(
        task.id, 
        checked, 
        isInstagramPost,
        doneField || ''
      );
      setIsDone(checked);
    } catch (error) {
      console.error('Error toggling task:', error);
      setIsDone(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpload = () => {
    const uploadUrl = task[`Upload Content ${userConfig?.name}`];
    
    if (uploadUrl) {
      window.open(uploadUrl, '_blank');
    } else {
      console.error('No upload URL available for this content');
      // Optionally show an error message to the user
    }
  };

  const getIGLink = () => {
    if (isIGPost(task)) {
      return task.URL || null; // Assuming 'URL' is the field name in your Airtable
    }
    return null;
  };

  const getNotes = () => {
    if (task.Notes && task.Notes.trim() !== '') {
      return task.Notes;
    }
    return null;
  };

  // Determine if it's a reel
  const isReel = task['Cloudinary URL']?.toLowerCase().includes('reel');

  // Set platform type - if it's a reel, it should be instagram
  const platformType = isReel ? "instagram" : type;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-2">
          <ContentDisplay content={task} platform={platformType} />

          <div className="mt-2 space-y-2">
            {/* Upload and Toggle row */}
            <div className="flex justify-between items-center gap-2">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md flex-1"
                onClick={handleUpload}
                disabled={isUploading || isDone}
              >
                {isUploading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Upload Content
                  </span>
                )}
              </Button>
              
              <Switch
                checked={isDone}
                onCheckedChange={handleToggle}
                disabled={isUpdating}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-400 data-[state=checked]:to-emerald-500 
                         data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-purple-400 data-[state=unchecked]:to-pink-500
                         h-6 w-11 
                         transition-all duration-200
                         shadow-sm hover:shadow-md"
              />
            </div>
            
            {/* Badge row with IG Link and Notes */}
            <div className="flex items-center gap-2 flex-wrap">
              {type === "instagram" && getIGLink() && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-pink-500 text-pink-500 hover:bg-pink-50 h-6 px-2 text-xs"
                  onClick={() => window.open(getIGLink(), '_blank')}
                >
                  <span className="flex items-center gap-1">
                    <svg 
                      className="w-3 h-3" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    IG Link
                  </span>
                </Button>
              )}

              {/* Notes - Only shows if there are notes */}
              {getNotes() && (
                <div className="flex items-center gap-1 bg-blue-50 rounded-md px-2 py-1 text-xs text-gray-700">
                  <svg 
                    className="w-3 h-3 text-blue-500" 
                    fill="none"
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  {getNotes()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Add these motivational messages
const motivationalMessages = [
  "Great job! 🌟",
  "You're crushing it! 💪",
  "Keep up the amazing work! 🚀",
  "Awesome progress! ⭐",
  "You're on fire! 🔥",
  "Way to go! 🎯",
  "Fantastic work! 🌟",
  "You're unstoppable! 💫",
];

// ───────────────��─────────────────────────────────────────────
// DailyTasks: The main page
// ────────────────────────────────────────────────────────────
export default function DailyTasks() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const userConfig = userEmail ? userConfigs[userEmail] : null;

  // More detailed logging
  console.log('DailyTasks Debug:', JSON.stringify({
    sessionEmail: session?.user?.email,
    userEmail,
    userConfigName: userConfig?.name,
    fullUserConfig: userConfig
  }, null, 2));

  const [igTasks, setIgTasks] = useState<IGPost[]>([]);
  const [redditTasks, setRedditTasks] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contentTypeFilter, setContentTypeFilter] = useState<ContentType>("all");
  const [activeTab, setActiveTab] = useState<TabType>("todo");
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // For success message
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  // ────────────────────���────────────────────────────────────────
  // Fetch data once (both IG + Reddit)
  // ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!userConfig?.igViewId || !userConfig?.redditViewId) {
          throw new Error('User view IDs not found');
        }

        const [igData, redditData] = await Promise.all([
          fetchIGPosts(userConfig.igViewId),
          fetchRedditPosts(userConfig.redditViewId)
        ]);

        setIgTasks(igData);
        setRedditTasks(redditData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      }
      setIsLoading(false);
    };

    if (userConfig) {
      fetchData();
    }
  }, [userConfig]);

  // ─────────────────────────────────────────────────────────���───
  // Counters for the filter buttons
  // ────────────────────────────────────────────────────────────
  const counts = useMemo(() => {
    const reelsCount = igTasks.length;
    const imagesCount = redditTasks.filter((t) => t.Media === "Image").length;
    const videosCount = redditTasks.filter((t) => t.Media === "Gif/Video").length;
    return {
      all: reelsCount + redditTasks.length,
      reels: reelsCount,
      images: imagesCount,
      videos: videosCount,
    };
  }, [igTasks, redditTasks]);

  // ────────────────────────────────────────────────────────────
  // Build "to-do" vs "done" sets
  // ────────────────────────────────────────────────────────────
  const todoTasks = useMemo(() => {
    let filtered: (IGPost | RedditPost)[] = [];

    // 1) Filter by content type
    if (contentTypeFilter === "all") {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === "reels") {
      filtered = igTasks.filter(task => 
        task['Cloudinary URL']?.toLowerCase().includes('reel')
      );
    } else if (contentTypeFilter === "image") {
      filtered = redditTasks.filter((t) => t.Media === "Image");
    } else if (contentTypeFilter === "video") {
      filtered = redditTasks.filter((t) => t.Media === "Gif/Video");
    }

    // 2) Keep only tasks that are NOT done
    return filtered.filter((task) => {
      const doneField = isIGPost(task) ? userConfig?.doneFieldIG : userConfig?.doneFieldReddit;
      return !task[doneField || ''];
    });
  }, [igTasks, redditTasks, contentTypeFilter, userConfig]);

  const doneTasks = useMemo(() => {
    let filtered: (IGPost | RedditPost)[] = [];

    if (contentTypeFilter === "all") {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === "reels") {
      filtered = igTasks.filter(task => 
        task['Cloudinary URL']?.toLowerCase().includes('reel')
      );
    } else if (contentTypeFilter === "image") {
      filtered = redditTasks.filter((t) => t.Media === "Image");
    } else if (contentTypeFilter === "video") {
      filtered = redditTasks.filter((t) => t.Media === "Gif/Video");
    }

    // Keep only tasks that ARE done
    return filtered.filter((task) => {
      const doneField = isIGPost(task) ? userConfig?.doneFieldIG : userConfig?.doneFieldReddit;
      return task[doneField || ''];
    });
  }, [igTasks, redditTasks, contentTypeFilter, userConfig]);

  // Which list is visible (To-Do or Done)?
  const currentTasks = activeTab === "todo" ? todoTasks : doneTasks;

  // ────────────────────────────────────────────────────────────
  // Paginate with infinite scroll
  // ────────────────────────────────────────────────────────────
  const visibleTasks = useMemo(
    () => currentTasks.slice(0, displayedItems),
    [currentTasks, displayedItems]
  );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !isLoadingMore &&
        currentTasks.length > displayedItems
      ) {
        setIsLoadingMore(true);
        setDisplayedItems((prev) => prev + ITEMS_PER_PAGE);
        setIsLoadingMore(false);
      }
    });

    const el = observerTarget.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [currentTasks, displayedItems, isLoadingMore]);

  // ──────��───────────────────────────────────���─────────────────
  // Handle toggling "Done" => moves from To-Do to Done
  // ────────────────────────────────────────────────────────────
  const handleTaskDone = async (taskId: string, done: boolean, isInstagram: boolean, doneField: string) => {
    try {
      await updateDoneStatus(taskId, done, isInstagram, doneField);
      
      // Update local state for both igTasks and redditTasks
      if (isInstagram) {
        setIgTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, [doneField]: done } : task
          )
        );
      } else {
        setRedditTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId ? { ...task, [doneField]: done } : task
          )
        );
      }

      // Show success message
      console.log(`Task ${done ? 'completed' : 'uncompleted'} successfully`);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Overall progress
  // ─��─────────────────────────────────────���────────────────────
  const progressStats = useMemo(() => {
    const all = [...igTasks, ...redditTasks];
    const total = all.length;
    const completed = all.filter((t) => {
      const doneField = isIGPost(t) ? userConfig?.doneFieldIG : userConfig?.doneFieldReddit;
      return t[doneField || ''];
    }).length;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, remaining, percentage };
  }, [igTasks, redditTasks, userConfig]);

  // ────────────────────────────────────────────────────────────
  // Rendering
  // ──────────────────���─────────────────────────────────────────
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

  console.log('Rendering DailyTasks with:', {
    userName: userConfig?.name,
    todoCount: todoTasks.length,
    doneCount: doneTasks.length
  });

  return (
    <div className="py-6 max-w-7xl mx-auto px-4">
      {/* Progress Section */}
      <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-6 mb-8 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {userConfig?.name ? `${userConfig.name}'s Progress` : "Today's Progress"}
        </h1>
        
        {/* Motivational message based on progress */}
        <p className="mb-4">
          {progressStats.remaining === 0 
            ? "Amazing job! You've completed all tasks! 🎉" 
            : `${progressStats.remaining} tasks to conquer! You've got this! 💪`
          }
        </p>

        <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>

        <p className="text-lg">
          {progressStats.completed} of {progressStats.total} tasks completed
          {progressStats.percentage >= 50 && " - You're crushing it! 🌟"}
        </p>
      </div>

      {/* Filter by content type */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Filter by Content Type</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={contentTypeFilter === "all" ? "default" : "outline"}
            onClick={() => setContentTypeFilter("all")}
          >
            All {counts.all}
          </Button>
          <Button
            variant={contentTypeFilter === "reels" ? "default" : "outline"}
            onClick={() => setContentTypeFilter("reels")}
          >
            Reels {counts.reels}
          </Button>
          <Button
            variant={contentTypeFilter === "image" ? "default" : "outline"}
            onClick={() => setContentTypeFilter("image")}
          >
            Images {counts.images}
          </Button>
          <Button
            variant={contentTypeFilter === "video" ? "default" : "outline"}
            onClick={() => setContentTypeFilter("video")}
          >
            Videos {counts.videos}
          </Button>
        </div>
      </div>

      {/* To-Do / Done Tabs */}
      <div className="mb-6 flex gap-2">
        <Button
          variant={activeTab === "todo" ? "default" : "outline"}
          onClick={() => setActiveTab("todo")}
        >
          To-Do ({todoTasks.length})
        </Button>
        <Button
          variant={activeTab === "done" ? "default" : "outline"}
          onClick={() => setActiveTab("done")}
        >
          Done ({doneTasks.length})
        </Button>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {visibleTasks.map((task, index) => {
            return (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDone={handleTaskDone}
                type={isIGPost(task) ? "instagram" : "reddit"}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Infinite scroll marker */}
      {currentTasks.length > displayedItems && (
        <div ref={observerTarget} className="h-12" />
      )}

      {/* Success toast */}
      {showMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md z-50">
          {message}
        </div>
      )}

      {/* Add this debugging info */}
      <div className="text-sm text-gray-500 mb-2">
        Debug: Email={userEmail}, Name={userConfig?.name}
      </div>
    </div>
  );
}

const filterContent = (tasks: IGPost[], filter: ContentType) => {
  switch (filter) {
    case 'reels':
      return tasks.filter(task => 
        task['Cloudinary URL']?.toLowerCase().includes('reel')
      );
    
    case 'image':
      return tasks.filter(task => {
        const url = task['Cloudinary URL']?.toLowerCase();
        return url && (
          url.endsWith('.jpg') || 
          url.endsWith('.jpeg') || 
          url.endsWith('.png') || 
          url.endsWith('.gif')
        );
      });
    
    case 'video':
      return tasks.filter(task => {
        const url = task['Cloudinary URL']?.toLowerCase();
        return url && (
          (url.endsWith('.mp4') || 
           url.endsWith('.mov') || 
           url.endsWith('.webm')) && 
          !url.includes('reel')
        );
      });
    
    default:
      return tasks; // 'all' case
  }
};
