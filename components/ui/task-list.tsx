import { useState } from "react";
import { TaskItem } from "./task-item";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  'Instagram GDrive'?: string;
  'Done Meli'?: boolean;
  type?: 'image' | 'video' | 'story';
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Task 1", completed: false },
    { id: "2", title: "Task 2", completed: false },
  ]);

  const handleToggle = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
} 