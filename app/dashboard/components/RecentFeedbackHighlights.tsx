"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, TrendingUp, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function RecentFeedbackHighlights() {
  // UPDATED: Use coach-based analytics instead of organization-based
  const analytics = useQuery(api.analytics.getCoachAnalytics);

  if (analytics === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Recent Feedback
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {analytics.totalFeedbackGenerated} Total
            </Badge>
            <Link href="/analytics">
              <Button size="sm" variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {analytics.totalWalkthroughs}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Walkthroughs</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {analytics.totalFeedbackGenerated}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">AI Feedback</div>
          </div>
        </div>

        {/* Recent Walkthroughs */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
          
          {analytics.recentWalkthroughs.length > 0 ? (
            analytics.recentWalkthroughs.slice(0, 5).map((walkthrough) => (
              <div key={walkthrough._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{walkthrough.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by {walkthrough.teacherName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {walkthrough.hasAiFeedback ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Feedback Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(walkthrough.createdAt, { addSuffix: true })}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No feedback yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start conducting walkthroughs to generate AI-powered feedback for your teachers
              </p>
              <Link href="/walkthrough/new">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create First Walkthrough
                </Button>
              </Link>
            </div>
          )}

          {/* View All Link */}
          {analytics.recentWalkthroughs.length > 0 && (
            <div className="pt-2">
              <Link href="/my-walkthroughs">
                <Button variant="outline" size="sm" className="w-full">
                  View All Walkthroughs
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Growth Indicator */}
        {analytics.totalWalkthroughs > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2 text-green-600 dark:text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {Math.round((analytics.totalFeedbackGenerated / analytics.totalWalkthroughs) * 100)}% of walkthroughs have AI feedback
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 