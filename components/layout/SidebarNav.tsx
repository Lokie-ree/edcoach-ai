"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar, // <-- Add this import
} from "@/components/ui/sidebar";
import { CoachNavItems } from "./CoachNavItems";
import { TeacherNavItems } from "./TeacherNavItems";
import { TeamSwitcher } from "@/components/_unused/team-switcher";
import { AIUsageBadge, TeacherUsageBadge } from "@/components/common/AiUsageBadge";

interface SidebarNavProps {
  userRole?: "coach" | "teacher";
}

export function SidebarNav({ userRole }: SidebarNavProps) {
  // Sample data for team switcher - in a real app this would come from the user's context
  const teams = [
    {
      name: "EdCoach AI",
      logo: GraduationCap,
      plan: userRole === "coach" ? "Pro" : "Free",
    },
  ];

  const { state } = useSidebar(); // <-- Get sidebar state

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="space-y-3">
          <TeamSwitcher teams={teams} />
          {userRole === "coach" && state === "expanded" && ( // <-- Only show badges when expanded
            <div className="space-y-2 flex flex-col">
              <AIUsageBadge />
              <TeacherUsageBadge />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {userRole === "coach" ? (
          <CoachNavItems />
        ) : (
          <TeacherNavItems />
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
} 