import Link from "next/link";
import { ArrowRight, ShieldCheck, TerminalSquare, Github } from "lucide-react";
import { stats } from "./constants";
import CountUp from "@/components/ui/CountUp";
import { LandingTerminal } from "./LandingTerminal";
import GradientText from "@/components/ui/GradientText";

export function LandingHero() {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden pt-24 md:pt-32 pb-20">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse opacity-50 dark:opacity-30 mix-blend-screen" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse opacity-50 dark:opacity-30 mix-blend-screen"
          style={{ animationDelay: "1s" }}
        />

        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center mt-8 md:mt-0">
        {/* Main Layout Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full mb-20 text-left">
          {/* Left Column: Text & CTAs */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-10">
            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-foreground leading-[1.05] tracking-tighter mb-6 animate-fade-in-up max-w-2xl">
              Secure your apps <br />
              <GradientText
                colors={[
                  "var(--hero-grad-start)",
                  "var(--hero-grad-end)",
                  "var(--hero-grad-start)",
                  "var(--hero-grad-end)",
                  "var(--hero-grad-start)",
                ]}
                animationSpeed={6}
                showBorder={false}
                direction="diagonal"
                className="inline-block"
              >
                before attackers strike.
              </GradientText>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed animate-fade-in-up stagger-1">
              Enterprise-grade security scanning powered by{" "}
              <strong className="text-foreground">AI</strong>. Discover
              vulnerabilities, track real-time progress, and get actionable
              remediation steps instantly.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 w-full sm:w-auto animate-fade-in-up stagger-2">
              <Link
                href="/register"
                className="group relative flex items-center justify-center gap-2 text-base font-bold text-primary-foreground bg-primary px-8 py-4 w-full sm:w-auto rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] active:scale-95"
              >
                <TerminalSquare className="h-5 w-5" />
                Start Scanning
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 text-base font-medium text-foreground bg-background border border-border px-8 py-4 w-full sm:w-auto rounded-lg transition-all hover:bg-muted active:scale-95 shadow-sm"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Right Column: Terminal Container */}
          <div className="w-full max-w-xl mx-auto lg:max-w-none animate-fade-in-up stagger-3 perspective-[2000px] z-10">
            <div className="relative transform-gpu transition-transform duration-700 ease-out hover:rotate-x-2 hover:-rotate-y-2">
              <div className="relative rounded-xl overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm shadow-2xl ring-1 ring-white/10">
                <LandingTerminal />
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof / Stats */}
        <div className="w-full max-w-5xl mx-auto animate-fade-in-up stagger-5">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">
            Trusted by security teams worldwide
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-border/50 border-y border-border/50 py-8 bg-muted/10 backdrop-blur-sm ">
            {stats.map((stat, i) => {
              const isUptime = stat.label === "Uptime SLA";
              const isTime = stat.label === "Quick Scan Time";
              const isSecurity = stat.label === "Security Scripts";
              const isCategories = stat.label === "Vulnerability Categories";

              return (
                <div
                  key={stat.label}
                  className="text-center flex flex-col items-center justify-center px-4 hover:scale-105 transition-transform duration-300"
                >
                  <div className="text-3xl md:text-4xl font-black text-foreground mb-2 flex items-center justify-center tracking-tighter">
                    {isTime && (
                      <span className="text-primary mr-1 text-2xl opacity-70">
                        &lt;
                      </span>
                    )}
                    <CountUp
                      from={0}
                      to={parseFloat(stat.value.replace(/[^0-9.]/g, ""))}
                      duration={2}
                      separator=","
                      className="tabular-nums bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                    />
                    {(isSecurity || isCategories) && (
                      <span className="text-primary ml-1 text-2xl">+</span>
                    )}
                    {isUptime && (
                      <span className="text-primary ml-1 text-2xl">%</span>
                    )}
                    {isTime && (
                      <span className="text-primary ml-1 text-lg">min</span>
                    )}
                  </div>
                  <div className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase tracking-[0.15em] leading-tight max-w-[120px]">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
