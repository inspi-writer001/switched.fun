import { authMiddleware } from "@civic/auth-web3/nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/",
  "/api/webhooks",
  "/api/uploadthing",
  "/search",
  "/api/auth", // Add auth routes
];

const withCivicAuth = authMiddleware();

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for all API routes to avoid blocking webhooks
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Check for dynamic username routes (/:username)
  const isUsernameRoute = pathname.match(/^\/[^\/]+$/);

  if (isPublicRoute || isUsernameRoute) {
    return NextResponse.next();
  }

  // Apply Civic auth for protected routes
  return withCivicAuth(request);
}

export const config = {
  // include the paths you wish to secure here
  matcher: [
    "/u/:path*",

    /*
     * Match all request paths except:
     * - _next directory (Next.js static files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - image files
     * - ALL api routes (to avoid blocking webhooks)
     */
    "/((?!_next|favicon.ico|sitemap.xml|robots.txt|api/|.*.jpg|.*.png|.*.svg|.*.gif).*)",
  ],
};
