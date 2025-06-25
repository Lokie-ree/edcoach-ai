import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Crown, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AIUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export function AIUsageBadge({ className, showDetails = false }: AIUsageBadgeProps) {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth);
  const currentPlan = useQuery(api.plans.getCurrentPlan);

  if (!aiUsage || !currentPlan) {
    return (
      <Badge variant="secondary" className={cn("animate-pulse", className)}>
        <Zap className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  const { walkthroughsUsed, walkthroughsLimit, walkthroughsRemaining, plan, isOverLimit } = aiUsage;
  const isPro = plan === "coach_pro";
  const isNearLimit = walkthroughsRemaining <= 2 && !isPro;

  return (
    <Badge 
      variant={isPro ? "default" : isOverLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
      className={cn(
        "transition-colors",
        isPro && "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        isNearLimit && !isPro && "bg-orange-500 text-white",
        isOverLimit && !isPro && "bg-red-500 text-white",
        className
      )}
    >
      {isPro ? (
        <>
          <Crown className="w-3 h-3 mr-1" />
          {showDetails ? `Pro - ${walkthroughsUsed}/${walkthroughsLimit} walkthroughs` : "Pro"}
        </>
      ) : (
        <>
          <Zap className="w-3 h-3 mr-1" />
          {showDetails 
            ? `${walkthroughsUsed}/${walkthroughsLimit} walkthroughs` 
            : `${walkthroughsRemaining} left`
          }
        </>
      )}
    </Badge>
  );
}

export function AIUsageWarning() {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth);
  const currentPlan = useQuery(api.plans.getCurrentPlan);

  if (!aiUsage || !currentPlan || aiUsage.plan === "coach_pro") {
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
                    <strong>Walkthrough Limit Reached:</strong> You've completed all {walkthroughsLimit} walkthroughs on the Coach Starter plan this month.
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