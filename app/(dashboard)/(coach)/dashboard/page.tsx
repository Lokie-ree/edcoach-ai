"use client";

import {
  Users,
  BookOpen,
  ThumbsUp,
  TrendingUp,
  ChevronRight,
  FileText,
  Target,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PrioritiesPanel } from "@/app/(dashboard)/(coach)/dashboard/components/PrioritiesPanel";
import { LoadingStateVariants } from "@/components/common/LoadingState";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";
import { QuickActions } from "@/app/(dashboard)/(coach)/dashboard/components/QuickActions";
import { ANIMATIONS, ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

// Mobile-first coach dashboard with card-based layout

// Utility function to format timestamps
function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else {
    return "Just now";
  }
}

// Enhanced mobile metrics overview with detailed breakdown
function MetricsOverview({
  analytics,
}: {
  analytics: {
    totalTeachers?: number;
    activeTeachers?: number;
    totalWalkthroughs?: number;
    feedbackTrend?: number;
    mostCommonReinforcement?: { count?: number; indicatorName?: string };
    mostCommonRefinement?: { count?: number; indicatorName?: string };
  };
}) {
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState(0);

  const metricViews = [
    // View 1: Core metrics
    [
      {
        label: "Teachers",
        value: analytics.totalTeachers,
        icon: Users,
        trend:
          (analytics.activeTeachers ?? 0) > 0
            ? `${analytics.activeTeachers ?? 0} active`
            : undefined,
        href: "/teachers",
      },
      {
        label: "Walkthroughs",
        value: analytics.totalWalkthroughs,
        icon: BookOpen,
        trend:
          (analytics.feedbackTrend ?? 0) !== 0
            ? `${(analytics.feedbackTrend ?? 0) > 0 ? "+" : ""}${analytics.feedbackTrend ?? 0}%`
            : undefined,
        href: "/walkthrough",
      },
    ],
    // View 2: Insights metrics (only show if we have data)
    ...(analytics.mostCommonReinforcement || analytics.mostCommonRefinement
      ? [
          [
            {
              label: "Top Strength",
              value: analytics.mostCommonReinforcement?.count || 0,
              icon: ThumbsUp,
              trend: analytics.mostCommonReinforcement?.indicatorName || "None",
              href: "/analytics",
            },
            {
              label: "Growth Area",
              value: analytics.mostCommonRefinement?.count || 0,
              icon: Target,
              trend: analytics.mostCommonRefinement?.indicatorName || "None",
              href: "/analytics",
            },
          ],
        ]
      : []),
  ];

  const swipeHandlers = isMobile
    ? {
        onSwipeLeft: () => {
          if (currentView < metricViews.length - 1) {
            setCurrentView(currentView + 1);
          }
        },
        onSwipeRight: () => {
          if (currentView > 0) {
            setCurrentView(currentView - 1);
          }
        },
      }
    : {};

  const swipeRef = useSwipe<HTMLDivElement>(swipeHandlers);

  const currentMetrics = metricViews[currentView] || metricViews[0];

  return (
    <div className="space-y-3">
      <div
        ref={swipeRef}
        className="grid grid-cols-2 gap-3 relative overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {currentMetrics.map((metric, index) => (
            <motion.div
              key={`${currentView}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={metric.href}>
                <Card className={cn(
                  "text-center cursor-pointer hover:shadow-md active:scale-95",
                  ANIMATIONS.classes.normal
                )}>
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-2">
                      <metric.icon className={cn(ICONS.semantic.button, "text-muted-foreground")} />
                      <div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-xs text-muted-foreground">
                          {metric.label}
                        </div>
                        {metric.trend && (
                          <div className="text-xs text-primary font-medium mt-1 truncate">
                            {metric.trend}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Page indicators for mobile swipe */}
      {isMobile && metricViews.length > 1 && (
        <div className="flex justify-center gap-1">
          {metricViews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentView(index)}
              className={cn(
                "w-2 h-2 rounded-full",
                ANIMATIONS.classes.normal,
                index === currentView ? "bg-primary" : "bg-muted"
              )}
              aria-label={`View metrics page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Top insights card for mobile
function TopInsights({
  analytics,
}: {
  analytics: {
    mostCommonReinforcement?: { indicatorName?: string; count?: number };
    mostCommonRefinement?: { indicatorName?: string; count?: number };
  };
}) {
  const insights = [];

  if (analytics.mostCommonReinforcement) {
    insights.push({
      type: "strength",
      title: "Top Strength",
      value: analytics.mostCommonReinforcement.indicatorName,
      count: analytics.mostCommonReinforcement.count,
      icon: ThumbsUp,
      color: STATUS_COLORS.success.text,
    });
  }

  if (analytics.mostCommonRefinement) {
    insights.push({
      type: "growth",
      title: "Growth Focus",
      value: analytics.mostCommonRefinement.indicatorName,
      count: analytics.mostCommonRefinement.count,
      icon: Target,
      color: STATUS_COLORS.warning.text,
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className={ICONS.semantic.inline} />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-full bg-muted ${insight.color}`}>
              <insight.icon className={ICONS.sizes.xs} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {insight.title}
              </div>
              <div className="text-sm font-medium truncate">
                {insight.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {insight.count} observation{insight.count !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Type for the analytics with the missing properties
interface ExtendedAnalytics {
  totalTeachers: number;
  activeTeachers: number;
  totalWalkthroughs: number;
  totalFeedbackGenerated?: number;
  topStrengths?: Array<{ indicator: string; indicatorName: string; count: number }>;
  topGrowthAreas?: Array<{ indicator: string; indicatorName: string; count: number }>;
  recentActivity?: Array<{
    id: string;
    type: string;
    teacherName: string;
    timestamp: number;
    status: string;
    title: string;
    href: string;
  }>;
  priorities?: {
    walkthroughsDue: number;
    reflectionsToReview: number;
    teachersNeedingSupport: number;
  };
}

export default function CoachDashboardPage() {
  const { user } = useUser();
  const analyticsRaw = useQuery(api.analytics.getCoachAnalytics);
  const analytics = analyticsRaw as ExtendedAnalytics | undefined;
  const isMobile = useIsMobile();

  if (!analytics) {
    return (
      <div className="py-3 md:py-4 space-y-4">
        {/* Mobile-first loading skeleton */}
        <LoadingStateVariants.Card isLoading={true}>
          <div className="space-y-3">
            <div className="h-8 w-48" />
            <div className="h-4 w-72" />
          </div>
        </LoadingStateVariants.Card>

        {/* Quick actions skeleton */}
        <div className="space-y-3">
          <LoadingStateVariants.Card isLoading={true}>
            <div className="h-20 w-full" />
          </LoadingStateVariants.Card>
          <LoadingStateVariants.Card isLoading={true}>
            <div className="h-20 w-full" />
          </LoadingStateVariants.Card>
        </div>

        {/* Layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LoadingStateVariants.Card isLoading={true}>
              <div className="h-32 w-full" />
            </LoadingStateVariants.Card>
            <LoadingStateVariants.Card isLoading={true}>
              <div className="h-24 w-full" />
            </LoadingStateVariants.Card>
          </div>
          <div>
            <LoadingStateVariants.Card isLoading={true}>
              <div className="h-64 w-full" />
            </LoadingStateVariants.Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-3 md:py-4 space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back
          </span>
        </h1>
        <p className="text-muted-foreground">
          <AnimatedGradientText className="font-semibold">
            {user?.firstName || user?.fullName || "Coach"}
          </AnimatedGradientText>
          ! Here&apos;s your coaching overview.
        </p>
      </motion.div>

            {/* Quick Actions - Mobile only */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <QuickActions isMobile={true} />
        </motion.div>
      )}

{/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions - Span full width on larger devices */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-1 lg:col-span-2"
          >
            <QuickActions isMobile={false} />
          </motion.div>
        )}
        
        {/* Top KPI Cards - Span full width on larger devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="col-span-1 lg:col-span-2"
        >
          <MetricsOverview analytics={{
            totalTeachers: analytics.totalTeachers,
            activeTeachers: analytics.activeTeachers,
            totalWalkthroughs: analytics.totalWalkthroughs,
            feedbackTrend: analytics.totalFeedbackGenerated || 0,
            mostCommonReinforcement: analytics.topStrengths?.[0] ? {
              count: analytics.topStrengths[0].count,
              indicatorName: analytics.topStrengths[0].indicatorName
            } : undefined,
            mostCommonRefinement: analytics.topGrowthAreas?.[0] ? {
              count: analytics.topGrowthAreas[0].count,
              indicatorName: analytics.topGrowthAreas[0].indicatorName
            } : undefined
          }} />
        </motion.div>
        
        {/* Left Column: Priorities Panel (The Most Important Part) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <PrioritiesPanel priorities={{
            walkthroughsDue: analytics.priorities?.walkthroughsDue || 0,
            reflectionsToReview: analytics.priorities?.reflectionsToReview || 0,
            teachersNeedingSupport: analytics.priorities?.teachersNeedingSupport || 0
          }} />

          {/* Key Insights */}
          <TopInsights analytics={{
            mostCommonReinforcement: analytics.topStrengths?.[0] ? {
              count: analytics.topStrengths[0].count,
              indicatorName: analytics.topStrengths[0].indicatorName
            } : undefined,
            mostCommonRefinement: analytics.topGrowthAreas?.[0] ? {
              count: analytics.topGrowthAreas[0].count,
              indicatorName: analytics.topGrowthAreas[0].indicatorName
            } : undefined
          }} />
        </motion.div>

        {/* Right Column: Recent Activity Feed (Context) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className={ICONS.semantic.inline} />
                Recent Activity
                <Badge variant="secondary" className="text-xs">
                  {analytics.recentActivity?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={analytics.recentActivity?.map(activity => ({
                id: activity.id,
                type: activity.type as "walkthrough" | "pgp_goal" | "reflection" | "feedback" | "milestone",
                title: activity.title,
                description: `Activity for ${activity.teacherName}`,
                teacherName: activity.teacherName,
                teacherAvatar: undefined,
                timestamp: formatTimeAgo(activity.timestamp),
                status: activity.status as "completed" | "pending" | "in_progress",
                priority: "medium" as "high" | "medium" | "low"
              })) || []} />
              {analytics.recentActivity && analytics.recentActivity.length > 0 && (
                <div className="mt-4 text-center">
                  <Link href="/analytics">
                    <Button variant="ghost" size="sm">
                      View All Activity
                      <ChevronRight className={cn(ICONS.sizes.xs, "ml-1")} />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
