'use client'

import { signIn } from "next-auth/react"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg p-8 mb-8 text-white shadow-xl">
          <div className="text-center">
            <div className="mb-8">
              <Image
                src="/model5-removebg.png"
                alt="Belle Vie Logo"
                width={120}
                height={120}
                className="mx-auto"
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Welcome To Elite Models Club
            </h2>
            <p className="text-white/80">
              Please sign in with your Google account to continue
            </p>
          </div>
        </div>

        <button
          onClick={() => signIn('google', { callbackUrl: '/dailytasks' })}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 
                   bg-white hover:bg-gray-100 
                   rounded-xl shadow-lg transform transition-all duration-200 
                   hover:scale-[1.02] active:scale-[0.98]
                   text-gray-900 font-medium
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
        >
          <Image
            src="/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
            className="w-5 h-5"
          />
          Sign in with Google
        </button>
      </div>
    </div>
  )
} 