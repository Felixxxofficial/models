'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import DailyTasks from "@/components/DailyTasks"

export default function DailyTasksPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return <DailyTasks />
} 