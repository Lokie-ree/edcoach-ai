import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Crown, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePlanDetection } from "@/lib/usePlanDetection";

export interface AIUsage {
  walkthroughsUsed: number;
  walkthroughsLimit: number;
  walkthroughsRemaining: number;
  isOverLimit: boolean;
  // Add any other fields as needed
}

interface AIUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
  aiUsage?: AIUsage;
  hasProPlan?: boolean;
}

export function AIUsageBadge({ className, showDetails = false, aiUsage: propAiUsage, hasProPlan: propHasProPlan }: AIUsageBadgeProps) {
  // Always call hooks at the top
  const planDetection = usePlanDetection();
  const fallbackHasProPlan = planDetection.isProPlan;
  const hasProPlan = propHasProPlan !== undefined ? propHasProPlan : fallbackHasProPlan;
  
  // CHECK USER ROLE FIRST - only query AI usage for coaches
  const user = useQuery(api.users.current);
  const fallbackAiUsage = useQuery(
    api.plans.getAIUsageThisMonth, 
    user?.role === "coach" ? { hasProPlan } : "skip"
  );
  
  const aiUsage = propAiUsage !== undefined ? propAiUsage : fallbackAiUsage;

  // If user is not a coach, don't show AI usage badge
  if (user && user.role !== "coach") {
    return null;
  }

  if (hasProPlan) {
    // Pro badge
    if (!aiUsage) {
      return (
        <Badge variant="secondary" className={cn("animate-pulse", className)}>
          <Zap className="w-3 h-3 mr-1" />
          Loading...
        </Badge>
      );
    }
    const { walkthroughsUsed, walkthroughsLimit } = aiUsage;
    return (
      <Badge 
        variant="default"
        className={cn(
          "transition-colors bg-gradient-to-r from-purple-500 to-blue-500 text-white",
          className
        )}
      >
        <Crown className="w-3 h-3 mr-1" />
        {showDetails ? `Pro - ${walkthroughsUsed}/${walkthroughsLimit} walkthroughs` : "Pro"}
      </Badge>
    );
  } else {
    // Starter badge
    if (!aiUsage) {
      return (
        <Badge variant="secondary" className={cn("animate-pulse", className)}>
          <Zap className="w-3 h-3 mr-1" />
          Loading...
        </Badge>
      );
    }
    const { walkthroughsUsed, walkthroughsLimit, walkthroughsRemaining, isOverLimit } = aiUsage;
    const isNearLimit = walkthroughsRemaining <= 2;
    return (
      <Badge 
        variant={isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
        className={cn(
          "transition-colors",
          isNearLimit && "bg-orange-500 text-white",
          isOverLimit && "bg-red-500 text-white",
          className
        )}
      >
        <Zap className="w-3 h-3 mr-1" />
        {showDetails 
          ? `${walkthroughsUsed}/${walkthroughsLimit} walkthroughs` 
          : `${walkthroughsRemaining} left`
        }
      </Badge>
    );
  }
}

function StarterUsageWarning() {
  // CHECK USER ROLE FIRST - only show warning to coaches
  const user = useQuery(api.users.current);
  const aiUsage = useQuery(
    api.plans.getAIUsageThisMonth, 
    user?.role === "coach" ? { hasProPlan: false } : "skip"
  );

  // Don't show warning to non-coaches
  if (!user || user.role !== "coach" || !aiUsage) {
    return null;
  }
  
  const { walkthroughsRemaining, walkthroughsLimit, isOverLimit } = aiUsage;
  
  // Show warning when close to limit or over limit
  if (walkthroughsRemaining <= 2 || isOverLimit) {
    return (
      <Card className={cn(
        "mb-6 border-l-4",
        isOverLimit ? "border-l-red-500 bg-red-50 dark:bg-red-950/20" : 
        "border-l-orange-500 bg-orange-50 dark:bg-orange-950/20"
      )}>
        <div className="flex items-start justify-between p-4">
          <div className="flex items-start">
            <AlertTriangle className={cn(
              "h-5 w-5 mt-0.5 mr-3",
              isOverLimit ? "text-red-600" : "text-orange-600"
            )} />
            <div>
              <CardDescription className="text-sm mb-3">
                {isOverLimit ? (
                  <>
                    <strong>Walkthrough Limit Reached:</strong> You&apos;ve completed all {walkthroughsLimit} walkthroughs on the Coach Starter plan this month.
                  </>
                ) : (
                  <>
                    <strong>Few Walkthroughs Remaining:</strong> You have {walkthroughsRemaining} walkthroughs remaining this month.
                  </>
                )}
              </CardDescription>
              <Link href="/billing">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  Upgrade to Coach Pro
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            Pro: 100 walkthroughs/month
          </div>
        </div>
      </Card>
    );
  }
  
  return null;
}

export function AIUsageWarning() {
  const planDetection = usePlanDetection();
  const hasProPlan = planDetection.isProPlan;
  
  // CHECK USER ROLE FIRST - only show warning to coaches
  const user = useQuery(api.users.current);
  
  if (!user || user.role !== "coach") {
    return null;
  }
  
  // Only show warning to non-Pro users
  if (!hasProPlan) {
    return <StarterUsageWarning />;
  }
  return null;
} 