"use client";

import { Users, BookOpen, MessageSquare } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PrioritiesPanel } from "@/components/dashboard/PrioritiesPanel";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoachDashboardPage() {
  const analytics = useQuery(api.analytics.getCoachAnalytics);

  if (!analytics) {
    return (
      <div className="py-4 md:py-6 space-y-6">
        {/* KPI Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 border rounded-lg">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        {/* Main Dashboard Content Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 border rounded-lg">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="p-6 border rounded-lg">
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
    <div className="py-4 md:py-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Main Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priorities Panel */}
        <PrioritiesPanel
          walkthroughsDue={analytics.priorities.walkthroughsDue}
          reflectionsToReview={analytics.priorities.reflectionsToReview}
          teachersNeedingSupport={analytics.priorities.teachersNeedingSupport}
        />

        {/* Recent Activity Feed */}
        <RecentActivityFeed activities={analytics.recentActivity} />
      </div>
    </div>
  );
}
