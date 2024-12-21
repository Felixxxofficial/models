import { motion } from 'framer-motion';

interface ProgressMessageProps {
  totalTasks: number;
  completedTasks: number;
}

export function ProgressMessage({ totalTasks, completedTasks }: ProgressMessageProps) {
  return (
    <div className="text-center mb-4">
      <p className="text-lg">
        {completedTasks === totalTasks ? (
          "All tasks completed! 🎉"
        ) : (
          `${completedTasks} of ${totalTasks} tasks completed`
        )}
      </p>
    </div>
  );
} 