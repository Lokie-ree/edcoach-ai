"use client";

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

import dynamicImport from "next/dynamic";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/PageHeader";

// Dynamically import components that depend on Convex/Clerk to avoid SSR issues
const BillingContent = dynamicImport(() => import("./BillingContent"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

export default function BillingPage() {
  return (
    <div className="py-4 md:py-6 space-y-4">
      <div className="space-y-6">
        <PageHeader
          title="Billing & Plans"
          description="Choose the plan that fits your coaching needs"
          gradient={true}
        />

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }
        >
          <BillingContent />
        </Suspense>
      </div>
    </div>
  );
}
