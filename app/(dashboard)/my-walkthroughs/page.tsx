"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PageHeader } from "@/components/common/PageHeader";
import { useState } from "react";
import { getIndicatorName } from "@/lib/IndicatorUtils";
import WalkthroughFilters from "./components/WalkthroughFilters";
import WalkthroughList from "./components/WalkthroughList";
import { Walkthrough } from "@/types/walkthrough";


export default function MyWalkthroughsPage() {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get walkthroughs for the current user (teacher or coach)
  const { walkthroughs = [], isCoach = false } = useQuery(api.walkthroughs.getMyWalkthroughs, {
    searchTerm,
    statusFilter,
  }) ?? {};

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-4 md:py-6 space-y-4">
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title={isCoach ? "All Walkthroughs" : "My Walkthroughs"}
          description={isCoach ? "View and track all walkthroughs for your teachers" : "View and track all your classroom observation walkthroughs"}
        />
        {/* Filters */}
        <WalkthroughFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
        {/* Walkthroughs List */}
        <WalkthroughList
          walkthroughs={walkthroughs as Walkthrough[]}
          isCoach={isCoach}
          getIndicatorName={getIndicatorName}
        />
      </div>
    </div>
  );
} 