import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function ProgressTracker() {
  const totalTasks = 5
  const completedTasks = 2

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Today's Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={(completedTasks / totalTasks) * 100} className="w-full" />
          <p className="text-center text-lg font-medium text-gray-800 dark:text-white">
            {completedTasks} of {totalTasks} tasks completed
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

