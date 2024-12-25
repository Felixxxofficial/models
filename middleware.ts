import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => {
      // Only allow specific emails
      const allowedEmails = ['janota.d@gmail.com', 'client2@gmail.com']
      return token ? allowedEmails.includes(token.email ?? '') : false
    },
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dailytasks/:path*"
  ]
} 