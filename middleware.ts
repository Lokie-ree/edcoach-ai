import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Skip middleware in test/CI environments where Clerk keys might be placeholders
const isTestEnvironment = process.env.NODE_ENV === 'test' || process.env.CI === 'true';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/analytics(.*)',
  '/teachers(.*)',
  '/walkthrough(.*)',
]);

const isCoachRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/analytics(.*)', 
  '/teachers(.*)',
  '/walkthrough(.*)'
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)',
  '/invite(.*)',
  '/billing(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip middleware logic in test environments
  if (isTestEnvironment) {
    return NextResponse.next();
  }

  const { userId } = await auth();
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

  // Subscription/plan enforcement for coach routes
  if (userId && isCoachRoute(req)) {
    // Check plan/usage limits (client-side enforcement is primary, but add server-side for belt & suspenders)
    // NOTE: This is a placeholder. In production, you would call a backend API or Convex action to check limits.
    // For now, just pass and rely on client-side enforcement.
    // Example:
    // const overLimit = await checkLimits(userId);
    // if (overLimit) {
    //   url.pathname = '/billing';
    //   url.searchParams.set('limit', overLimit);
    //   return NextResponse.redirect(url);
    // }
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
