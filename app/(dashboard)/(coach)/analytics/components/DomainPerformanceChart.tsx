import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, BarChart3 } from "lucide-react";
import { AnalyticsData } from "@/types/dashboard";
import { ANIMATIONS, ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export const DomainPerformanceChart = ({
  analytics,
}: {
  analytics: AnalyticsData | null | undefined;
}) => {
  if (!analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Donut chart for feedback distribution
  const DonutChart = () => {
    const total = analytics.reinforcementCount + analytics.refinementCount;

    if (total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <PieChart className={cn(ICONS.sizes.xl, "text-muted-foreground mb-4")} />
          <p className="text-muted-foreground">No feedback data yet</p>
        </div>
      );
    }

    const reinforcementPercent = (analytics.reinforcementCount / total) * 100;
    const refinementPercent = (analytics.refinementCount / total) * 100;

    return (
      <div className="flex flex-col items-center justify-center h-48">
        <div className="relative">
          <svg width="120" height="120" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="hsl(var(--color-success))"
              strokeWidth="2"
              strokeDasharray={`${reinforcementPercent} ${100 - reinforcementPercent}`}
              strokeDashoffset="25"
              transform="rotate(-90 18 18)"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${refinementPercent} ${100 - refinementPercent}`}
              strokeDashoffset={`${25 - reinforcementPercent}`}
              transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn("w-3 h-3 rounded-full", STATUS_COLORS.success.bg)}></div>
            <span>Reinforcement ({analytics.reinforcementCount})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Refinement ({analytics.refinementCount})</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className={ICONS.semantic.header} />
            Feedback Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className={ICONS.semantic.header} />
            Top Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className={cn("text-sm font-medium mb-3", STATUS_COLORS.success.text)}>
                Top Strengths
              </h4>
              {!analytics.topStrengths || analytics.topStrengths.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topStrengths.slice(0, 3).map((item) => (
                    <div
                      key={item.indicator}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-sm truncate flex-1 mr-2"
                        title={item.indicatorName}
                      >
                        {item.indicatorName}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", STATUS_COLORS.success.bg, ANIMATIONS.classes.normal)}
                            style={{
                              width: `${analytics.topStrengths && analytics.topStrengths.length > 0 ? (item.count / Math.max(...analytics.topStrengths.map((i) => i.count))) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h4 className={cn("text-sm font-medium mb-3", STATUS_COLORS.warning.text)}>
                Focus Areas
              </h4>
              {!analytics.topGrowthAreas || analytics.topGrowthAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {analytics.topGrowthAreas.slice(0, 3).map((item) => (
                    <div
                      key={item.indicator}
                      className="flex items-center justify-between"
                    >
                      <span
                        className="text-sm truncate flex-1 mr-2"
                        title={item.indicatorName}
                      >
                        {item.indicatorName}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full", STATUS_COLORS.warning.bg, ANIMATIONS.classes.normal)}
                            style={{
                              width: `${analytics.topGrowthAreas && analytics.topGrowthAreas.length > 0 ? (item.count / Math.max(...analytics.topGrowthAreas.map((i) => i.count))) * 100 : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-6 text-right">
                          {item.count}
                        </span>
                      </div>
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
