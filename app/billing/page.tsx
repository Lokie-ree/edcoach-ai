"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Crown, Zap } from "lucide-react";

export default function BillingPage() {
  const currentPlan = useQuery(api.plans.getCurrentPlan);
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth);

  if (!currentPlan || !aiUsage) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing & Plans"
          description="Manage your subscription and upgrade options"
          gradient={true}
        />
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const isCurrentlyStarter = currentPlan.plan === "coach_starter";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plans"
        description="Choose the plan that fits your coaching needs"
        gradient={true}
      />

      {/* Current Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your activity this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{aiUsage.walkthroughsUsed}</div>
              <div className="text-sm text-muted-foreground">Walkthroughs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{aiUsage.walkthroughsRemaining}</div>
              <div className="text-sm text-muted-foreground">Walkthroughs Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{aiUsage.walkthroughsLimit}</div>
              <div className="text-sm text-muted-foreground">Monthly Limit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coach Starter */}
        <Card className={isCurrentlyStarter ? "border-primary" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Coach Starter
              </CardTitle>
              {isCurrentlyStarter && <Badge>Current Plan</Badge>}
            </div>
            <CardDescription>Perfect for individual coaches getting started</CardDescription>
            <div className="text-3xl font-bold">Free</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>15 walkthroughs per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Up to 5 teachers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>1 organization</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Basic analytics (30 days)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Email support</span>
              </li>
            </ul>
            {isCurrentlyStarter && (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Coach Pro */}
        <Card className={!isCurrentlyStarter ? "border-primary" : "border-2 border-gradient-to-r from-purple-500 to-blue-500"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-500" />
                Coach Pro
              </CardTitle>
              {!isCurrentlyStarter && <Badge>Current Plan</Badge>}
            </div>
            <CardDescription>For coaches serious about scaling their impact</CardDescription>
            <div className="text-3xl font-bold">$39<span className="text-lg font-normal">/month</span></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>100 walkthroughs per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Up to 25 teachers</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Up to 3 organizations</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Advanced analytics (6 months)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Export capabilities</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Early access to new features</span>
              </li>
            </ul>
            {isCurrentlyStarter ? (
              <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                Upgrade to Pro
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                Current Plan
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Questions about plans or billing</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about which plan is right for you? We&apos;re here to help you choose the best option for your coaching needs.
          </p>
          <Button variant="outline">
            Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 