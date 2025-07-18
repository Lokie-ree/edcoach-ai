"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/common/PageHeader";
import StrengthsCard from "./components/StrengthsCard";
import GrowthAreasCard from "./components/GrowthAreasCard";
import RecentReinforcements from "./components/RecentReinforcements";
import CoachConnectionCard from "./components/CoachConnectionCard";


export default function MyProgressPage() {
  const { user, isLoaded } = useUser();
  const data = useQuery(api.walkthroughs.getMyProgress, {});

  if (!isLoaded || (user && data === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !data) {
    return null;
  }

  return (
    <div className="py-4 md:py-6 space-y-6">
      <PageHeader
        title="My Progress"
        description="Track your professional growth and development over time"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <StrengthsCard strengths={data.strengths} />
        <GrowthAreasCard growthAreas={data.growthAreas} />
      </div>
      <RecentReinforcements recentReinforcements={data.recentReinforcements} />
      <CoachConnectionCard coach={data.coach} coachingStats={data.coachingStats} />
    </div>
  );
} 