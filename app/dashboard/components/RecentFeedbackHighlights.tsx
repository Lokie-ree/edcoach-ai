"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Award, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface RecentFeedbackHighlightsProps {
  organizationId: string;
}

interface FeedbackEntry {
  _id: string;
  type: "reinforcement" | "refinement";
  aiFeedback: string;
  indicatorAcronym: string;
  createdAt: number;
  walkthroughDate?: number;
  teacherName?: string;
}

interface TeacherFeedbackGroup {
  teacherName: string;
  entries: FeedbackEntry[];
  mostRecentDate: number;
}

function groupEntriesByTeacher(entries: FeedbackEntry[]): TeacherFeedbackGroup[] {
  // Filter entries that have AI feedback and are reinforcement/refinement
  const validEntries = entries.filter(
    entry => entry.aiFeedback && (entry.type === "reinforcement" || entry.type === "refinement")
  );

  // Group by teacher
  const teacherGroups = validEntries.reduce((groups, entry) => {
    const teacherName = entry.teacherName || "Unknown Teacher";
    if (!groups[teacherName]) {
      groups[teacherName] = [];
    }
    groups[teacherName].push(entry);
    return groups;
  }, {} as Record<string, FeedbackEntry[]>);

  // Convert to array format and sort by most recent
  return Object.entries(teacherGroups)
    .map(([teacherName, teacherEntries]) => ({
      teacherName,
      entries: teacherEntries.sort((a, b) => b.createdAt - a.createdAt),
      mostRecentDate: Math.max(...teacherEntries.map(e => e.walkthroughDate || e.createdAt))
    }))
    .sort((a, b) => b.mostRecentDate - a.mostRecentDate)
    .slice(0, 4); // Show top 4 teachers
}

export default function RecentFeedbackHighlights({ organizationId }: RecentFeedbackHighlightsProps) {
  // Fetch walkthrough entries scoped to this organization
  const walkthroughEntries = useQuery(
    api.walkthroughEntries.listByOrg,
    { clerkOrganizationId: organizationId }
  );

  const entries = walkthroughEntries ?? [];
  const teacherGroups = groupEntriesByTeacher(entries as FeedbackEntry[]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Feedback Highlights</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest AI-generated insights across your teachers
          </p>
        </CardHeader>
        <CardContent>
          {entries.length > 0 ? (
            <div className="space-y-4">
              {teacherGroups.length > 0 ? (
                teacherGroups.map(({ teacherName, entries: teacherEntries }) => (
                  <div 
                    key={teacherName} 
                    className="p-4 border border-border rounded-lg bg-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{teacherName}</h4>
                        <div className="flex flex-wrap gap-1">
                          {teacherEntries.slice(0, 2).map((entry) => (
                            <span 
                              key={entry._id} 
                              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                                entry.type === "reinforcement"
                                  ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 border-green-200 dark:border-green-800"
                                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              }`}
                            >
                              {entry.type === "reinforcement" ? (
                                <Award className="h-3 w-3" />
                              ) : (
                                <Target className="h-3 w-3" />
                              )}
                              {entry.indicatorAcronym}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {teacherEntries[0].walkthroughDate 
                          ? new Date(teacherEntries[0].walkthroughDate).toLocaleDateString()
                          : new Date(teacherEntries[0].createdAt).toLocaleDateString()
                        }
                      </span>
                    </div>
                    <div className="space-y-2">
                      {teacherEntries.slice(0, 2).map((entry) => (
                        <p key={entry._id} className="text-sm text-foreground leading-relaxed">
                          <span className={`font-medium ${
                            entry.type === "reinforcement" 
                              ? "text-green-700 dark:text-green-300" 
                              : "text-blue-700 dark:text-blue-300"
                          }`}>
                            {entry.type === "reinforcement" ? "Reinforcement" : "Refinement"}:
                          </span>{" "}
                          {entry.aiFeedback}
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback highlights yet</p>
                  <p className="text-sm">Complete walkthroughs to see AI-generated insights</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No feedback available</p>
              <p className="text-sm">Complete walkthroughs to see AI-generated insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 