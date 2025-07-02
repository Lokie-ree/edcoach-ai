import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePlanDetection } from "@/lib/usePlanDetection";
import { useMemo } from "react";

/**
 * Hook to check if the current coach can create a walkthrough based on plan and usage.
 * Returns { allowed: boolean, reason?: string }
 */
export function useCanCreateWalkthrough() {
  const planDetection = usePlanDetection();
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: planDetection.isProPlan });

  // If loading, allow by default (UI should show spinner)
  if (!aiUsage) return { allowed: true, reason: undefined };

  const allowed = !aiUsage.isOverLimit;
  const reason = allowed ? undefined :
    `You have reached your monthly walkthrough limit (${aiUsage.walkthroughsLimit}). Upgrade to Coach Pro for more.`;

  return { allowed, reason };
}

/**
 * Hook to check if the current coach can invite another teacher based on plan and teacher count.
 * Returns { allowed: boolean, reason?: string }
 * @param currentTeacherCount - number of teachers currently managed by the coach
 */
export function useCanInviteTeacher(currentTeacherCount: number) {
  const planDetection = usePlanDetection();
  const plan = planDetection.isProPlan ? "coach_pro" : "coach_starter";
  const maxTeachers = plan === "coach_pro" ? 25 : 5;

  const allowed = currentTeacherCount < maxTeachers;
  const reason = allowed ? undefined :
    `You have reached your teacher limit (${maxTeachers}) for the ${planDetection.isProPlan ? "Coach Pro" : "Starter"} plan. Upgrade to Coach Pro for more.`;

  return { allowed, reason };
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can create a walkthrough based on plan and usage
 */
export function canCreateWalkthroughBackend({ plan, walkthroughsUsed }: { plan: "coach_pro" | "coach_starter"; walkthroughsUsed: number }) {
  const max = plan === "coach_pro" ? 100 : 15;
  return walkthroughsUsed < max;
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can invite a teacher based on plan and teacher count
 */
export function canInviteTeacherBackend({ plan, teacherCount }: { plan: "coach_pro" | "coach_starter"; teacherCount: number }) {
  const max = plan === "coach_pro" ? 25 : 5;
  return teacherCount < max;
} 