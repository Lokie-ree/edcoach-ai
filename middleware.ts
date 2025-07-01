import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/analytics(.*)',
  '/teachers(.*)',
  '/walkthrough(.*)',
  '/my-walkthroughs(.*)',
  '/my-progress(.*)',
  '/org(.*)'
]);

const isCoachRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/analytics(.*)', 
  '/teachers(.*)',
  '/walkthrough(.*)',
  '/org(.*)'
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/billing(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, has } = await auth();
  const url = req.nextUrl.clone();

  // If user is not authenticated and trying to access protected route
  if (isProtectedRoute(req) && !userId) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user is authenticated and on public route (except onboarding), redirect to dashboard
  if (userId && isPublicRoute(req) && url.pathname === '/') {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect the route if it's a protected route
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Skip subscription checks in middleware - handle in components with personal billing detection
  // Organization context in middleware may interfere with personal billing detection
  if (userId && isCoachRoute(req)) {
    console.log('🏠 Middleware: Skipping billing checks - will be handled by personal plan detection in components');
    // Let components handle personal billing detection using usePlanDetection hook
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
