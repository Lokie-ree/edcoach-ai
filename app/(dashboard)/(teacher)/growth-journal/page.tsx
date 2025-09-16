"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PageHeader } from "@/components/common/PageHeader";
import { TeacherPgpGoalCard } from "@/app/(dashboard)/(teacher)/growth-journal/components/TeacherPgpGoalCard";
import { RefinementFocusCard } from "@/app/(dashboard)/(teacher)/growth-journal/components/RefinementFocusCard";
import { ReflectionPromptCard } from "@/app/(dashboard)/(teacher)/growth-journal/components/ReflectionPromptCard";
import { WalkthroughTimeline } from "@/app/(dashboard)/(teacher)/growth-journal/components/WalkthroughTimeline";
import { Skeleton } from "@/components/ui/skeleton";
import { Container } from "@/components/ui/container";

export default function TeacherPgpDashboardPage() {
  const pgpData = useQuery(api.analytics.getMyPgpData);

  if (!pgpData) {
    return (
      <div className="py-4 md:py-6">
        <PageHeader
          title="My Growth Journal"
          description="Your personal space for professional development and reflection"
        />
        
        <Container size="md" className="space-y-6 mt-6">
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
        </Container>
      </div>
    );
  }

  if (!pgpData) {
    return null; // This should not happen since we already checked above
  }

  return (
    <div className="py-4 md:py-6">
      <PageHeader
        title="My Growth Journal"
        description="Your personal space for professional development and reflection"
      />
      
      {/* Single-column layout that tells a story (Documented Design) */}
      <Container size="md" className="space-y-6 mt-6">
        
        {/* 1. PgpGoalCard (The Why) - Always at the top, framing the entire experience */}
        <TeacherPgpGoalCard pgpGoal={{
          ...pgpData.pgpGoal,
          targetDate: pgpData.pgpGoal.targetDate ? new Date(pgpData.pgpGoal.targetDate).toLocaleDateString() : undefined
        }} />

        {/* 2. RefinementFocusCard (The What) - Shows the skill they've been working on most recently */}
        <RefinementFocusCard
          currentIndicator={pgpData.refinementFocus.currentIndicator}
          description={pgpData.refinementFocus.description}
          progress={pgpData.refinementFocus.progress.current}
          nextSteps={pgpData.refinementFocus.nextSteps}
        />

        {/* 3. ReflectionPromptCard (The Now) - The prompt to reflect on their latest feedback */}
        <ReflectionPromptCard
          question={pgpData.reflectionPrompt.question}
          lastAnswered={pgpData.reflectionPrompt.lastAnswered || null}
          isOverdue={pgpData.reflectionPrompt.isOverdue}
        />

        {/* 4. WalkthroughTimeline (The How Far) - Visual history showing their journey over time */}
        <WalkthroughTimeline walkthroughs={pgpData.recentWalkthroughs} />
      </Container>
    </div>
  );
}
