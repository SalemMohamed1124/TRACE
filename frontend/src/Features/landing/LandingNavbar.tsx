"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { TraceLogo } from "@/components/layout/TraceLogo";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/ModeToggle";

export function LandingNavbar({ authed }: { authed: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/60 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <TraceLogo />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </a>
          <a
            href="#scan-types"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Scan Types
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {authed ? (
            <Link
              href="/overview"
              className="text-sm font-semibold text-primary-foreground bg-primary px-5 py-2.5 transition-all"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-primary-foreground bg-primary px-5 py-2.5"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button & Mode Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ModeToggle />
          <button
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-6 pb-6 animate-fade-in">
          <div className="flex flex-col gap-4 pt-2">
            <a
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#scan-types"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Scan Types
            </a>
            <div className="flex gap-3 pt-2">
              {authed ? (
                <Link
                  href="/overview"
                  className="flex-1 text-center text-sm font-semibold text-primary-foreground bg-primary px-4 py-2.5"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex-1 text-center text-sm font-medium text-muted-foreground border border-border px-4 py-2.5 hover:bg-muted"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="flex-1 text-center text-sm font-semibold text-primary-foreground bg-primary px-4 py-2.5"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
