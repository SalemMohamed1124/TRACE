"use client";

import OverviewStats from "@/Features/dashboard/OverviewStats";
import { AIInsightsCard } from "@/Features/ai/AIInsightsCard";
import VulnTrendChart from "@/Features/dashboard/VulnTrendChart";
import ScanActivityChart from "@/Features/dashboard/ScanActivityChart";
import RecentActivity from "@/Features/dashboard/RecentActivity";
import RecentScansTable from "@/Features/dashboard/RecentScansTable";
import QuickActions from "@/Features/dashboard/QuickActions";
import TeamMembersCard from "@/Features/dashboard/TeamMembersCard";
import ScheduledScansCard from "@/Features/dashboard/ScheduledScansCard";

export default function OverviewPage() {
  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <h2 className="text-muted-foreground">
            Security Posture &amp; Operations Intelligence
          </h2>
        </div>
      </div>

      <OverviewStats />
      <QuickActions />

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TeamMembersCard />
        <ScheduledScansCard />

        <VulnTrendChart />
        <ScanActivityChart />
      </div>

      {/* Intelligence Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AIInsightsCard />

        <RecentActivity />
      </div>
      <RecentScansTable />
    </div>
  );
}
