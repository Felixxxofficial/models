import React from 'react'

interface MotivationalMessageProps {
  todoCount: number
  doneCount: number
  userName?: string
}

export function MotivationalMessage({ todoCount, doneCount, userName }: MotivationalMessageProps) {
  console.log('MotivationalMessage received props:', { todoCount, doneCount, userName });

  const total = todoCount + doneCount;
  const progress = (doneCount / total) * 100;

  return (
    <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="text-2xl font-bold">Today's Progress</h2>
        <div className="text-xl">Welcome back, {userName}! 👋</div>
      </div>

      <p className="text-lg mb-4">
        {todoCount} tasks to conquer! Let's go! 💪
      </p>

      <div className="w-full bg-white/20 rounded-full h-2.5 mb-3">
        <div 
          className="bg-white h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-lg">
        {doneCount} of {total} tasks completed
      </p>
    </div>
  );
}

