"use client";

import * as React from "react";
import {
  BarChart3,
  BookOpen,
  Settings,
  Users,
  CreditCard,
  Activity,
} from "lucide-react";
import { DashboardNav } from "./DashboardNav";

export function CoachNavItems() {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Activity,
    },
    {
      title: "Teachers",
      url: "/teachers",
      icon: Users,
    },
    {
      title: "Walkthroughs",
      url: "/walkthrough",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Billing",
      url: "/settings/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      url: "/settings/profile",
      icon: Settings,
    },
  ];

  return <DashboardNav items={navItems} />;
}
