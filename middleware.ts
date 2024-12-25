import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthPage = request.nextUrl.pathname === "/"

  if (isAuthPage) {
    if (token) {
      // If user is authenticated and trying to access auth page, redirect to dailytasks
      return NextResponse.redirect(new URL("/dailytasks", request.url))
    }
  } else {
    // Protect other routes
    if (!token) {
      // If user is not authenticated and trying to access protected route, redirect to login
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/",
    "/dailytasks",
    // Add other protected routes here
  ]
} 