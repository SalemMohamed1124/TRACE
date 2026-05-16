"use client";

import type { Scan, ScanStatus } from "@/types";
import { MobileCard } from "@/components/layout/MobileCard";
import { SeverityBadge } from "@/components/layout/SeverityBadge";
import { formatRelativeTime, formatDuration } from "@/lib/utils";
import { Calendar, Timer } from "lucide-react";
import ScanRowActions from "./ScanRowActions";

import { SCAN_STATUS_CONFIG } from "./scan-status-config";

export default function ScanMobileCard({ scan }: { scan: Scan }) {
  const status = scan.status;
  const config = SCAN_STATUS_CONFIG[status];
  const Icon = config.icon;
  const summary = scan.findingsSummary;

  return (
    <MobileCard className="w-full max-w-full">
      <MobileCard.Header>
        <div className="grid min-w-0 flex-1 gap-1">
          <h4
            className="font-bold text-lg tracking-tight leading-none truncate w-full"
            title={scan.asset?.name || scan.assetId}
          >
            {scan.asset?.name || "Target Asset"}
          </h4>
          <div className="flex min-w-0">
            <span className="truncate max-w-full px-2 py-0.5 bg-muted/40 border border-border/50 text-[10px] font-mono text-muted-foreground rounded-sm">
              {scan.asset?.value || scan.assetId}
            </span>
          </div>
        </div>
      </MobileCard.Header>

      <MobileCard.Content>
        <MobileCard.Row>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Scan Status:
          </span>
          <SeverityBadge theme={config.theme}>
            {scan.status === "RUNNING" ? `${scan.progress}%` : scan.status}
          </SeverityBadge>
        </MobileCard.Row>

        <MobileCard.Row>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Scan Type:
          </span>
          <span className="text-xs font-bold px-1.5 py-0.5 bg-secondary/30 border border-border/30 rounded-none uppercase tracking-tighter text-[10px]">
            {scan.type} SCAN
          </span>
        </MobileCard.Row>

        <MobileCard.Row>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Started:
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <Calendar className="size-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-xs font-bold truncate">
              {formatRelativeTime(scan.startedAt)}
            </span>
          </div>
        </MobileCard.Row>

        <MobileCard.Row>
          <span className="text-xs text-muted-foreground font-medium shrink-0">
            Duration:
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <Timer className="size-3.5 text-muted-foreground/60 shrink-0" />
            <span className="text-xs font-bold truncate">
              {scan.startedAt && scan.completedAt
                ? formatDuration(scan.startedAt, scan.completedAt)
                : "--"}
            </span>
          </div>
        </MobileCard.Row>

        {summary && summary.total > 0 && (
          <MobileCard.Row className="items-stretch">
            <span className="text-xs text-muted-foreground font-medium shrink-0 ">
              Findings:
            </span>
            <div className="flex flex-wrap justify-end  gap-2">
              {[
                { count: summary.critical, theme: "CRITICAL" },
                { count: summary.high, theme: "HIGH" },
                { count: summary.medium, theme: "MEDIUM" },
                { count: summary.low, theme: "LOW" },
              ].map(
                (s, idx) =>
                  s.count > 0 && (
                    <SeverityBadge
                      key={idx}
                      theme={s.theme as any}
                      className="gap-1 "
                    >
                      <span className="text-[10px] uppercase  tracking-wider">
                        {s.theme}
                      </span>
                      <span className="text-xs">{s.count}</span>
                    </SeverityBadge>
                  ),
              )}
            </div>
          </MobileCard.Row>
        )}
      </MobileCard.Content>

      <MobileCard.Footer>
        <ScanRowActions scan={scan} />
      </MobileCard.Footer>
    </MobileCard>
  );
}
