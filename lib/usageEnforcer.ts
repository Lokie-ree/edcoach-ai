import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";

/**
 * Hook to check if the current coach can create a walkthrough based on plan and usage.
 * Returns { allowed: boolean, reason?: string }
 */
export function useCanCreateWalkthrough() {
  const user = useQuery(api.users.current);
  
  if (!user) return { allowed: true };
  
  if (user.role !== "coach") {
    return { allowed: false, reason: "Only coaches can create walkthroughs" };
  }
  
  return { allowed: true };
}

/**
 * Hook to check if the current coach can invite another teacher based on plan and teacher count.
 * Uses the new teacher usage query for accurate limits.
 * Returns { allowed: boolean, reason?: string, teacherUsage?: object }
 */
export function useCanInviteTeacher() {
  const user = useQuery(api.users.current);
  const teachers = useQuery(api.teachers.list);
  
  if (!user || !teachers) return { allowed: true };
  
  if (user.role !== "coach") {
    return { allowed: false, reason: "Only coaches can invite teachers" };
  }
  
  // Simple limit check - 3 for free, 15 for pro
  const limit = 3;
  const allowed = teachers.length < limit;
  
  return { 
    allowed, 
    reason: allowed ? undefined : `Teacher limit reached (${limit})`,
    teacherUsage: {
      teacherCount: teachers.length,
      teacherLimit: limit,
      teachersRemaining: Math.max(0, limit - teachers.length),
      isOverLimit: teachers.length >= limit,
      plan: "coach_starter"
    }
  };
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