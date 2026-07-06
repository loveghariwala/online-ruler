"use client";

import { Ruler } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen relative items-center justify-center p-4 bg-slate-950 text-slate-100 animate-pulse">
      {/* Background gradient orbs */}
      <div className="bg-gradient-orb bg-gradient-orb-1 opacity-20" />
      <div className="bg-gradient-orb bg-gradient-orb-2 opacity-20" />

      <div className="relative z-10 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto animate-pulse-glow">
          <Ruler className="w-8 h-8 text-accent animate-spin" />
        </div>
        <div className="text-sm font-semibold text-accent tracking-wider uppercase">
          Loading RealOnlineRuler...
        </div>
      </div>
    </div>
  );
}
