import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { AnalyticsData } from "@/types/dashboard";
import { ANIMATIONS, ICONS, STATUS_COLORS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

export const TeacherProgressHeatmap = ({
  analytics,
}: {
  analytics: AnalyticsData | null | undefined;
}) => {
  if (!analytics) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Format domain names for display (convert from ALL CAPS to Title Case)
  const formatDomainName = (domain: string) => {
    return domain.charAt(0) + domain.slice(1).toLowerCase();
  };

  const domains = ["INSTRUCTION", "PLANNING", "ENVIRONMENT", "PROFESSIONALISM"];

  // Get status color and styling
  const getStatusStyle = (
    status: "strength" | "developing" | "needs_focus",
  ) => {
    switch (status) {
      case "strength":
        return cn(STATUS_COLORS.success.bg, STATUS_COLORS.success.text, STATUS_COLORS.success.border);
      case "developing":
        return cn(STATUS_COLORS.warning.bg, STATUS_COLORS.warning.text, STATUS_COLORS.warning.border);
      case "needs_focus":
        return cn(STATUS_COLORS.error.bg, STATUS_COLORS.error.text, STATUS_COLORS.error.border);
      default:
        return cn(STATUS_COLORS.neutral.bg, STATUS_COLORS.neutral.text, STATUS_COLORS.neutral.border);
    }
  };

  const getStatusIcon = (status: "strength" | "developing" | "needs_focus") => {
    switch (status) {
      case "strength":
        return "💪";
      case "developing":
        return "📈";
      case "needs_focus":
        return "🎯";
      default:
        return "⚪";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className={ICONS.semantic.header} />
            Teacher Progress Heatmap
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Individual teacher progress across rubric domains
          </p>
        </CardHeader>
        <CardContent>
          {analytics.teacherProgressMatrix.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className={cn(ICONS.sizes.xl, "mx-auto mb-4 opacity-50")} />
              <p>No teacher progress data available</p>
              <p className="text-xs">
                Complete walkthroughs to see progress insights
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header row with domain names */}
              <div className="grid grid-cols-[1fr,repeat(4,1fr),auto] gap-2 pb-2 border-b border-border">
                <div className="text-sm font-medium text-muted-foreground">
                  Teacher
                </div>
                {domains.map((domain) => (
                  <div
                    key={domain}
                    className="text-xs font-medium text-center text-muted-foreground"
                  >
                    {formatDomainName(domain)}
                  </div>
                ))}
                <div className="text-xs font-medium text-muted-foreground">
                  Last Seen
                </div>
              </div>

              {/* Teacher rows */}
              <div className="space-y-2">
                {analytics.teacherProgressMatrix.map((teacher) => (
                  <div
                    key={teacher.teacherId}
                    className={cn("grid grid-cols-[1fr,repeat(4,1fr),auto] gap-2 items-center p-2 rounded-lg hover:bg-muted/50", ANIMATIONS.classes.normal)}
                  >
                    {/* Teacher name */}
                    <div className="text-sm font-medium truncate">
                      {teacher.teacherName}
                    </div>

                    {/* Domain status cells */}
                    {domains.map((domain) => {
                      const domainScore = teacher.domainScores.find(
                        (ds) => ds.domain === domain,
                      );
                      if (!domainScore) {
                        return (
                          <div
                            key={domain}
                            className="h-8 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center"
                          >
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={domain}
                          className={cn("h-8 rounded border-2 flex items-center justify-center cursor-help hover:scale-105", ANIMATIONS.classes.normal, getStatusStyle(domainScore.status))}
                          title={`${formatDomainName(domain)}: ${domainScore.status.replace("_", " ")} | Reinforcement: ${domainScore.reinforcementCount} | Refinement: ${domainScore.refinementCount}`}
                        >
                          <span className="text-xs">
                            {getStatusIcon(domainScore.status)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Last observation */}
                    <div className="text-xs text-muted-foreground">
                      {teacher.lastObservation
                        ? (() => {
                            const daysSince = Math.floor(
                              (Date.now() - teacher.lastObservation) /
                                (24 * 60 * 60 * 1000),
                            );
                            return daysSince === 0
                              ? "Today"
                              : daysSince === 1
                                ? "1 day ago"
                                : daysSince < 7
                                  ? `${daysSince} days ago`
                                  : daysSince < 30
                                    ? `${Math.floor(daysSince / 7)} weeks ago`
                                    : `${Math.floor(daysSince / 30)} months ago`;
                          })()
                        : "Never"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Legend
                </h4>
                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 ${getStatusStyle("strength")}`}
                    ></div>
                    <span>💪 Strength</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 ${getStatusStyle("developing")}`}
                    ></div>
                    <span>📈 Developing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border-2 ${getStatusStyle("needs_focus")}`}
                    ></div>
                    <span>🎯 Needs Focus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded border-2 border-dashed border-muted-foreground/30"></div>
                    <span>— No Data</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
