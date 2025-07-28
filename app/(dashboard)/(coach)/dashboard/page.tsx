"use client";

import {
  Users,
  BookOpen,
  Plus,
  UserPlus,
  ThumbsUp,
  Wrench,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KpiCard } from "@/app/(dashboard)/(coach)/dashboard/components/KpiCard";
import { RecentActivityFeed } from "@/app/(dashboard)/(coach)/dashboard/components/RecentActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/PageHeader";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TeacherInvitationForm } from "@/app/(dashboard)/(coach)/teachers/components/TeacherInvitationForm";

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
        rightContent={
          <div className="flex flex-wrap gap-3">
            <Link href="/walkthrough/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Start Walkthrough
              </Button>
            </Link>
            <TeacherInvitationForm
              trigger={
                <Button variant="outline" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Teacher
                </Button>
              }
            />
          </div>
        }
      />

      {/* KPI Cards - More responsive grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <KpiCard
          title="Total Teachers"
          value={analytics.totalTeachers}
          icon={Users}
          description="Active teachers in your portfolio"
        />
        <KpiCard
          title="Total Walkthroughs"
          value={analytics.totalWalkthroughs}
          icon={BookOpen}
          description="Walkthroughs completed this month"
        />
        <KpiCard
          title="Most Common Reinforcement"
          value={
            analytics.mostCommonReinforcement
              ? analytics.mostCommonReinforcement.count
              : 0
          }
          icon={ThumbsUp}
          description={
            analytics.mostCommonReinforcement
              ? analytics.mostCommonReinforcement.indicatorName
              : "None"
          }
        />
        <KpiCard
          title="Most Common Refinement"
          value={
            analytics.mostCommonRefinement
              ? analytics.mostCommonRefinement.count
              : 0
          }
          icon={Wrench}
          description={
            analytics.mostCommonRefinement
              ? analytics.mostCommonRefinement.indicatorName
              : "None"
          }
        />
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-4 lg:gap-6 grid-cols-1">
        {/* Recent Activity Feed - Full width */}
        <RecentActivityFeed activities={analytics.recentActivity} />
      </div>
    </div>
  );
}
