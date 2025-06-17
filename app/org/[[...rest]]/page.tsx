// This file should be moved to app/org/[[...rest]]/page.tsx for Clerk catch-all routing support.
"use client";
import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationManagementPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Organization Management</h1>
      <OrganizationProfile />
    </div>
  );
} 