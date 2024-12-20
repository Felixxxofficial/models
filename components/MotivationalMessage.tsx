import React from 'react'

interface MotivationalMessageProps {
  todoCount: number
  doneCount: number
}

export function MotivationalMessage({ todoCount, doneCount }: MotivationalMessageProps) {
  const total = todoCount + doneCount
  const progress = (doneCount / total) * 100

  const getMessage = () => {
    if (progress === 0) return `${total} tasks to conquer! Let's get started! 💪`
    if (progress < 25) return `${todoCount} to go! You've got this! 🚀`
    if (progress < 50) return `Halfway there! Just ${todoCount} more to crush! ⭐`
    if (progress < 75) return `Almost there! Only ${todoCount} left. You're a star! 🌟`
    if (progress < 100) return `Final stretch! ${todoCount} to go. Victory is near! 🏁`
    return "All done! You're amazing! Time to celebrate! 🎉"
  }

  return (
    <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white p-4 rounded-lg shadow-md mb-6 text-center">
      <h2 className="text-2xl font-bold mb-2">Today's Progress</h2>
      <p className="text-lg">{getMessage()}</p>
      <div className="w-full bg-white rounded-full h-2.5 mt-3">
        <div 
          className="bg-green-400 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

