import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Crown, Target } from "lucide-react";
import { AnalyticsData } from "@/types/dashboard";

export const QuickInsights = ({
  analytics,
}: {
  analytics: AnalyticsData | null | undefined;
}) => {
  if (!analytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Team Strengths */}
            <div className="space-y-3">
              <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Top Team Strengths
              </h4>
              {!analytics.topStrengths || analytics.topStrengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reinforcement data yet
                </p>
              ) : (
                <div className="space-y-2">
                  {analytics.topStrengths.map((strength) => (
                    <div
                      key={strength.indicator}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {strength.indicatorName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({strength.indicator})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {strength.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Areas */}
            <div className="space-y-3">
              <h4 className="font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Focus Areas
              </h4>
              {!analytics.topGrowthAreas || analytics.topGrowthAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No refinement data yet
                </p>
              ) : (
                <div className="space-y-2">
                  {analytics.topGrowthAreas.map((area) => (
                    <div
                      key={area.indicator}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {area.indicatorName}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({area.indicator})
                        </span>
                      </div>
                      <span className="text-sm font-bold text-orange-600">
                        {area.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
