'use client'

import { useState } from 'react'
import DailyTasks from '@/components/DailyTasks'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-pink-50">
      <main className="flex-1 container px-4 sm:px-6 mx-auto">
        <DailyTasks />
      </main>
    </div>
  )
}

