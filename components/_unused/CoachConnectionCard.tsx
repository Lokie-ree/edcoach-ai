import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MessageSquare, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachInfo, CoachingStats } from "@/types/myProgress";

export default function CoachConnectionCard({ coach, coachingStats }: { coach: CoachInfo | null; coachingStats: CoachingStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Your Coach
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!coach ? (
          <div className="text-center py-8 text-muted-foreground">Your coach will appear here.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <p className="font-medium">{coach.name}</p>
                <p className="text-sm text-muted-foreground">Your Coach</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            {/* Collaboration Stats */}
            <div className="grid grid-cols-3 gap-4 py-3 border-b">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{coachingStats.totalWalkthroughs}</div>
                <p className="text-xs text-muted-foreground">Walkthroughs</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{coachingStats.completedWalkthroughs}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {coachingStats.lastObservation ?
                    `${Math.floor((Date.now() - coachingStats.lastObservation) / (1000 * 60 * 60 * 24))}d` :
                    "N/A"
                  }
                </div>
                <p className="text-xs text-muted-foreground">Days Ago</p>
              </div>
            </div>
            {/* Latest Coaching Insight */}
            {coachingStats.latestFeedback && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Latest Coaching Insight</p>
                <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border-l-3 border-green-500">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
                    {coachingStats.latestIndicator}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {coachingStats.latestFeedback.length > 120 ?
                      `${coachingStats.latestFeedback.substring(0, 120)}...` :
                      coachingStats.latestFeedback
                    }
                  </p>
                </div>
              </div>
            )}
            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="h-3 w-3 mr-1" />
                Schedule Meeting
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <MessageSquare className="h-3 w-3 mr-1" />
                Send Message
              </Button>
            </div>
            {/* Next Steps Placeholder */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                Upcoming
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {"Next coaching session: Schedule with your coach"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 