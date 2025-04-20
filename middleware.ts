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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
