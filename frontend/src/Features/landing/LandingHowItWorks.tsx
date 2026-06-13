"use client";

import { useState, useCallback, useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { steps } from "./constants";
import { useReveal } from "@/hooks/useReveal";

const STEP_DURATION = 4; // seconds — matches CSS var(--step-duration)

export function LandingHowItWorks() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [barKey, setBarKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = useCallback((fromStep: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (fromStep + 1) % steps.length;
      setActive(next);
      setBarKey((k) => k + 1);
      scheduleNext(next);
    }, STEP_DURATION * 1000);
  }, []);

  const startedRef = useRef(false);
  if (!startedRef.current && typeof window !== "undefined") {
    startedRef.current = true;
    setTimeout(() => scheduleNext(0), STEP_DURATION * 1000);
  }

  const goTo = useCallback(
    (i: number) => {
      setActive(i);
      setBarKey((k) => k + 1);
      scheduleNext(i);
    },
    [scheduleNext],
  );

  const current = steps[active];
  const revealRef = useReveal();

  return (
    <section id="how-it-works" ref={revealRef as React.RefObject<HTMLElement>} className="relative py-24 md:py-32 bg-transparent">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="reveal text-center mb-20 cursor-default">
          <div className="inline-flex items-center gap-2 bg-muted border border-border px-3 py-1 mb-4">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Three steps to
            <span className="text-primary"> secure your assets</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get from zero to full security visibility in minutes, not weeks.
          </p>
        </div>

        {/* Horizontal Stepper */}
        <div className="reveal reveal-delay-1 max-w-2xl mx-auto mb-16">
          {/* The row: [btn]---line---[btn]---line---[btn] */}
          <div className="flex items-center">
            {steps.map((step, i) => {
              const isActive = active === i;
              const isPast = active > i;

              return (
                <div key={step.step} className="contents">
                  {/* Step button + label */}
                  <div className="flex flex-col items-center shrink-0">
                    <button
                      onClick={() => goTo(i)}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center font-black text-sm transition-all border-2 bg-background",
                        isActive || isPast
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      {step.step}
                    </button>
                    <p
                      className={cn(
                        "mt-3 text-[10px] sm:text-xs font-bold text-center w-20 sm:w-24 leading-tight transition-colors",
                        isActive || isPast ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </p>
                  </div>

                  {/* Connecting line — only between buttons */}
                  {i < steps.length - 1 && (
                    <div className="h-[2px] flex-1 min-w-[12px] sm:min-w-[24px] bg-border/40 mx-1 sm:mx-4 self-start mt-6 relative">
                      {/* Past segment — fully filled */}
                      {isPast && <div className="absolute inset-0 bg-primary w-full" />}
                      {/* Active segment — animated */}
                      {isActive && (
                        <div
                          key={barKey}
                          className={cn(
                            "absolute inset-0 step-progress-bar bg-primary",
                            paused && "paused",
                          )}
                          style={{ "--step-duration": `${STEP_DURATION}s` } as React.CSSProperties}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active step detail card — pause only on hover here */}
        <div
          className="reveal reveal-delay-2 relative max-w-4xl mx-auto"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            key={active}
            className="relative border border-border bg-card p-6 sm:p-8 md:p-12 animate-fade-in-up overflow-hidden shadow-xl"
          >
            {/* Giant watermark number */}
            <div className="absolute -bottom-8 -right-4 pointer-events-none select-none opacity-[0.03]">
              <span className="text-[180px] sm:text-[240px] font-black leading-none text-foreground tracking-tighter">
                {current.step}
              </span>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              {/* Icon */}
              <div className="flex-shrink-0 h-16 w-16 sm:h-20 sm:w-20 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <current.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center bg-primary text-primary-foreground text-xs font-black">
                    {current.step}
                  </span>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    {current.title}
                  </h3>
                </div>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  {current.description}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="absolute top-4 right-6 hidden sm:block">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest transition-colors",
                  paused ? "text-primary" : "text-muted-foreground/40",
                )}
              >
                {paused ? "Paused" : "Auto"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
