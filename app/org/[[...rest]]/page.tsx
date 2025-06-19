// This file should be moved to app/org/[[...rest]]/page.tsx for Clerk catch-all routing support.
"use client";
import { OrganizationProfile } from "@clerk/nextjs";
import { PageHeader } from "@/components/layout/PageHeader";

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Management"
        description="Manage your organization members, settings, and billing"
        gradient={true}
      />
      
      <div className="flex justify-center">
        <OrganizationProfile
          routing="path"
          path="/org" 
        />
      </div>
    </div>
  );
} 