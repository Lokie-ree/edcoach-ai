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

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/onboarding(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
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
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
