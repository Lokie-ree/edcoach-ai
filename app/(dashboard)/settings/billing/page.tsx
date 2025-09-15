"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@clerk/nextjs";

export default function BillingPage() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user && currentUser) {
      // Only coaches can access billing
      if (currentUser.role !== "coach") {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, currentUser, router]);

  // Show loading while checking permissions
  if (!isLoaded || !user || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not a coach, show loading while redirecting
  if (currentUser.role !== "coach") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="py-4 md:py-6 space-y-4">
      <div className="space-y-6">
        <PageHeader
          title="Billing & Plans"
          description="Choose the plan that fits your coaching needs"
          gradient={true}
        />

        {/* Clerk Pricing Table */}
        <div className="flex">
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
              Have questions about which plan is right for you? We&apos;re here
              to help you choose the best option for your coaching needs.
            </p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
