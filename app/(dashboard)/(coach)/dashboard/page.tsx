"use client";

import { Users, BookOpen, MessageSquare, Plus, UserPlus } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrioritiesPanel } from "@/components/dashboard/PrioritiesPanel";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CoachDashboardPage() {
  const { user } = useUser();
  const analytics = useQuery(api.analytics.getCoachAnalytics);

  if (!analytics) {
    return (
      <div className="py-3 md:py-4 space-y-4">
        {/* Page Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-muted animate-pulse rounded w-48"></div>
          <div className="h-4 bg-muted animate-pulse rounded w-96"></div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Main Dashboard Content Skeleton */}
        <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="p-6 border rounded-lg xl:col-span-2">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 md:py-4 space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back,{" "}
            <AnimatedGradientText className="font-semibold">
              {user?.firstName || user?.fullName || "Coach"}
            </AnimatedGradientText>
            ! Here&apos;s your coaching overview and priorities.
          </>
        }
        gradient={true}
      />

      {/* Quick Actions - Prominently displayed below header */}
      <div className="flex flex-wrap gap-3">
        <Link href="/walkthrough/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Start New Walkthrough
          </Button>
        </Link>
        <Link href="/teachers">
          <Button variant="outline" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Teacher
          </Button>
        </Link>
      </div>

      {/* KPI Cards - More responsive grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard
          title="Total Teachers"
          value={analytics.totalTeachers}
          icon={Users}
          description="Active teachers in your portfolio"
        />
        <KpiCard
          title="Active Teachers"
          value={analytics.activeTeachers}
          icon={Users}
          description="Teachers with recent activity"
        />
        <KpiCard
          title="Total Walkthroughs"
          value={analytics.totalWalkthroughs}
          icon={BookOpen}
          description="Walkthroughs completed this month"
        />
        <KpiCard
          title="Feedback Generated"
          value={analytics.totalFeedbackGenerated}
          icon={MessageSquare}
          description="AI feedback pieces created"
        />
      </div>

      {/* Main Dashboard Content - Better space utilization */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Priorities Panel - Takes 1/3 on large screens */}
        <div className="xl:col-span-1">
          <PrioritiesPanel
            walkthroughsDue={analytics.priorities.walkthroughsDue}
            reflectionsToReview={analytics.priorities.reflectionsToReview}
            teachersNeedingSupport={analytics.priorities.teachersNeedingSupport}
          />
        </div>

        {/* Recent Activity Feed - Takes 2/3 on large screens */}
        <div className="xl:col-span-2">
          <RecentActivityFeed activities={analytics.recentActivity} />
        </div>
      </div>
    </div>
  );
}
