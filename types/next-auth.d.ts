import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user?: {
      email?: string | null
      name?: string | null
      image?: string | null
      config?: {
        name: string
        doneFieldIG: string
        doneFieldReddit: string
        igViewId: string
        redditViewId: string
      }
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    userConfig?: {
      name: string
      doneFieldIG: string
      doneFieldReddit: string
      igViewId: string
      redditViewId: string
    }
  }
} 