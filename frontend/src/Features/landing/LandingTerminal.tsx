"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, ShieldAlert, CheckCircle2, ShieldCheck, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LOGS = [
  { text: "Initializing TRACE engine v2.4.1...", type: "system" },
  { text: "Resolving target: example.com (192.168.1.104)", type: "system" },
  { text: "Running Quick Scan (Port, SSL, DNS)...", type: "info" },
  { text: "Ports 80, 443 open. SSL certificate valid.", type: "success" },
  { text: "Initiating Deep Scan (40+ scripts)...", type: "info" },
  { text: "Testing for SQL Injection (Time-based blind)...", type: "system" },
  { text: "WARNING: Potential SQLi vector detected in /api/users", type: "warning" },
  { text: "Gemini AI analyzing payload behavior...", type: "ai" },
  { text: "Vulnerability confirmed. Severity: CRITICAL", type: "critical" },
  { text: "Testing for Cross-Site Scripting (XSS)...", type: "system" },
  { text: "No XSS vulnerabilities found.", type: "success" },
  { text: "Scan complete. 1 Critical, 0 High, 0 Medium.", type: "info" },
];

export function LandingTerminal() {
  const [visibleLogs, setVisibleLogs] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reveal logs one by one
    if (visibleLogs < LOGS.length) {
      const timer = setTimeout(() => {
        setVisibleLogs((prev) => prev + 1);
      }, Math.random() * 800 + 400); // Random delay between 400-1200ms
      return () => clearTimeout(timer);
    } else {
      // Loop back after 5 seconds
      const timer = setTimeout(() => {
        setVisibleLogs(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visibleLogs]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in-up stagger-3 text-left relative">
      
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" />
          trace-ai-scanner
        </div>
        <div className="w-12" /> {/* Spacer to balance */}
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="p-5 h-[280px] overflow-y-auto font-mono text-[13px] leading-relaxed no-scrollbar scroll-smooth"
      >
        <div className="flex flex-col gap-2">
          {LOGS.slice(0, visibleLogs).map((log, i) => (
            <div key={i} className="flex gap-3 animate-fade-in">
              <span className="text-muted-foreground/50 shrink-0 select-none">
                [{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
              </span>
              <span className={cn(
                "break-words",
                log.type === "system" && "text-muted-foreground",
                log.type === "info" && "text-blue-500 dark:text-blue-400 font-medium",
                log.type === "success" && "text-emerald-500 dark:text-emerald-400",
                log.type === "warning" && "text-amber-500 dark:text-amber-400",
                log.type === "critical" && "text-red-500 font-bold",
                log.type === "ai" && "text-purple-500 dark:text-purple-400 flex items-center gap-1.5"
              )}>
                {log.type === "ai" && <Sparkles className="h-3.5 w-3.5 animate-pulse" />}
                {log.text}
              </span>
            </div>
          ))}
          
          {visibleLogs < LOGS.length && (
            <div className="flex gap-3 items-center text-muted-foreground/50 mt-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Awaiting response...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
