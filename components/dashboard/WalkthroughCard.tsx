import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Award, Target, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Walkthrough } from "@/types/walkthrough";

interface WalkthroughCardProps {
  walkthrough: Walkthrough;
  isCoach: boolean;
  getIndicatorName: (indicator: string) => string;
}

export default function WalkthroughCard({ walkthrough, isCoach, getIndicatorName }: WalkthroughCardProps) {
  return (
    <Link href={`/walkthrough/${walkthrough._id}/view`} className="block">
      <Card className="hover:shadow-md hover:bg-accent/30 transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={walkthrough.status === "completed" ? "default" : "secondary"}>
                {walkthrough.status === "completed" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    Completed
                  </>
                )}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(walkthrough.walkthroughDate).toLocaleDateString()}
              </div>
              {isCoach && (
                <div className="flex items-center text-xs text-muted-foreground ml-4">
                  <User className="h-4 w-4 mr-1" />
                  {walkthrough.teacherName}
                </div>
              )}
            </div>
            <h3 className="font-medium text-lg">
              Classroom Walkthrough
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {walkthrough.evidenceSummary || "No evidence summary provided."}
            </p>
            {walkthrough.status === "completed" && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                  <Award className="h-3 w-3" />
                  {getIndicatorName(walkthrough.reinforcementIndicator)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                  <Target className="h-3 w-3" />
                  {getIndicatorName(walkthrough.refinementIndicator)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 