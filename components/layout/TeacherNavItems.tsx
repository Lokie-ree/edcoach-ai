"use client";

import * as React from "react";
import { BookOpen, Settings, Target } from "lucide-react";
import { DashboardNav } from "./DashboardNav";

export function TeacherNavItems() {
  const navItems = [
    {
      title: "My PGP",
      url: "/my-pgp",
      icon: Target,
    },
    {
      title: "Walkthroughs",
      url: "/walkthrough",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings/profile",
      icon: Settings,
    },
  ];

  return <DashboardNav items={navItems} />;
}
