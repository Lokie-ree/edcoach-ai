"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/common/PageHeader";
import { useUser } from "@clerk/nextjs";
import { usePlanDetection } from "@/hooks/usePlanDetection";
import { OverviewMetrics } from "./components/OverviewMetrics";
import { QuickInsights } from "./components/QuickInsights";
import { DomainPerformanceChart } from "./components/DomainPerformanceChart";
import { TeacherProgressHeatmap } from "./components/TeacherProgressHeatmap";
import { UpgradePrompt } from "./components/UpgradePrompt";


export default function AnalyticsDashboardPage() {
  const { user, isLoaded } = useUser();
  const planDetection = usePlanDetection();
  
  // Get plan features to check for advanced analytics
  const planFeatures = useQuery(api.plans.getPlanFeatures, { 
    hasProPlan: planDetection.isProPlan 
  });
  
  // Get convex user data
  const convexUser = useQuery(
    api.users.current,
    user && isLoaded ? {} : "skip"
  );
  
  // Get comprehensive analytics data for coach
  const analytics = useQuery(
    api.analytics.getComprehensiveCoachAnalytics,
    convexUser?.role === "coach" ? {} : "skip"
  );

  if (!isLoaded || (user && convexUser === undefined) || planDetection.isLoading || !planFeatures) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block"></span>
      </div>
    );
  }

  if (!user || !convexUser) {
    return null;
  }

  if (convexUser?.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Only coaches can view analytics.
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-4">
      {/* Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights and metrics for your coaching effectiveness"
        gradient={true}
      />

      {/* Overview Metrics - Always shown */}
      <OverviewMetrics analytics={analytics} />

      {/* Tiered Analytics Based on Plan */}
      {planFeatures.advancedAnalytics ? (
        // Pro Plan: Advanced Analytics
        <>
          <DomainPerformanceChart analytics={analytics} />
          <TeacherProgressHeatmap analytics={analytics} />
        </>
      ) : (
        // Basic Plan: Quick Insights + Upgrade Prompt
        <>
          <QuickInsights analytics={analytics} />
          <UpgradePrompt feature="Advanced Analytics" />
        </>
      )}
    </div>
  );
} 