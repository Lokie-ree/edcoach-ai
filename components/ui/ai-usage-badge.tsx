import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Crown, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePlanDetection } from "@/lib/usePlanDetection";

interface AIUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
}

function ProUsageBadge({ className, showDetails }: AIUsageBadgeProps) {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: true });
  
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
}

function StarterUsageBadge({ className, showDetails }: AIUsageBadgeProps) {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: false });
  
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

// Use the comprehensive personal plan detection hook
function useProPlanDetection() {
  const planDetection = usePlanDetection();
  
  console.log("🔍 AI Usage Badge plan check:", { 
    isProPlan: planDetection.isProPlan,
    isStarterPlan: planDetection.isStarterPlan,
    planDetectionMethod: planDetection.planDetectionMethod,
    isLoading: planDetection.isLoading,
    finalPlan: planDetection.isProPlan ? "pro" : "starter_free"
  });
  
  return planDetection.isProPlan;
}

export function AIUsageBadge({ className, showDetails = false }: AIUsageBadgeProps) {
  const hasProPlan = useProPlanDetection();
  
  // Pro users get Pro badge, everyone else gets Starter (free) badge
  if (hasProPlan) {
    return <ProUsageBadge className={className} showDetails={showDetails} />;
  } else {
    return <StarterUsageBadge className={className} showDetails={showDetails} />;
  }
}

function StarterUsageWarning() {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: false });

  if (!aiUsage) {
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
  const hasProPlan = useProPlanDetection();
  
  // Only show warning to non-Pro users
  if (!hasProPlan) {
    return <StarterUsageWarning />;
  }
  
  return null;
} 