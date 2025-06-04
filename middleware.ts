import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// List of public routes
const publicRoutes = [
  "/",
  "/about",
  "/api(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/dev",
];

// Create a route matcher for public routes
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware((_, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
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
  headers.set('Content-Security-Policy', cspHeader);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('Permissions-Policy', 'interest-cohort=()');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
});

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
