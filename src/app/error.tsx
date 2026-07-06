"use client";

import { useEffect } from "react";
import { Ruler, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen relative items-center justify-center p-4 bg-slate-950 text-slate-100">
      {/* Background gradient orbs */}
      <div className="bg-gradient-orb bg-gradient-orb-1 opacity-20" />
      <div className="bg-gradient-orb bg-gradient-orb-2 opacity-20" />

      <div className="glass relative z-10 w-full max-w-md rounded-2xl p-8 text-center space-y-6 animate-fade-in-up">
        <div className="w-14 h-14 rounded-2xl bg-accent-red/15 border border-accent-red/20 flex items-center justify-center mx-auto animate-pulse-glow">
          <Ruler className="w-8 h-8 text-accent-red" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-red text-accent-red">500</h1>
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p className="text-sm text-muted-light leading-relaxed">
            An unexpected application error occurred (505 / Internal Server Error).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-accent border border-accent/25 text-slate-950 font-semibold text-sm hover:opacity-90 transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 font-semibold text-sm hover:bg-white/10 transition-all shadow-lg"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
