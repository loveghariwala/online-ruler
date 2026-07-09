import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Ruler, Shield, Zap, Smartphone, ChevronLeft } from "lucide-react";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Real Online Ruler";

export const metadata: Metadata = {
  title: `About Us | ${siteName}`,
  description: "Learn about Real Online Ruler — the free, accurate online ruler calibrated to your screen. Built for precision, privacy, and speed.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100 font-sans">
      <div className="bg-gradient-orb bg-gradient-orb-1 opacity-25" />
      <div className="bg-gradient-orb bg-gradient-orb-2 opacity-25" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-accent" />
            </div>
            <span className="text-base font-bold text-slate-100">RealOnlineRuler</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Ruler
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            About RealOnlineRuler
          </h1>
          <p className="text-sm text-muted-light max-w-xl mx-auto">
            Our mission is simple: to build the most accurate, private, and frictionless metric and imperial digital measuring tools on the web.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-accent">Why We Built This</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              If you search for an &quot;online ruler&quot;, you&apos;ll find plenty of basic web tools. However, almost all of them make a fatal assumption: they assume all screens display exactly 96 Pixels Per Inch (PPI). On modern displays, PPI ranges from 80 to over 450, meaning uncalibrated online rulers are off by up to 30%.
            </p>
            <p className="text-sm text-muted-light leading-relaxed">
              RealOnlineRuler was built to solve this. By introducing precise screen calibration (card alignment, common presets, diagonal calculation) and dynamic scaling, we ensure that an inch or centimeter on your screen matches its real-world physical counterpart exactly.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-accent">Core Principles</h2>
            <div className="grid sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-accent" />
                </div>
                <h3 className="text-xs font-semibold">100% Private</h3>
                <p className="text-[11px] text-muted leading-relaxed">
                  No data ever leaves your device. We do not track you or record measurements.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-accent-green" />
                </div>
                <h3 className="text-xs font-semibold">Frictionless Experience</h3>
                <p className="text-[11px] text-muted leading-relaxed">
                  No accounts, no cookie screens, no ads, and instant load speeds.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-accent-red" />
                </div>
                <h3 className="text-xs font-semibold">Universal Layout</h3>
                <p className="text-[11px] text-muted leading-relaxed">
                  Engineered to dynamically support computers, tablets, and phones of all screen aspect ratios.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
          <span>© {new Date().getFullYear()} RealOnlineRuler. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
