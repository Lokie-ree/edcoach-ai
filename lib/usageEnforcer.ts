import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePlanDetection } from "@/lib/usePlanDetection";

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
 * Uses the new teacher usage query for accurate limits.
 * Returns { allowed: boolean, reason?: string, teacherUsage?: object }
 */
export function useCanInviteTeacher() {
  const planDetection = usePlanDetection();
  const teacherUsage = useQuery(api.plans.getTeacherUsage, { hasProPlan: planDetection.isProPlan });

  // If loading, allow by default (UI should show spinner)
  if (!teacherUsage) return { allowed: true, reason: undefined };

  const allowed = !teacherUsage.isOverLimit;
  const reason = allowed ? undefined :
    `You have reached your teacher limit (${teacherUsage.teacherLimit}) for the ${planDetection.isProPlan ? "Coach Pro" : "Coach Starter"} plan. Upgrade to Coach Pro for more.`;

  return { allowed, reason, teacherUsage };
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can create a walkthrough based on plan and usage
 */
export function canCreateWalkthroughBackend({ plan, walkthroughsUsed }: { plan: "coach_pro" | "coach_starter"; walkthroughsUsed: number }) {
  // Use the same limits from PLAN_CONFIG
  const max = plan === "coach_pro" ? 50 : 10; // 100/50 AI generations = 50/10 walkthroughs
  return walkthroughsUsed < max;
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can invite a teacher based on plan and teacher count
 */
export function canInviteTeacherBackend({ plan, teacherCount }: { plan: "coach_pro" | "coach_starter"; teacherCount: number }) {
  // Use the same limits from PLAN_CONFIG
  const max = plan === "coach_pro" ? 15 : 3;
  return teacherCount < max;
} 