"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock } from "lucide-react";
import Link from "next/link";
import { usePlanDetection } from "@/hooks/usePlanDetection";

interface FeatureProtectProps {
  children: React.ReactNode;
  feature?: string;
  plan?: string;
  fallback?: React.ReactNode;
}

export function FeatureProtect({ children, feature, plan, fallback }: FeatureProtectProps) {
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
    if (plan === 'coach_pro' && planDetection.isProPlan) {
      return <>{children}</>;
    } else if (plan === 'coach_starter' && planDetection.isStarterPlan) {
      return <>{children}</>;
    } else {
      return fallback || <PlanUpgradePrompt plan={plan} />;
    }
  }

  return <>{children}</>;
}

function FeatureUpgradePrompt({ feature }: { feature: string }) {
  const featureNames: Record<string, string> = {
    'enhanced_analytics': 'Enhanced Analytics',
    'priority_support': 'Priority Support',
    'early_access': 'Early Access Features',
    'export_capabilities': 'Export Capabilities'
  };

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <Lock className="h-5 w-5" />
          {featureNames[feature] || 'Premium Feature'}
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          This feature requires Coach Pro subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/billing">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
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
    'coach_pro': 'Coach Pro',
    'coach_starter': 'Coach Starter'
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Lock className="h-5 w-5" />
          {planNames[plan] || 'Premium'} Required
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          This content requires a {planNames[plan] || 'premium'} subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/billing">
          <Button variant="outline" className="border-blue-500 text-blue-700 hover:bg-blue-100">
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 