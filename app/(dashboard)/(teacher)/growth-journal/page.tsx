"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/common/PageHeader";
import { RefinementFocusCard } from "@/components/dashboard/RefinementFocusCard";
import { ReflectionPromptCard } from "@/components/dashboard/ReflectionPromptCard";
import { WalkthroughTimeline } from "@/components/dashboard/WalkthroughTimeline";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherPgpDashboardPage() {
  const pgpData = useQuery(api.analytics.getMyPgpData);

  if (!pgpData) {
    return (
      <div className="py-4 md:py-6 space-y-6">
        <PageHeader
          title="My PGP"
          description="Track your Professional Growth Plan progress and development goals"
        />

        {/* PGP Goal Card Skeleton */}
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-2 w-1/2" />
        </div>

        {/* Refinement Focus Card Skeleton */}
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-2 w-full mb-4" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        {/* Reflection Prompt Card Skeleton */}
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Walkthrough Timeline Skeleton */}
        <div className="p-6 border rounded-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-6 space-y-6">
      <PageHeader
        title="My PGP"
        description="Track your Professional Growth Plan progress and development goals"
      />

      {/* PGP Goal Card - Note: This component now requires teacher-specific props */}
      {/* For teacher view, we'll show a simplified version or create a separate component */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">{pgpData.pgpGoal.title}</h3>
        <p className="text-muted-foreground mb-4">{pgpData.pgpGoal.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <span className="font-medium">{pgpData.pgpGoal.progress}%</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${
            pgpData.pgpGoal.trend === "Engaged" ? "bg-green-100 text-green-800" :
            pgpData.pgpGoal.trend === "Needs Support" ? "bg-red-100 text-red-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {pgpData.pgpGoal.trend}
          </span>
        </div>
      </div>

      {/* Refinement Focus Card */}
      <RefinementFocusCard
        currentIndicator={pgpData.refinementFocus.currentIndicator}
        description={pgpData.refinementFocus.description}
        progress={pgpData.refinementFocus.progress}
        nextSteps={pgpData.refinementFocus.nextSteps}
      />

      {/* Reflection Prompt Card */}
      <ReflectionPromptCard
        question={pgpData.reflectionPrompt.question}
        lastAnswered={pgpData.reflectionPrompt.lastAnswered || null}
        isOverdue={pgpData.reflectionPrompt.isOverdue}
      />

      {/* Walkthrough Timeline */}
      <WalkthroughTimeline walkthroughs={pgpData.recentWalkthroughs} />
    </div>
  );
}
