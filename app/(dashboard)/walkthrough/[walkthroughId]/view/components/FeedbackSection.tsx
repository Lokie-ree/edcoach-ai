import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Award, Target } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { Walkthrough } from "@/types/walkthrough";

interface FeedbackSectionProps {
  walkthrough: Walkthrough;
  indicatorNames: {
    reinforcementIndicatorName: string;
    refinementIndicatorName: string;
  };
}

export default function FeedbackSection({
  walkthrough,
  indicatorNames,
}: FeedbackSectionProps) {
  // Use feedback directly from walkthrough document instead of entries
  const reinforcementFeedback = walkthrough.reinforcementFeedback;
  const refinementFeedback = walkthrough.refinementFeedback;

  if (walkthrough.status !== "completed") return null;

  return (
    <motion.div
      className="grid gap-6 lg:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Reinforcement */}
      <Card className="border-green-200 dark:border-green-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <BorderBeam
          duration={6}
          size={200}
          colorFrom="#10B981"
          colorTo="#059669"
        />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Award className="h-5 w-5" />
            Reinforcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Indicator
              </p>
              <p className="font-medium">
                {indicatorNames.reinforcementIndicatorName}
              </p>
            </div>
            {reinforcementFeedback && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Feedback
                </p>
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {reinforcementFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Refinement */}
      <Card className="border-blue-200 dark:border-blue-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300">
        <BorderBeam
          duration={6}
          size={200}
          colorFrom="#3B82F6"
          colorTo="#1D4ED8"
        />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Target className="h-5 w-5" />
            Refinement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Indicator
              </p>
              <p className="font-medium">
                {indicatorNames.refinementIndicatorName}
              </p>
            </div>
            {refinementFeedback && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Feedback
                </p>
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">
                    {refinementFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
