// import { authMiddleware } from "@clerk/nextjs";
 
// // This example protects all routes including api/trpc routes
// // Please edit this to allow other routes to be public as needed.
// // See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
// export default authMiddleware({
// });
 
// export const config = {
//   matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
// };
 

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
