"use client";

import Link from "next/link";
import { Ruler, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen relative items-center justify-center p-4 bg-slate-950 text-slate-100">
      {/* Background gradient orbs */}
      <div className="bg-gradient-orb bg-gradient-orb-1 opacity-20" />
      <div className="bg-gradient-orb bg-gradient-orb-2 opacity-20" />

      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 text-center space-y-6 animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center mx-auto animate-pulse-glow">
          <Ruler className="w-8 h-8 text-accent" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-blue text-accent">404</h1>
          <h2 className="text-xl font-bold">Page Not Found</h2>
          <p className="text-sm text-muted-light leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent border border-accent/25 text-slate-950 font-semibold text-sm hover:opacity-90 transition-all shadow-lg"
        >
          <Home className="w-4 h-4" />
          Back to Ruler Tool
        </Link>
      </div>
    </div>
  );
}
