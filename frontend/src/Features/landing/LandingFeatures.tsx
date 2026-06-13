"use client";

import { Zap } from "lucide-react";
import { features } from "./constants";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

export function LandingFeatures() {
  const ref = useReveal();

  return (
    <section
      id="features"
      ref={ref as React.RefObject<HTMLElement>}
      className="relative py-24 md:py-32 bg-muted/20"
    >
      {/* Subtle top/bottom border lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 reveal">
          <div className="inline-flex items-center gap-2 bg-background border border-border px-3 py-1 mb-4">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Features
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need for
            <span className="text-primary"> comprehensive security</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From automated scanning to AI-powered analysis, TRACE gives you the tools to identify, prioritize, and fix vulnerabilities across your entire attack surface.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={cn(
                "reveal bg-background group relative flex flex-col p-7 overflow-hidden transition-colors duration-300 hover:bg-muted/40",
                `reveal-delay-${Math.min(i + 1, 6)}`
              )}
            >
              {/* Glow spot on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-2xl rounded-full -translate-x-8 -translate-y-8" />
              </div>

              {/* Icon */}
              <div className="relative z-10 mb-5">
                <div className="h-11 w-11 flex items-center justify-center bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 flex-1">
                <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Bottom accent line on hover */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-primary group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
