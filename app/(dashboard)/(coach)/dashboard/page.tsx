"use client";

import {
  Users,
  BookOpen,
  Plus,
  UserPlus,
  ThumbsUp,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  BarChart3,
  FileText,
  Target,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RecentActivityFeed } from "@/app/(dashboard)/(coach)/dashboard/components/RecentActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TeacherInvitationForm } from "@/app/(dashboard)/(coach)/teachers/components/TeacherInvitationForm";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useSwipe } from "@/hooks/use-swipe";
import { useIsMobile } from "@/hooks/use-mobile";

// Mobile-first coach dashboard with card-based layout
function QuickActionCard({
  title,
  icon: Icon,
  href,
  action,
  variant = "default",
  notification,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  action?: () => void;
  variant?: "default" | "primary";
  notification?: number;
}) {
  const cardContent = (
    <Card
      className={`h-20 cursor-pointer transition-all hover:shadow-md active:scale-95 ${
        variant === "primary" ? "bg-primary text-primary-foreground" : ""
      }`}
    >
      <CardContent className="flex items-center justify-between p-4 h-full">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              variant === "primary" ? "bg-primary-foreground/20" : "bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="font-medium text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {notification && (
            <Badge variant="secondary" className="text-xs">
              {notification}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 opacity-60" />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return <div onClick={action}>{cardContent}</div>;
}

// Mobile-optimized priority card
function PriorityCard({
  analytics,
}: {
  analytics: {
    priorities?: {
      walkthroughsDue?: number;
      reflectionsToReview?: number;
      teachersNeedingSupport?: number;
    };
  };
}) {
  const priorities = [
    {
      label: "Walkthroughs Due",
      count: analytics.priorities?.walkthroughsDue || 0,
      icon: Calendar,
      color:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    },
    {
      label: "Reflections to Review",
      count: analytics.priorities?.reflectionsToReview || 0,
      icon: FileText,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    },
    {
      label: "Teachers Needing Support",
      count: analytics.priorities?.teachersNeedingSupport || 0,
      icon: Target,
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
  ];

  const totalPriorities = priorities.reduce((sum, p) => sum + p.count, 0);

  if (totalPriorities === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl mb-2">🎉</div>
          <p className="text-sm text-muted-foreground">
            All caught up! No urgent priorities right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Priorities
          <Badge variant="secondary" className="text-xs">
            {totalPriorities}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {priorities
          .filter((p) => p.count > 0)
          .map((priority, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <priority.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{priority.label}</span>
              </div>
              <Badge className={priority.color}>{priority.count}</Badge>
            </div>
          ))}
      </CardContent>
    </Card>
  );
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
        href: "/analytics",
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
                <Card className="text-center cursor-pointer hover:shadow-md transition-all active:scale-95">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-2">
                      <metric.icon className="h-5 w-5 text-muted-foreground" />
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
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentView ? "bg-primary" : "bg-muted"
              }`}
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
      color: "text-green-600",
    });
  }

  if (analytics.mostCommonRefinement) {
    insights.push({
      type: "growth",
      title: "Growth Focus",
      value: analytics.mostCommonRefinement.indicatorName,
      count: analytics.mostCommonRefinement.count,
      icon: Target,
      color: "text-amber-600",
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`p-1.5 rounded-full bg-muted ${insight.color}`}>
              <insight.icon className="h-3 w-3" />
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

export default function CoachDashboardPage() {
  const { user } = useUser();
  const analytics = useQuery(api.analytics.getCoachAnalytics);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!analytics) {
    return (
      <div className="py-3 md:py-4 space-y-4">
        {/* Mobile-first loading skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Quick actions skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>

        {/* Priority card skeleton */}
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="py-3 md:py-4 space-y-4">
      {/* Welcome Header - Simplified for mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-2"
      >
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
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

      {/* Quick Actions - Mobile-first design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        <QuickActionCard
          title="Start Walkthrough"
          icon={Plus}
          href="/walkthrough/new"
          variant="primary"
        />

        <TeacherInvitationForm
          trigger={
            <div className="w-full">
              <QuickActionCard
                title="Invite Teacher"
                icon={UserPlus}
                action={() => {}}
              />
            </div>
          }
        />

        <QuickActionCard
          title="View Analytics"
          icon={BarChart3}
          href="/analytics"
        />
      </motion.div>

      {/* Metrics Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MetricsOverview analytics={analytics} />
      </motion.div>

      {/* Priorities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <PriorityCard analytics={analytics} />
      </motion.div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <TopInsights analytics={analytics} />
      </motion.div>

      {/* Recent Activity - Progressive disclosure for mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="space-y-3"
      >
        <Card>
          <CardHeader
            className="pb-3 cursor-pointer"
            onClick={() =>
              setExpandedSection(
                expandedSection === "activity" ? null : "activity",
              )
            }
          >
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Recent Activity
                {analytics.recentActivity.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {analytics.recentActivity.length}
                  </Badge>
                )}
              </div>
              <motion.div
                animate={{
                  rotate: expandedSection === "activity" ? 90 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </CardTitle>
          </CardHeader>

          {expandedSection === "activity" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0">
                <RecentActivityFeed
                  activities={analytics.recentActivity.slice(0, 5)}
                />
                {analytics.recentActivity.length > 5 && (
                  <div className="mt-3 text-center">
                    <Link href="/analytics">
                      <Button variant="ghost" size="sm">
                        View All Activity
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Desktop view - Additional cards shown on larger screens */}
      <div className="hidden lg:block">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"
        >
          {/* Additional desktop-specific cards would go here */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Teaching Excellence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-sm text-muted-foreground">
                  Track teacher growth patterns and celebrate successes
                </p>
                <Link href="/teachers">
                  <Button variant="outline" size="sm" className="mt-3">
                    View Teachers
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
