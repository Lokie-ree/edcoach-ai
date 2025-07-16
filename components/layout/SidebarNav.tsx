"use client";

import * as React from "react";
import { GraduationCap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { CoachNavItems } from "./CoachNavItems";
import { TeacherNavItems } from "./TeacherNavItems";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

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

  // Sample user data - in a real app this would come from Clerk
  const user = {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        {userRole === "coach" ? (
          <CoachNavItems />
        ) : (
          <TeacherNavItems />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
} 