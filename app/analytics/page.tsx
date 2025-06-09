"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Counter = () => {
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const observerId = currentUser?._id;
  const analytics = useQuery(
    api.analytics.observerAnalytics,
    observerId ? { observerId } : "skip"
  );

  // Loading state
  if (!currentUser || (observerId && !analytics)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-pulse">
        <span className="text-4xl font-bold text-gray-300">--</span>
        <span className="text-sm text-muted-foreground mt-1">Walkthroughs this month</span>
      </div>
    );
  }

  // TODO: Handle error and edge cases
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className="text-4xl font-bold">{analytics?.totalWalkthroughsThisMonth ?? 0}</span>
      <span className="text-sm text-muted-foreground mt-1">Walkthroughs this month</span>
    </div>
  );
};

const BAR_COLORS = [
  "#6366f1", // Indigo
  "#f59e42", // Orange
  "#10b981", // Green
  "#f43f5e", // Red
  "#3b82f6", // Blue
  "#a21caf", // Purple
];

const BarChart = () => {
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const observerId = currentUser?._id;
  const analytics = useQuery(
    api.analytics.observerAnalytics,
    observerId ? { observerId } : "skip"
  );

  if (!currentUser || (observerId && !analytics)) {
    return (
      <div className="h-full flex flex-col justify-center animate-pulse">
        <div className="text-sm font-semibold mb-2">Feedback by Indicator</div>
        <div className="flex items-end gap-2 h-16">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="w-6 h-10 bg-gray-200 rounded" />
          <div className="w-6 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const indicatorCounts = analytics?.indicatorCounts || {};
  const indicators = Object.keys(indicatorCounts);
  const maxCount = Math.max(...Object.values(indicatorCounts), 1);

  return (
    <div className="h-full flex flex-col justify-center">
      {indicators.length === 0 ? (
        <div className="text-xs text-muted-foreground">No feedback yet</div>
      ) : (
        <div className="rounded-lg p-2 flex items-end gap-4 h-28">
          {indicators.map((indicator, i) => {
            const count = indicatorCounts[indicator];
            const color = BAR_COLORS[i % BAR_COLORS.length];
            return (
              <div key={indicator} className="flex flex-col items-center group">
                <div
                  style={{
                    width: 20,
                    height: Math.max(12, (count / maxCount) * 64),
                    background: color,
                    borderRadius: 6,
                    transition: "height 0.3s",
                  }}
                  title={indicator}
                  className="group-hover:opacity-80"
                />
                <span
                  className="text-[10px] mt-1 text-muted-foreground truncate max-w-[40px] text-center"
                  title={indicator}
                >
                  {indicator}
                </span>
                <span className="text-[11px] text-gray-700 font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const DonutChart = () => {
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const observerId = currentUser?._id;
  const analytics = useQuery(
    api.analytics.observerAnalytics,
    observerId ? { observerId } : "skip"
  );

  if (!currentUser || (observerId && !analytics)) {
    return (
      <div className="flex flex-col items-center justify-center h-full animate-pulse">
        <svg width="60" height="60" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="#f3f4f6" />
        </svg>
        <div className="text-xs mt-2 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const indicatorCounts = analytics?.indicatorCounts || {};
  const indicators = Object.keys(indicatorCounts);
  const total = Object.values(indicatorCounts).reduce((a, b) => a + b, 0);

  if (indicators.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg width="60" height="60" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="#f3f4f6" />
        </svg>
        <div className="text-xs mt-2 text-muted-foreground">No feedback yet</div>
      </div>
    );
  }

  // Calculate donut slices
  let startAngle = 0;
  const slices = indicators.map((indicator, i) => {
    const count = indicatorCounts[indicator];
    const percent = count / total;
    const angle = percent * 360;
    const endAngle = startAngle + angle;
    // Convert angles to coordinates
    const largeArc = angle > 180 ? 1 : 0;
    const radius = 16;
    const center = 18;
    const x1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
    const y1 = center - radius * Math.cos((Math.PI * startAngle) / 180);
    const x2 = center + radius * Math.sin((Math.PI * endAngle) / 180);
    const y2 = center - radius * Math.cos((Math.PI * endAngle) / 180);
    const path = `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;
    const color = BAR_COLORS[i % BAR_COLORS.length];
    const slice = (
      <path key={indicator} d={path} fill={color} stroke="#fff" strokeWidth={0.5} />
    );
    startAngle = endAngle;
    return slice;
  });

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <svg width="60" height="60" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="#f3f4f6" />
        {slices}
      </svg>
      <div className="flex flex-col gap-1 mt-2">
        {indicators.map((indicator, i) => {
          const count = indicatorCounts[indicator];
          const percent = ((count / total) * 100).toFixed(0);
          const color = BAR_COLORS[i % BAR_COLORS.length];
          return (
            <div key={indicator} className="flex items-center gap-2 text-xs">
              <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: 'inline-block' }} />
              <span className="truncate max-w-[60px]" title={indicator}>{indicator}</span>
              <span className="text-muted-foreground">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Report = () => (
  <div className="animate-pulse rounded-lg h-20 w-full flex items-center justify-center">
    <span className="text-gray-400">Loading report...</span>
  </div>
);

const WideCard = () => {
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const observerId = currentUser?._id;
  const analytics = useQuery(
    api.analytics.observerAnalytics,
    observerId ? { observerId } : "skip"
  );

  if (!currentUser || (observerId && !analytics)) {
    return (
      <div className="rounded-lg h-20 w-full flex flex-col items-center justify-center animate-pulse">
        <span className="text-2xl font-bold text-gray-300">--</span>
        <span className="text-xs text-muted-foreground mt-1">Unique teachers observed</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg h-20 w-full flex flex-col items-center justify-center">
      <span className="text-2xl font-bold">{analytics?.uniqueTeachersObserved ?? 0}</span>
      <span className="text-xs text-muted-foreground mt-1">Unique teachers observed</span>
    </div>
  );
};

export default function AnalyticsDashboardPage() {
  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Analytics Dashboard
        </h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Walkthroughs This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <Counter />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Feedback by Indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Indicator Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Report />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unique Teachers Observed</CardTitle>
          </CardHeader>
          <CardContent>
            <WideCard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 