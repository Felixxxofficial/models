import { AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { TaskItem } from "./task-item";
import { useState } from "react";

export function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Task 1", completed: false },
    { id: 2, title: "Task 2", completed: false },
    // ... more tasks
  ]);

  const handleToggle = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ));
  };

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      
      <TabsContent value="active">
        <AnimatePresence mode="popLayout">
          {tasks
            .filter(task => !task.completed)
            .map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
              />
            ))}
        </AnimatePresence>
      </TabsContent>
      
      <TabsContent value="completed">
        <AnimatePresence mode="popLayout">
          {tasks
            .filter(task => task.completed)
            .map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onToggle={() => handleToggle(task.id)}
              />
            ))}
        </AnimatePresence>
      </TabsContent>
    </Tabs>
  );
} 