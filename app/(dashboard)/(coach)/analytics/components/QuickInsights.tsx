import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, Crown, Target } from "lucide-react";
import { AnalyticsData } from "@/types/dashboard";
import { ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export const QuickInsights = ({
  analytics,
}: {
  analytics: AnalyticsData | null | undefined;
}) => {
  if (!analytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
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
            <TrendingUp className={ICONS.semantic.header} />
            Quick Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Team Strengths */}
            <div className="space-y-3">
              <h4 className={cn("font-medium flex items-center gap-2", STATUS_COLORS.success.text)}>
                <Crown className={ICONS.semantic.inline} />
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
                      <span className={cn("text-sm font-bold", STATUS_COLORS.success.text)}>
                        {strength.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Growth Areas */}
            <div className="space-y-3">
              <h4 className={cn("font-medium flex items-center gap-2", STATUS_COLORS.warning.text)}>
                <Target className={ICONS.semantic.inline} />
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
                      <span className={cn("text-sm font-bold", STATUS_COLORS.warning.text)}>
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
