import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Crown, AlertTriangle, ArrowRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePlanDetection } from "@/lib/usePlanDetection";

export interface AIUsage {
  walkthroughsUsed: number;
  walkthroughsLimit: number;
  walkthroughsRemaining: number;
  isOverLimit: boolean;
  plan: string;
  // Add any other fields as needed
}

export interface TeacherUsage {
  teacherCount: number;
  teacherLimit: number;
  teachersRemaining: number;
  isOverLimit: boolean;
  plan: string;
}

interface AIUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
  aiUsage?: AIUsage;
  hasProPlan?: boolean;
  hasStarterPlan?: boolean;
}

interface TeacherUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
  teacherUsage?: TeacherUsage;
  hasProPlan?: boolean;
  hasStarterPlan?: boolean;
}

export function TeacherUsageBadge({
  className,
  showDetails = false,
  teacherUsage: propTeacherUsage,
  hasProPlan: propHasProPlan,
  hasStarterPlan: propHasStarterPlan,
}: TeacherUsageBadgeProps) {
  // Always call hooks at the top
  const planDetection = usePlanDetection();
  const fallbackHasProPlan = planDetection.isProPlan;
  const fallbackHasStarterPlan = planDetection.isStarterPlan;
  const hasProPlan =
    propHasProPlan !== undefined ? propHasProPlan : fallbackHasProPlan;
  const hasStarterPlan =
    propHasStarterPlan !== undefined
      ? propHasStarterPlan
      : fallbackHasStarterPlan;

  // CHECK USER ROLE FIRST - only query teacher usage for coaches
  const user = useQuery(api.users.current);
  const fallbackTeacherUsage = useQuery(
    api.plans.getTeacherUsage,
    user?.role === "coach" ? { hasProPlan, hasStarterPlan } : "skip",
  );

  const teacherUsage =
    propTeacherUsage !== undefined ? propTeacherUsage : fallbackTeacherUsage;

  // If user is not a coach, don't show teacher usage badge
  if (user && user.role !== "coach") {
    return null;
  }

  if (!teacherUsage) {
    return (
      <Badge variant="secondary" className={cn("animate-pulse", className)}>
        <Users className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  const { teacherCount, teacherLimit, teachersRemaining, isOverLimit } =
    teacherUsage;
  const isNearLimit = teachersRemaining <= 1 && teacherLimit > 1;

  // Determine plan name for display
  let planName = "Free";
  if (hasProPlan) planName = "Pro";
  else if (hasStarterPlan) planName = "Starter";

  return (
    <Badge
      variant={
        isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"
      }
      className={cn(
        "transition-colors",
        hasProPlan && "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        isNearLimit && !hasProPlan && "bg-orange-500 text-white",
        isOverLimit && "bg-red-500 text-white",
        className,
      )}
    >
      {hasProPlan && <Crown className="w-3 h-3 mr-1" />}
      {!hasProPlan && <Users className="w-3 h-3 mr-1" />}
      {showDetails
        ? `${planName} - ${teacherCount}/${teacherLimit} teachers`
        : `${teacherCount}/${teacherLimit} teachers`}
    </Badge>
  );
}

export function AIUsageBadge({
  className,
  showDetails = false,
  aiUsage: propAiUsage,
  hasProPlan: propHasProPlan,
  hasStarterPlan: propHasStarterPlan,
}: AIUsageBadgeProps) {
  // Always call hooks at the top
  const planDetection = usePlanDetection();
  const fallbackHasProPlan = planDetection.isProPlan;
  const fallbackHasStarterPlan = planDetection.isStarterPlan;
  const hasProPlan =
    propHasProPlan !== undefined ? propHasProPlan : fallbackHasProPlan;
  const hasStarterPlan =
    propHasStarterPlan !== undefined
      ? propHasStarterPlan
      : fallbackHasStarterPlan;

  // CHECK USER ROLE FIRST - only query AI usage for coaches
  const user = useQuery(api.users.current);
  const fallbackAiUsage = useQuery(
    api.plans.getAIUsageThisMonth,
    user?.role === "coach" ? { hasProPlan, hasStarterPlan } : "skip",
  );

  const aiUsage = propAiUsage !== undefined ? propAiUsage : fallbackAiUsage;

  // If user is not a coach, don't show AI usage badge
  if (user && user.role !== "coach") {
    return null;
  }

  if (!aiUsage) {
    return (
      <Badge variant="secondary" className={cn("animate-pulse", className)}>
        <Zap className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  const {
    walkthroughsUsed,
    walkthroughsLimit,
    walkthroughsRemaining,
    isOverLimit,
  } = aiUsage;
  const isNearLimit = walkthroughsRemaining <= 1 && walkthroughsLimit > 1;

  // Determine plan name for display
  let planName = "Free";
  if (hasProPlan) planName = "Pro";
  else if (hasStarterPlan) planName = "Starter";

  return (
    <Badge
      variant={
        isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"
      }
      className={cn(
        "transition-colors",
        hasProPlan && "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        isNearLimit && !hasProPlan && "bg-orange-500 text-white",
        isOverLimit && "bg-red-500 text-white",
        className,
      )}
    >
      {hasProPlan && <Crown className="w-3 h-3 mr-1" />}
      {!hasProPlan && <Zap className="w-3 h-3 mr-1" />}
      {showDetails
        ? `${planName} - ${walkthroughsUsed}/${walkthroughsLimit} walkthroughs`
        : `${walkthroughsUsed}/${walkthroughsLimit} walkthroughs`}
    </Badge>
  );
}

function CombinedUsageWarning() {
  const planDetection = usePlanDetection();
  const hasProPlan = planDetection.isProPlan;
  const hasStarterPlan = planDetection.isStarterPlan;

  // CHECK USER ROLE FIRST - only show warning to coaches
  const user = useQuery(api.users.current);
  const aiUsage = useQuery(
    api.plans.getAIUsageThisMonth,
    user?.role === "coach" ? { hasProPlan, hasStarterPlan } : "skip",
  );
  const teacherUsage = useQuery(
    api.plans.getTeacherUsage,
    user?.role === "coach" ? { hasProPlan, hasStarterPlan } : "skip",
  );

  // Don't show warning to non-coaches or Pro users
  if (!user || user.role !== "coach" || hasProPlan) {
    return null;
  }

  if (!aiUsage || !teacherUsage) {
    return null;
  }

  const {
    walkthroughsRemaining,
    walkthroughsLimit,
    isOverLimit: aiOverLimit,
  } = aiUsage;
  const {
    teachersRemaining,
    teacherLimit,
    isOverLimit: teacherOverLimit,
    teacherCount,
  } = teacherUsage;
  const planName = hasStarterPlan ? "Coach Starter" : "Coach Free";

  // Show warning when close to limit or over limit for either usage type
  const showWalkthroughWarning = walkthroughsRemaining <= 1 || aiOverLimit;
  const showTeacherWarning = teachersRemaining <= 0 || teacherOverLimit;

  if (!showWalkthroughWarning && !showTeacherWarning) {
    return null;
  }

  const isOverLimit = aiOverLimit || teacherOverLimit;

  return (
    <div
      className={cn(
        "mb-4 flex items-center justify-between p-3 rounded-lg border",
        isOverLimit
          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
          : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20",
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle
          className={cn(
            "h-4 w-4 flex-shrink-0",
            isOverLimit ? "text-red-600" : "text-orange-600",
          )}
        />
        <div className="text-sm">
          {showWalkthroughWarning && showTeacherWarning ? (
            <>
              <span className="font-medium">Usage limits reached:</span>{" "}
              {walkthroughsRemaining} walkthroughs and {teachersRemaining}{" "}
              teacher slots remaining on {planName}.
            </>
          ) : showWalkthroughWarning ? (
            <>
              {aiOverLimit ? (
                <>
                  <span className="font-medium">
                    Walkthrough limit reached:
                  </span>{" "}
                  {walkthroughsLimit} walkthroughs used on {planName}.
                </>
              ) : (
                <>
                  <span className="font-medium">
                    Few walkthroughs remaining:
                  </span>{" "}
                  {walkthroughsRemaining} left this month on {planName}.
                </>
              )}
            </>
          ) : (
            <>
              <span className="font-medium">Teacher limit reached:</span>{" "}
              {teacherCount}/{teacherLimit} teachers on {planName}.
            </>
          )}
          {hasStarterPlan
            ? " Upgrade to Pro for 50 walkthroughs/month and 15 teachers."
            : " Upgrade for more walkthroughs and teachers."}
        </div>
      </div>
      <Link href="/billing">
        <Button size="sm" variant="outline" className="ml-4 flex-shrink-0">
          Upgrade
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

export function AIUsageWarning() {
  return <CombinedUsageWarning />;
}
