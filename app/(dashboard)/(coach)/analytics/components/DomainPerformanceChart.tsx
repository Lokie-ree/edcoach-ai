import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { PieChart, BarChart3 } from "lucide-react";
import { AnalyticsData } from "@/types/dashboard";

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
          <PieChart className="h-12 w-12 text-muted-foreground mb-4" />
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
              stroke="#10b981"
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
              stroke="#3b82f6"
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
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Reinforcement ({analytics.reinforcementCount})</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
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
            <PieChart className="h-5 w-5" />
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
            <BarChart3 className="h-5 w-5" />
            Top Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-3 text-green-700 dark:text-green-400">
                Top Strengths
              </h4>
              {analytics.topStrengths.length === 0 ? (
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
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.count / Math.max(...analytics.topStrengths.map((i) => i.count))) * 100}%`,
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
              <h4 className="text-sm font-medium mb-3 text-orange-700 dark:text-orange-400">
                Focus Areas
              </h4>
              {analytics.topGrowthAreas.length === 0 ? (
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
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(item.count / Math.max(...analytics.topGrowthAreas.map((i) => i.count))) * 100}%`,
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
