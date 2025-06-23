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

  const { canGenerate, usageThisMonth, limit } = usageInfo;
  const isPro = true; // Simplified - no subscription restrictions for now
  const isNearLimit = false; // No limits for now

  // Always show as available now
  // if (subscriptionPlan === "none") {
  //   return (
  //     <Badge variant="outline" className={cn("text-muted-foreground", className)}>
  //       <Zap className="w-3 h-3 mr-1" />
  //       Not available
  //     </Badge>
  //   );
  // }

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

  if (!usageInfo) {
    return null;
  }
  
  // No warnings needed with simplified system
  return null;
} 