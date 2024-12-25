import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { userConfigs } from "@/lib/user-config"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in for configured users
      return !!userConfigs[user.email ?? '']
    },
    async session({ session }) {
      console.log("Session callback:", session); // Debug log
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Add error page redirect
  },
})

export { handler as GET, handler as POST } 