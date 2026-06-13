import Link from "next/link";
import { TraceLogo } from "@/components/layout/TraceLogo";

export function LandingFooter() {
  return (
    <footer className="relative z-10 py-12 bg-background overflow-hidden">
      {/* Minimal CD Background - Right Half */}
      <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none opacity-[0.15] dark:opacity-[0.03] text-foreground">
        <svg 
          viewBox="0 0 1000 1000" 
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-[35%] w-[180%] h-[180%] animate-spin [animation-duration:25s]"
        >
          <g fill="none" stroke="currentColor" strokeWidth="60" strokeLinecap="round">
            {/* Outer Rim */}
            <circle cx="500" cy="500" r="400" />
            {/* Inner Ring */}
            <circle cx="500" cy="500" r="140" />
            {/* Center Dot */}
            <circle cx="500" cy="500" r="50" fill="currentColor" stroke="none" />
            {/* Gloss/Reflection Arcs (Math: 2 * PI * 270 = 1696.4. Dash = 350, Gap = 498.2) */}
            <circle 
              cx="500" 
              cy="500" 
              r="270" 
              strokeDasharray="350 498.2" 
              strokeDashoffset="150" 
            />
          </g>
        </svg>
        {/* Gradient fade to blend seamlessly into the left side */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/50 to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <TraceLogo nameClassName="text-base" />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered vulnerability scanning platform for modern security
              teams.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">
              Product
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#scan-types"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Scan Types
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">
              Coverage
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-muted-foreground">
                  OWASP Top 10
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  Network Security
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  SSL/TLS Analysis
                </span>
              </li>
              <li>
                <span className="text-sm text-muted-foreground">
                  DNS Security
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">
              Account
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-[10px] text-muted-foreground/60 font-medium">
            &copy; {new Date().getFullYear()} TRACE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
