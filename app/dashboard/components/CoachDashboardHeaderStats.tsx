"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function CoachDashboardHeaderStats() {
  // UPDATED: Use coach-based analytics instead of organization-based
  const analytics = useQuery(api.analytics.getCoachAnalytics);

  if (!analytics) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const stats = [
    {
      icon: Users,
      label: "Teachers",
      value: analytics.totalTeachers,
      active: analytics.activeTeachers,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: BookOpen,
      label: "Walkthroughs",
      value: analytics.totalWalkthroughs,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: MessageSquare,
      label: "AI Feedback",
      value: analytics.totalFeedbackGenerated,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold text-foreground">
                      {stat.value}
                    </span>
                    {stat.active !== undefined && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {stat.active} active
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Growth indicator */}
      {analytics.totalWalkthroughs > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="flex items-center gap-1 text-green-600 dark:text-green-400"
        >
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-medium">Growing</span>
        </motion.div>
      )}
    </div>
  );
} 