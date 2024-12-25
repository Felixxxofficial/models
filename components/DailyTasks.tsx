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

const ITEMS_PER_PAGE = 9;

// Helpers to distinguish Reddit vs Instagram
function isRedditPost(task: IGPost | RedditPost): task is RedditPost {
  return "Media" in task;
}
function isIGPost(task: IGPost | RedditPost): task is IGPost {
  return "Instagram GDrive" in task;
}

type ContentType = "all" | "reels" | "image" | "video";
type TabType = "todo" | "done";

// ─────────────────────────────────────────────────────────────
// TaskCard: Renders one card (image or video) + Done switch
// ─────────────────────────────────────────────────────────────
interface TaskCardProps {
  task: IGPost | RedditPost;
  index?: number;
  onDone: (taskId: string, done: boolean, isInstagram: boolean) => Promise<void>;
  type: "instagram" | "reddit";
}
function TaskCard({ task, index, onDone, type }: TaskCardProps) {
  const { data: session } = useSession();
  const userConfig = session?.user?.email ? userConfigs[session.user.email] : null;
  
  const [isDone, setIsDone] = useState(task[`Done ${userConfig?.name}`] || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await onDone(task.id, checked, type === "instagram");
      setIsDone(checked);
    } catch (error) {
      console.error("Error toggling done status:", error);
    }
    setIsUpdating(false);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index ?? 0) * 0.05 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <ContentDisplay content={task} type={type} />

          <div className="flex flex-col gap-2 mt-3">
            {/* Upload and Toggle row */}
            <div className="flex justify-between items-center">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white hover:from-purple-500 hover:to-pink-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
                className="scale-75"
              />
            </div>
            {/* Badge row */}
            <Badge variant="outline" className="self-start">
              {type}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// DailyTasks: The main page
// ─────────────────────────────────────────────────────────────
export default function DailyTasks() {
  const { data: session } = useSession();
  const userConfig = session?.user?.email ? userConfigs[session.user.email] : null;
  
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

  // ─────────────────────────────────────────────────────────
  // Fetch data once (both IG + Reddit)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/airtable');
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error);
        
        setIgTasks(data.instagram);
        setRedditTasks(data.reddit);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // ────────────────────────────────────────────────────────────
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
      filtered = igTasks; // all IG tasks
    } else if (contentTypeFilter === "image") {
      filtered = redditTasks.filter((t) => t.Media === "Image");
    } else if (contentTypeFilter === "video") {
      filtered = [
        ...redditTasks.filter((t) => t.Media === "Gif/Video"),
        ...igTasks,
      ];
    }

    // 2) Keep only tasks that are NOT done
    return filtered.filter((task) => !task[`Done ${userConfig?.name}`]);
  }, [igTasks, redditTasks, contentTypeFilter, userConfig]);

  const doneTasks = useMemo(() => {
    let filtered: (IGPost | RedditPost)[] = [];

    if (contentTypeFilter === "all") {
      filtered = [...igTasks, ...redditTasks];
    } else if (contentTypeFilter === "reels") {
      filtered = igTasks;
    } else if (contentTypeFilter === "image") {
      filtered = redditTasks.filter((t) => t.Media === "Image");
    } else if (contentTypeFilter === "video") {
      filtered = [
        ...redditTasks.filter((t) => t.Media === "Gif/Video"),
        ...igTasks,
      ];
    }

    // Keep only tasks that ARE done
    return filtered.filter((task) => task[`Done ${userConfig?.name}`]);
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

  // ────────────────────────────────────────────────────────────
  // Handle toggling "Done" => moves from To-Do to Done
  // ────────────────────────────────────────────────────────────
  const handleTaskDone = async (taskId: string, done: boolean, isInstagram: boolean) => {
    try {
      const response = await fetch('/api/airtable', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, done, isInstagram }),
      });

      // Update local state after successful Airtable update
      if (isInstagram) {
        setIgTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, "Done Meli": done } : t))
        );
      } else {
        setRedditTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, "Done Meli": done } : t))
        );
      }

      setMessage("Task updated successfully!");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
    } catch (error) {
      console.error("Error updating task:", error);
      // Show error message to user
      setMessage("Failed to update task. Please try again.");
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2500);
    }
  };

  // ────────────────────────────────────────────────────────────
  // Overall progress
  // ────────────────────────────────────────────────────────────
  const progressStats = useMemo(() => {
    const all = [...igTasks, ...redditTasks];
    const total = all.length;
    const completed = all.filter((t) => t["Done Meli"]).length;
    const remaining = total - completed;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, remaining, percentage };
  }, [igTasks, redditTasks]);

  // ────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────��──────────────────────────────────────
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
        <p className="mb-4">{progressStats.remaining} tasks to conquer! Let's go! 💪</p>
        <div className="w-full bg-white/30 rounded-full h-4 mb-2">
          <div
            className="bg-white rounded-full h-4 transition-all duration-500"
            style={{ width: `${progressStats.percentage}%` }}
          />
        </div>
        <p>{progressStats.completed} of {progressStats.total} tasks completed</p>
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
            const taskType = isIGPost(task) ? "instagram" : "reddit";
            return (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDone={handleTaskDone}
                type={taskType}
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
    </div>
  );
}
