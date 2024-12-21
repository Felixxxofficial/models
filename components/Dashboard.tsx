'use client'

import { useState } from 'react'
import DailyTasks from './DailyTasks'
import ProgressTracker from './ProgressTracker'
import ThemeToggle from './ThemeToggle'

export default function Dashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  return (
    <div className={`p-4 sm:p-6 lg:p-8 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Model Portal</h1>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyTasks />
          </div>
          <div>
            <ProgressTracker />
          </div>
        </div>
      </div>
    </div>
  )
}

