import { motion } from "framer-motion";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  'Instagram GDrive'?: string;
  'Done Meli'?: boolean;
  type?: 'image' | 'video' | 'story';
}

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, completed: boolean) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <span className={task.completed ? "line-through" : ""}>
          {task.title}
        </span>
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className="ml-4 text-blue-500 hover:text-blue-700"
        >
          {task.completed ? "Undo" : "Complete"}
        </button>
      </div>
    </motion.div>
  );
} 