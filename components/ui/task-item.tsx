import { motion } from "framer-motion";

export function TaskItem({ task, onToggle }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 25
        }
      }}
      exit={{ 
        opacity: 0,
        y: task.completed ? 50 : -50,
        x: task.completed ? 100 : -100,
        transition: { 
          duration: 0.5,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={`
        p-4 mb-2 bg-card rounded-lg shadow-sm cursor-pointer border
        transition-colors duration-200
        ${task.completed ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          transition-colors duration-200
          ${task.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}
        `}>
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="text-white text-sm"
            >
              ✓
            </motion.div>
          )}
        </div>
        <span className={`
          transition-all duration-200
          ${task.completed ? 'line-through text-muted-foreground' : ''}
        `}>
          {task.title}
        </span>
      </div>
    </motion.div>
  );
} 