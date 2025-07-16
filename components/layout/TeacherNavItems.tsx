"use client";

import * as React from "react";
import {
  BookOpen,
  Settings,
  Target,
  Activity,
} from "lucide-react";
import { DashboardNav } from "./DashboardNav";

export function TeacherNavItems() {
  const navItems = [
    {
      title: "My PGP",
      url: "/my-pgp",
      icon: Target,
    },
    {
      title: "My Progress",
      url: "/my-progress",
      icon: Activity,
    },
    {
      title: "My Walkthroughs",
      url: "/my-walkthroughs",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return <DashboardNav items={navItems} />;
} 