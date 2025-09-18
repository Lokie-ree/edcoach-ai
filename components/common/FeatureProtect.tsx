"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";
import { usePlanDetection } from "@/hooks/usePlanDetection";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface FeatureProtectProps {
  children: React.ReactNode;
  feature?: string;
  plan?: string;
  fallback?: React.ReactNode;
}

export function FeatureProtect({
  children,
  feature,
  plan,
  fallback,
}: FeatureProtectProps) {
  const planDetection = usePlanDetection();

  // For features, check if user has Pro plan (all features require Pro)
  if (feature) {
    if (planDetection.isProPlan) {
      return <>{children}</>;
    } else {
      return fallback || <FeatureUpgradePrompt feature={feature} />;
    }
  }

  // For plans, check personal billing plan
  if (plan) {
    if (plan === "coach_pro" && planDetection.isProPlan) {
      return <>{children}</>;
    } else if (plan === "coach_starter" && planDetection.isStarterPlan) {
      return <>{children}</>;
    } else {
      return fallback || <PlanUpgradePrompt plan={plan} />;
    }
  }

  return <>{children}</>;
}

function FeatureUpgradePrompt({ feature }: { feature: string }) {
  const featureNames: Record<string, string> = {
    enhanced_analytics: "Enhanced Analytics",
    priority_support: "Priority Support",
    early_access: "Early Access Features",
    export_capabilities: "Export Capabilities",
  };

  return (
    <Card className={cn(STATUS_COLORS.warning.bg, STATUS_COLORS.warning.border, "border")}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", STATUS_COLORS.warning.text)}>
          <Lock className="h-5 w-5" />
          {featureNames[feature] || "Premium Feature"}
        </CardTitle>
        <CardDescription className={STATUS_COLORS.warning.text}>
          This feature requires Coach Pro subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/settings/billing">
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Coach Pro
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function PlanUpgradePrompt({ plan }: { plan: string }) {
  const planNames: Record<string, string> = {
    coach_pro: "Coach Pro",
    coach_starter: "Coach Starter",
  };

  return (
    <Card className={cn("border", STATUS_COLORS.info.bg, STATUS_COLORS.info.border)}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", STATUS_COLORS.info.text)}>
          <Lock className="h-5 w-5" />
          {planNames[plan] || "Premium"} Required
        </CardTitle>
        <CardDescription className={cn(STATUS_COLORS.info.text)}>
          This content requires a {planNames[plan] || "premium"} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/settings/billing">
          <Button
            variant="outline"
            className={cn("border-primary text-primary hover:bg-primary/10")}
          >
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
