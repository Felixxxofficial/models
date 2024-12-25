'use client'

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import DailyTasks from "@/components/DailyTasks"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Welcome, {session.user?.email}</h1>
          <button
            onClick={() => signOut()}
            className="text-red-500 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DailyTasks />
      </main>
    </div>
  )
} 