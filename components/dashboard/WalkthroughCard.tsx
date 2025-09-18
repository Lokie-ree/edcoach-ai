import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Award, Target, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Walkthrough } from "@/types/walkthrough";
import { STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

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
                <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border", STATUS_COLORS.success.bg, STATUS_COLORS.success.text, STATUS_COLORS.success.border)}>
                  <Award className="h-3 w-3" />
                  {getIndicatorName(walkthrough.reinforcementIndicator)}
                </span>
                <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border", STATUS_COLORS.info.bg, STATUS_COLORS.info.text, STATUS_COLORS.info.border)}>
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