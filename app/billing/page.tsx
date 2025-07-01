"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from '@clerk/nextjs';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePlanDetection } from "@/lib/usePlanDetection";

function ProUsageCard() {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: true });
  
  if (!aiUsage) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pro Plan Usage</CardTitle>
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
  );
}

function StarterUsageCard() {
  const aiUsage = useQuery(api.plans.getAIUsageThisMonth, { hasProPlan: false });
  
  if (!aiUsage) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Starter Plan Usage</CardTitle>
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
  );
}

export default function BillingPage() {
  const planDetection = usePlanDetection();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plans"
        description="Choose the plan that fits your coaching needs"
        gradient={true}
      />

      {/* Usage Cards - show appropriate card based on personal plan */}
      {planDetection.isProPlan ? (
        <ProUsageCard />
      ) : (
        <StarterUsageCard />
      )}

      {/* Clerk Pricing Table */}
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <PricingTable />
        </div>
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