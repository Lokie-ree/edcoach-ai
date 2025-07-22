"use client";

import * as React from "react";
import { BookOpen, Target } from "lucide-react";
import { DashboardNav } from "./DashboardNav";

export function TeacherNavItems() {
  const navItems = [
    {
      title: "My Growth Journal",
      url: "/growth-journal",
      icon: Target,
    },
    {
      title: "Walkthroughs",
      url: "/walkthrough",
      icon: BookOpen,
    },
  ];

  return <DashboardNav items={navItems} />;
}
