"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles } from "lucide-react";
import {
  AIUsageBadge,
  TeacherUsageBadge,
} from "@/components/ui/AiUsageBadge";
import QuickActionsPanel from "@/app/(auth)/dashboard/components/QuickActionsPanel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { AIUsage } from "@/components/ui/AiUsageBadge";
import { usePlanDetection } from "@/hooks/usePlanDetection";

interface CoachDashboardHeaderStatsProps {
  aiUsage?: AIUsage | undefined;
  hasProPlan?: boolean;
  hasStarterPlan?: boolean;
}

export default function CoachDashboardHeaderStats({
  aiUsage,
  hasProPlan,
  hasStarterPlan,
}: CoachDashboardHeaderStatsProps) {
  // UPDATED: Use coach-based analytics instead of organization-based
  const analytics = useQuery(api.analytics.getCoachAnalytics);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  // Use plan detection if props are not provided
  const planDetection = usePlanDetection();
  const finalHasProPlan =
    hasProPlan !== undefined ? hasProPlan : planDetection.isProPlan;
  const finalHasStarterPlan =
    hasStarterPlan !== undefined ? hasStarterPlan : planDetection.isStarterPlan;

  if (!analytics) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full items-stretch md:items-center">
      {/* Quick Actions Button - full width and above badges on mobile */}
      <div className="order-1 md:order-3 w-full md:w-auto flex justify-end md:ml-2">
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90 transition w-full md:w-auto justify-center"
          onClick={() => setQuickActionsOpen(true)}
        >
          <Sparkles className="h-4 w-4" />
          Quick Actions
        </button>
        <Dialog open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
          <DialogContent className="max-w-lg w-full p-0 bg-transparent border-none shadow-none">
            <DialogTitle>
              <span className="sr-only">Quick Actions</span>
            </DialogTitle>
            <QuickActionsPanel />
          </DialogContent>
        </Dialog>
      </div>
      {/* Usage Badges */}
      <div className="order-2 md:order-2 flex flex-col items-stretch md:items-end gap-2 w-full md:min-w-[200px]">
        <div className="flex gap-2 flex-wrap justify-end">
          <TeacherUsageBadge
            showDetails
            hasProPlan={finalHasProPlan}
            hasStarterPlan={finalHasStarterPlan}
          />
          <AIUsageBadge
            showDetails
            aiUsage={aiUsage}
            hasProPlan={finalHasProPlan}
            hasStarterPlan={finalHasStarterPlan}
          />
        </div>
      </div>
    </div>
  );
}
