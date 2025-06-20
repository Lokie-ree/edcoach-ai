import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIUsageBadgeProps {
  className?: string;
  showDetails?: boolean;
}

export function AIUsageBadge({ className, showDetails = false }: AIUsageBadgeProps) {
  const usageInfo = useQuery(api.users.checkAIUsageLimit);

  if (!usageInfo) {
    return (
      <Badge variant="secondary" className={cn("animate-pulse", className)}>
        <Zap className="w-3 h-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  const { canGenerate, usageThisMonth, limit, subscriptionPlan } = usageInfo;
  const isPro = subscriptionPlan === "pro";
  const isNearLimit = !isPro && usageThisMonth >= limit * 0.8; // 80% of limit

  if (subscriptionPlan === "none") {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        <Zap className="w-3 h-3 mr-1" />
        Not available
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isPro ? "default" : canGenerate ? "secondary" : "destructive"}
      className={cn(
        "transition-colors",
        isPro && "bg-gradient-to-r from-purple-500 to-blue-500 text-white",
        isNearLimit && !isPro && "bg-orange-500 text-white",
        !canGenerate && !isPro && "bg-red-500 text-white",
        className
      )}
    >
      {isPro ? (
        <>
          <Crown className="w-3 h-3 mr-1" />
          {showDetails ? "Pro - Unlimited AI" : "Pro"}
        </>
      ) : (
        <>
          <Zap className="w-3 h-3 mr-1" />
          {showDetails 
            ? `${usageThisMonth}/${limit} AI generations` 
            : `${usageThisMonth}/${limit}`
          }
        </>
      )}
    </Badge>
  );
}

export function AIUsageWarning() {
  const usageInfo = useQuery(api.users.checkAIUsageLimit);

  if (!usageInfo || usageInfo.subscriptionPlan === "pro") {
    return null;
  }

  const { canGenerate, usageThisMonth, limit } = usageInfo;
  const isNearLimit = usageThisMonth >= limit * 0.8; // 80% of limit

  if (!isNearLimit && canGenerate) {
    return null;
  }

  return (
    <div className={cn(
      "rounded-lg p-3 mb-4 border",
      !canGenerate 
        ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
        : "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200"
    )}>
      <div className="flex items-start gap-2">
        <Zap className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          {!canGenerate ? (
            <>
              <strong>AI Generation Limit Reached</strong>
              <p className="mt-1">
                You&apos;ve used all {limit} AI generations for this month. 
                Upgrade to Pro for unlimited AI generations and advanced features.
              </p>
            </>
          ) : (
            <>
              <strong>AI Usage Warning</strong>
              <p className="mt-1">
                You&apos;ve used {usageThisMonth} of {limit} AI generations this month. 
                Consider upgrading to Pro for unlimited usage.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 