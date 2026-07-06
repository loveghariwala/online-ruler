"use client";

import React from "react";
import { Monitor, MousePointer2, Scaling, ArrowRight, ShieldCheck } from "lucide-react";

export default function HowToUseRuler() {
  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          How to Measure <span className="text-accent">Accurately</span>
        </h2>
        <p className="text-muted-light max-w-xl mx-auto text-sm sm:text-base">
          Our virtual ruler uses your screen's precise pixel density. Follow these 3 simple steps to get real-world scale measurements directly on your display.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Step 1 */}
        <div className="glass-light rounded-2xl p-6 relative group overflow-hidden transition-all hover:bg-white/[0.03] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-accent/10 transition-colors" />
          
          <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(var(--accent-rgb),0.15)]">
            <Monitor className="w-6 h-6 text-accent" />
          </div>
          
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent text-slate-950 text-xs flex items-center justify-center">1</span>
            Calibrate Screen
          </h3>
          <p className="text-sm text-muted-light leading-relaxed mb-6">
            Click the "Calibrate" button. Hold a standard credit card, coin, or A4 paper to your screen and adjust the slider until the virtual object matches perfectly.
          </p>

          <div className="w-full h-32 bg-slate-950/50 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden">
             {/* Visual Diagram: Calibration */}
             <div className="w-3/4 h-2 bg-white/10 rounded-full absolute top-6" />
             <div className="w-24 h-16 border-2 border-accent/50 rounded-md relative flex items-center justify-center animate-pulse-glow">
                <div className="w-4 h-4 bg-accent/30 rounded-full animate-ping" />
             </div>
             <div className="absolute bottom-4 right-4 flex items-center gap-1 text-[10px] text-accent font-semibold">
               <Scaling className="w-3 h-3" /> MATCH SIZE
             </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="glass-light rounded-2xl p-6 relative group overflow-hidden transition-all hover:bg-white/[0.03] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-amber/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-accent-amber/10 transition-colors" />
          
          <div className="w-12 h-12 rounded-xl bg-accent-amber/15 border border-accent-amber/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(var(--accent-amber-rgb),0.15)]">
            <MousePointer2 className="w-6 h-6 text-accent-amber" />
          </div>
          
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-amber text-slate-950 text-xs flex items-center justify-center">2</span>
            Place & Align
          </h3>
          <p className="text-sm text-muted-light leading-relaxed mb-6">
            Gently place the object you want to measure onto your screen against the ruler ticks. Drag the <span className="text-accent-red font-semibold">red</span> and <span className="text-accent font-semibold">blue</span> indicator lines.
          </p>

          <div className="w-full h-32 bg-slate-950/50 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden">
             {/* Visual Diagram: Measure lines */}
             <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-md flex items-center justify-center text-xs text-white/40 shadow-xl">
               Real Object
             </div>
             {/* Indicator lines */}
             <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-accent shadow-[0_0_8px_var(--accent)] transition-all z-10" />
             <div className="absolute top-0 bottom-0 right-10 w-0.5 bg-accent-red shadow-[0_0_8px_var(--accent-red)] transition-all z-10" />
             
             {/* Mouse cursor icon near line */}
             <MousePointer2 className="w-4 h-4 text-white absolute bottom-4 right-8 z-20" />
          </div>
        </div>

        {/* Step 3 */}
        <div className="glass-light rounded-2xl p-6 relative group overflow-hidden transition-all hover:bg-white/[0.03] hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-green/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-accent-green/10 transition-colors" />
          
          <div className="w-12 h-12 rounded-xl bg-accent-green/15 border border-accent-green/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(var(--accent-green-rgb),0.15)]">
            <ShieldCheck className="w-6 h-6 text-accent-green" />
          </div>
          
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent-green text-slate-950 text-xs flex items-center justify-center">3</span>
            Read Measurement
          </h3>
          <p className="text-sm text-muted-light leading-relaxed mb-6">
            The precise distance between the lines is calculated automatically. View the result in centimeters, millimeters, or inches on the floating panel.
          </p>

          <div className="w-full h-32 bg-slate-950/50 rounded-xl border border-white/5 relative flex items-center justify-center overflow-hidden">
             {/* Visual Diagram: Result panel */}
             <div className="bg-surface border border-accent/20 rounded-lg p-3 shadow-[0_4px_20px_rgba(var(--accent-rgb),0.1)] min-w-[140px]">
               <div className="text-[10px] text-muted-light uppercase tracking-wider mb-1">Distance</div>
               <div className="flex items-end gap-1.5 text-accent font-bold">
                 <span className="text-2xl leading-none">14.5</span>
                 <span className="text-sm mb-0.5">cm</span>
               </div>
               <div className="h-px bg-border my-2" />
               <div className="text-xs text-muted font-mono">145 mm</div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
