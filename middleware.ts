import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";

const publicRoutes = [
  "/",
  "/api/webhooks(.*)",
  "/api/uploadthing",
  "/:username",
  "/search"
]

export default authMiddleware();


export const config = {
  // include the paths you wish to secure here
  matcher: [
    '/u/:path*',

    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     */
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|.*\.jpg|.*\.png|.*\.svg|.*\.gif).*)',
  ],
}
