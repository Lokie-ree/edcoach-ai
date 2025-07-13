import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { usePlanDetection } from "./usePlanDetection";

/**
 * Hook to check if the current coach can create a walkthrough based on plan and usage.
 * Returns { allowed: boolean, reason?: string }
 */
export function useCanCreateWalkthrough() {
  const user = useQuery(api.users.current);
  const planDetection = usePlanDetection();

  // Use the walkthrough usage query from plans module with proper plan detection
  const walkthroughUsage = useQuery(
    api.plans.getAIUsageThisMonth,
    user && user.role === "coach" && !planDetection.isLoading
      ? {
          hasProPlan: planDetection.isProPlan,
          hasStarterPlan: planDetection.isStarterPlan,
        }
      : "skip",
  );

  if (!user || planDetection.isLoading) return { allowed: true };

  if (user.role !== "coach") {
    return { allowed: false, reason: "Only coaches can create walkthroughs" };
  }

  if (!walkthroughUsage) return { allowed: true };

  const allowed = !walkthroughUsage.isOverLimit;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Walkthrough limit reached (${walkthroughUsage.walkthroughsLimit})`,
  };
}

/**
 * Hook to check if the current coach can invite another teacher based on plan and teacher count.
 * Uses the proper plan detection and teacher usage query for accurate limits.
 * Returns { allowed: boolean, reason?: string, teacherUsage?: object }
 */
export function useCanInviteTeacher() {
  const user = useQuery(api.users.current);
  const planDetection = usePlanDetection();

  // Use the teacher usage query from plans module with proper plan detection
  const teacherUsage = useQuery(
    api.plans.getTeacherUsage,
    user && user.role === "coach" && !planDetection.isLoading
      ? {
          hasProPlan: planDetection.isProPlan,
          hasStarterPlan: planDetection.isStarterPlan,
        }
      : "skip",
  );

  if (!user || planDetection.isLoading) return { allowed: true };

  if (user.role !== "coach") {
    return { allowed: false, reason: "Only coaches can invite teachers" };
  }

  if (!teacherUsage) return { allowed: true };

  const allowed = !teacherUsage.isOverLimit;

  return {
    allowed,
    reason: allowed
      ? undefined
      : `Teacher limit reached (${teacherUsage.teacherLimit})`,
    teacherUsage: {
      teacherCount: teacherUsage.teacherCount,
      teacherLimit: teacherUsage.teacherLimit,
      teachersRemaining: teacherUsage.teachersRemaining,
      isOverLimit: teacherUsage.isOverLimit,
      plan: teacherUsage.plan,
    },
  };
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can create a walkthrough based on plan and usage
 */
export function canCreateWalkthroughBackend({
  plan,
  walkthroughsUsed,
}: {
  plan: "free" | "coach_starter" | "coach_pro";
  walkthroughsUsed: number;
}) {
  // Use the same limits from PLAN_CONFIG
  const max = plan === "coach_pro" ? 50 : plan === "coach_starter" ? 15 : 3; // Pro: 50, Starter: 15, Free: 3 walkthroughs
  return walkthroughsUsed < max;
}

/**
 * Utility function for backend enforcement (Convex actions/mutations)
 * Checks if a coach can invite a teacher based on plan and teacher count
 */
export function canInviteTeacherBackend({
  plan,
  teacherCount,
}: {
  plan: "free" | "coach_starter" | "coach_pro";
  teacherCount: number;
}) {
  // Use the same limits from PLAN_CONFIG
  const max = plan === "coach_pro" ? 15 : plan === "coach_starter" ? 5 : 1; // Pro: 15, Starter: 5, Free: 1 teacher
  return teacherCount < max;
}
