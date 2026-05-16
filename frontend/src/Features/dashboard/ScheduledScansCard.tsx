"use client";

import Link from "next/link";
import { useSchedules } from "@/Features/schedule/useSchedules";
import { useScheduleFormModals } from "@/Features/schedule/useScheduleFormModals";
import { SeverityBadge } from "@/components/layout/SeverityBadge";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  ArrowRight,
  Plus,
  CheckCircle2,
  PauseCircle,
  Calendar,
  Layers,
} from "lucide-react";
import type { ScanSchedule } from "@/types";
import { cn } from "@/lib/utils";

const FREQ_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

function ScheduleRow({ schedule }: { schedule: ScanSchedule }) {
  const isActive = schedule.isActive;
  const nextRun = schedule.nextRunAt
    ? new Date(schedule.nextRunAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      {/* Icon */}
      <div
        className={cn(
          "size-8 flex items-center justify-center shrink-0",
          isActive
            ? "bg-emerald-500/10 text-emerald-500"
            : "bg-muted/20 text-muted-foreground",
        )}
      >
        {isActive ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <PauseCircle className="size-4" />
        )}
      </div>

      {/* Asset info */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold truncate leading-tight">
          {schedule.asset?.name || "Unknown Asset"}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground leading-tight">
          <Calendar className="size-3 shrink-0" />
          <span>{nextRun}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        <SeverityBadge
          theme="OUTLINE_SECONDARY"
          className="text-[10px] px-1.5 py-0 h-5 font-bold"
        >
          {FREQ_LABELS[schedule.frequency] ?? schedule.frequency}
        </SeverityBadge>
        <SeverityBadge
          theme={
            schedule.scanType === "DEEP" ? "INFORMATIVE" : "OUTLINE_SECONDARY"
          }
          className="text-[10px] px-1.5 py-0 h-5 font-bold"
        >
          {schedule.scanType}
        </SeverityBadge>
      </div>
    </div>
  );
}

export default function ScheduledScansCard() {
  const { items: schedules, isPending } = useSchedules();
  const { openCreate } = useScheduleFormModals();

  return (
    <div className="glass-card p-5 flex flex-col gap-4 shadow-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10">
            <CalendarClock className="size-4" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-tight">
              Scheduled Scans
            </h3>
            {!isPending && (
              <span className="text-[10px] text-muted-foreground font-medium">
                {schedules.length}{" "}
                {schedules.length === 1 ? "schedule" : "schedules"} configured
              </span>
            )}
          </div>
        </div>

        {/* New schedule button */}
        <Button size="sm" className="gap-2 text-xs" onClick={openCreate}>
          <Plus className="size-3.5" />
          New Schedule
        </Button>
      </div>

      {/* Schedule list */}
      <div className="flex flex-col">
        {isPending ? (
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className="size-8 bg-muted/20 rounded-sm animate-pulse shrink-0" />
                <div className="flex flex-col gap-1 flex-1">
                  <div className="h-3 w-28 bg-muted/20 rounded animate-pulse" />
                  <div className="h-2.5 w-36 bg-muted/10 rounded animate-pulse" />
                </div>
                <div className="flex gap-1">
                  <div className="h-5 w-12 bg-muted/20 rounded animate-pulse" />
                  <div className="h-5 w-10 bg-muted/20 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 opacity-40 gap-2">
            <Layers className="size-8" />
            <p className="text-xs font-black uppercase tracking-widest">
              No Schedules
            </p>
          </div>
        ) : (
          schedules
            .slice(0, 5)
            .map((schedule) => (
              <ScheduleRow key={schedule.id} schedule={schedule} />
            ))
        )}
      </div>

      {/* Footer link */}
      <div className="mt-auto">
        <Link
          href="/schedules"
          className="flex items-center pt-3 gap-2 border-t border-border/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span>View all schedules</span>
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
