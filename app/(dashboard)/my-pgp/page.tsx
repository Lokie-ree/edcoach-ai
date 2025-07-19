"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PgpGoalCard } from "@/components/dashboard/PgpGoalCard";
import { RefinementFocusCard } from "@/components/dashboard/RefinementFocusCard";
import { ReflectionPromptCard } from "@/components/dashboard/ReflectionPromptCard";
import { WalkthroughTimeline } from "@/components/dashboard/WalkthroughTimeline";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeacherPgpDashboardPage() {
  const pgpData = useQuery(api.analytics.getMyPgpData);

  if (!pgpData) {
    return (
      <div className="py-4 md:py-6 space-y-6 max-w-4xl">
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
    <div className="py-4 md:py-6 space-y-6 max-w-4xl">
      {/* PGP Goal Card */}
      <PgpGoalCard
        title={pgpData.pgpGoal.title}
        description={pgpData.pgpGoal.description}
        progress={pgpData.pgpGoal.progress}
        trend={pgpData.pgpGoal.trend}
        targetDate={pgpData.pgpGoal.targetDate || ""}
      />

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