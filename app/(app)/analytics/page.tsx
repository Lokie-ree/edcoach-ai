import React from "react";
import { cn } from "@/lib/utils";
import { BentoCard } from "@/components/mage-ui/bento-grid";

// Placeholder Mage UI components (replace with real imports when wiring up)
const BarChart = () => <div>BarChart (TODO)</div>;
const DonutChart = () => <div>DonutChart (TODO)</div>;
const Counter = () => <div>Counter (TODO)</div>;
const Report = () => <div>Report Skeleton (TODO)</div>;
const WideCard = () => <div>Wide Card Skeleton (TODO)</div>;

export default function AnalyticsDashboardPage() {
  return (
    <main className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-4 sm:grid-rows-2")}> 
        <BentoCard>
          {/* TODO: Teacher Feedback Counter */}
          <Counter />
        </BentoCard>
        <BentoCard>
          {/* TODO: Feedback by Indicator Bar Chart */}
          <BarChart />
        </BentoCard>
        <BentoCard>
          {/* TODO: Reinforcement vs Refinement Donut Chart */}
          <DonutChart />
        </BentoCard>
        <BentoCard>
          {/* TODO: Report Skeleton for loading state */}
          <Report />
        </BentoCard>
        <BentoCard>
          {/* TODO: Wide Card Skeleton for loading state */}
          <WideCard />
        </BentoCard>
      </div>
    </main>
  );
} 