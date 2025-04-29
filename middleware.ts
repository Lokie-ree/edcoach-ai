import { auth, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// List of public routes
const publicRoutes = [
  "/",
  "/about",
  "/api(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
];

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Handle authentication for protected routes
  const authState = await auth();
  const { userId, orgId } = authState;

  // If not authenticated, redirect to sign-in
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If authenticated but no organization selected and trying to access protected routes
  if (
    userId && 
    !orgId && 
    pathname !== "/organizations/select" &&
    ["/dashboard", "/teachers", "/manage-plan"].some(route => pathname.startsWith(route))
  ) {
    const orgSelection = new URL("/organizations/select", req.url);
    return NextResponse.redirect(orgSelection);
  }

  // Get the response
  const response = NextResponse.next();

  // Set security headers
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.clerk.io https://cdn.jsdelivr.net https://enhanced-parrot-74.clerk.accounts.dev",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://img.clerk.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.clerk.dev https://clerk.edcoach-ai.com https://convex.edcoach-ai.com wss://convex.edcoach-ai.com https://enhanced-parrot-74.clerk.accounts.dev wss://optimistic-mink-614.convex.cloud",
    "frame-src 'self' https://clerk.edcoach-ai.com https://enhanced-parrot-74.clerk.accounts.dev",
    "worker-src 'self' blob:",
  ].join("; ");

  // Add security headers
  const headers = response.headers;
  
  // Content Security Policy
  headers.set('Content-Security-Policy', cspHeader);
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  // Restrict browser features
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Enable XSS protection in browsers that support it
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Disable FLoC tracking
  headers.set('Permissions-Policy', 'interest-cohort=()');
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});

// Only run the middleware on the following paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
