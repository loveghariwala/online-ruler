import React from "react";
import Link from "next/link";
import { Ruler, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | RealOnlineRuler",
  description: "Read the Terms of Service for RealOnlineRuler. Simple, straightforward, open-source friendly terms.",
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-muted-light max-w-xl mx-auto">
            Last Updated: July 6, 2026. Simple terms for using a simple utility tool.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-accent">1. Terms of Use</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              By accessing and using RealOnlineRuler, you agree to comply with and be bound by these simple terms of service. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">2. Disclaimer of Accuracy</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              RealOnlineRuler is a digital utility tool designed to help you estimate dimensions and measure objects directly on your screen. While we make every effort to provide pixel-perfect measurements after calibration, screen rulers are inherently dependent on the accuracy of your screen hardware, calibration reference, and browser scaling. We are not responsible for any measurement deviations or errors resulting from the use of this tool for industrial, commercial, architectural, or safety critical purposes.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">3. License</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              Our website code, layouts, templates, and designs are protected by copyright. You may use our service for personal or professional measurement purposes free of charge. You may not frame, copy, reproduce, mirror, or republish the web application without written consent from our team.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">4. Modifications</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the ruler application or edit these terms at any time without notice. Your continued use of the website constitutes acceptance of the modified terms.
            </p>
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
