"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

export function LandingCTA() {
  const ref = useReveal();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="relative py-24 md:py-40 overflow-hidden"
    >
      {/* Animated ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 blur-[120px] rounded-full animate-glow-pulse" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">

        {/* Badge */}
        <div className="reveal inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-4 py-1.5 mb-8">
          <div className="h-1.5 w-1.5 bg-primary animate-pulse rounded-full" />
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            Get Started Today
          </span>
        </div>

        {/* Heading */}
        <h2 className="reveal reveal-delay-1 text-4xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tighter mb-6">
          Ready to secure your
          <br />
          <span className="text-primary">application?</span>
        </h2>

        <p className="reveal reveal-delay-2 text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Start scanning in minutes. No credit card required. Get actionable
          security insights today with our AI-powered platform.
        </p>

        {/* CTAs */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/register"
            className="group relative flex items-center gap-2 text-base font-bold text-primary-foreground bg-primary px-10 py-4 transition-all hover:bg-primary/90 overflow-hidden"
          >
            {/* Shimmer sweep on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative">Get Started Free</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-base font-medium text-muted-foreground border border-border px-10 py-4 hover:bg-muted hover:text-foreground transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* Trust row */}
        <div className="reveal reveal-delay-4 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            "No credit card",
            "Setup in 2 minutes",
            "OWASP Top 10 Coverage",
            "Cancel anytime",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground"
            >
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
