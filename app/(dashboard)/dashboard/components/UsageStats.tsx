"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";

export function UsageStats() {
  const usage = useQuery(api.users.checkAIUsageLimit);

  if (!usage) {
    return null;
  }

  const usagePercentage = Math.min((usage.usageThisMonth / usage.limit) * 100, 100);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Brain className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">AI Usage</span>
            <span className="truncate text-xs text-muted-foreground">
              {usage.usageThisMonth} / {usage.limit}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <div className="px-3 pb-3">
        <Progress value={usagePercentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {usage.canGenerate ? "Available" : "Limit reached"}
        </p>
      </div>
    </SidebarMenu>
  );
} 