"use client";

import { useState } from "react";
import { Bug, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { scanTypes } from "./constants";
import { useReveal } from "@/hooks/useReveal";

export function LandingScanTypes() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const revealRef = useReveal();

  return (
    <section id="scan-types" ref={revealRef as React.RefObject<HTMLElement>} className="relative py-24 md:py-32">

      <div className="reveal relative z-10 max-w-5xl mx-auto px-6 mb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-muted border border-border px-3 py-1 mb-4">
          <Bug className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Scan Coverage
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Unmatched
          <span className="text-primary"> scan depth</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          From lightning-fast recon to deep OWASP Top 10 automated exploitation, TRACE has you covered.
        </p>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col gap-6">
        {scanTypes.map((type, index) => {
          const allChecks = [...type.checks, ...type.checks, ...type.checks];
          const isPaused = hoveredIndex === index;
          const delayClass = `reveal-delay-${index + 1}`;

          return (
            <div key={type.name} className={cn("reveal border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors duration-300", delayClass)}>

              {/* Card Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 md:px-6 py-5 border-b border-border/60">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{type.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-lg">{type.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 border border-primary/20 flex-shrink-0 ml-[56px] sm:ml-0 self-start sm:self-auto">
                  <Clock className="h-3 w-3" />
                  {type.time}
                </div>
              </div>

              {/* Marquee Strip — pause on hover of this area only */}
              <div
                className="relative overflow-hidden py-4 bg-muted/10 cursor-default"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Fade overlays */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

                <div
                  className={cn(
                    "flex w-max hover:[animation-play-state:paused]",
                    index % 2 === 0 ? "animate-marquee" : "animate-marquee-reverse",
                  )}
                  style={{ 
                    animationPlayState: isPaused ? "paused" : "running",
                    // Normalize speed: more items = longer duration
                    animationDuration: `${Math.max(type.checks.length * 2.5, 20)}s` 
                  }}
                >
                  {/* Two identical blocks to create a seamless infinite loop when translating -50% */}
                  {[...Array(2)].map((_, arrayIndex) => (
                    <div key={arrayIndex} className="flex gap-3 pr-3">
                      {type.checks.map((check, i) => (
                        <div
                          key={`${check}-${i}`}
                          className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border/50 px-4 py-2 flex-shrink-0 rounded-lg shadow-sm"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-xs font-semibold text-foreground/90 whitespace-nowrap tracking-wide">
                            {check}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
