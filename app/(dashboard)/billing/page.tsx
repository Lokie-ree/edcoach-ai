"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from '@clerk/nextjs';

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plans"
        description="Choose the plan that fits your coaching needs"
        gradient={true}
      />

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