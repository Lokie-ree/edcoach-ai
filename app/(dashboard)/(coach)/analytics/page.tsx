"use client";

// Force dynamic rendering to avoid prerendering issues with Clerk hooks
export const dynamic = 'force-dynamic';

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
  const { isLoaded } = useUser();
  const planDetection = usePlanDetection();

  // Get plan features to check for advanced analytics
  const planFeatures = useQuery(api.plans.getPlanFeatures, {
    hasProPlan: planDetection.isProPlan,
  });

  // Get comprehensive analytics data for coach
  const analytics = useQuery(api.analytics.getComprehensiveCoachAnalytics, {});

  if (!isLoaded || planDetection.isLoading || !planFeatures || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full inline-block"></span>
      </div>
    );
  }

  return (
    <div className="py-3 md:py-4 space-y-3">
      {/* Header */}
      <PageHeader
        title="Analytics Dashboard"
        description="Comprehensive insights and metrics for your coaching effectiveness"
        gradient={true}
      />
      {/* Overview Metrics - Always shown */}
      <OverviewMetrics analytics={analytics} />
      {/* Tiered Analytics - Better space distribution */}
      {planFeatures.advancedAnalytics ? (
        <div className="grid gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-2">
          <DomainPerformanceChart analytics={analytics} />
          <TeacherProgressHeatmap analytics={analytics} />
        </div>
      ) : (
        <div className="grid gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <QuickInsights analytics={analytics} />
          </div>
          <div className="lg:col-span-3">
            <UpgradePrompt feature="Advanced Analytics" />
          </div>
        </div>
      )}
    </div>
  );
}
