"use client";

import React, { useState, useEffect } from "react";
import { Settings2, Minus, Plus, Info } from "lucide-react";
import {
  CALIBRATION_OBJECTS,
  DEVICE_PRESETS,
  type CalibrationObject,
} from "@/lib/constants";

interface CalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  ppi: number;
  onPpiChange: (ppi: number) => void;
}

export default function CalibratorModal({
  isOpen,
  onClose,
  ppi,
  onPpiChange,
}: CalibratorModalProps) {
  const [activeTab, setActiveTab] = useState<"auto" | "object" | "presets" | "diagonal">("auto");
  const [selectedObj, setSelectedObj] = useState<CalibrationObject>(
    CALIBRATION_OBJECTS[0]
  );
  const [sliderPx, setSliderPx] = useState(() => {
    const widthInches = selectedObj.widthMm / 25.4;
    return Math.round(widthInches * ppi);
  });

  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1000
  );

  // Preset Selection state
  const [presetCategory, setPresetCategory] = useState<"All" | "Laptop" | "Phone" | "Tablet" | "Monitor">("All");

  // Diagonal Input state
  const [diagonalInches, setDiagonalInches] = useState("15.6");
  const [resW, setResW] = useState("1920");
  const [resH, setResH] = useState("1080");

  // Auto-detect state
  const [autoStatus, setAutoStatus] = useState<"detecting" | "success" | "failed">("detecting");
  const [detectedPpi, setDetectedPpi] = useState<number | null>(null);
  const [detectedName, setDetectedName] = useState<string>("");

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeTab === "auto") {
      // Simple simulation of detection delay for UX
      const timer = setTimeout(() => {
        try {
          const dpr = window.devicePixelRatio || 1;
          const w = window.screen.width * dpr;
          const h = window.screen.height * dpr;
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          
          let estPpi = 96 * dpr; // Default fallback estimate
          let estName = "Standard Desktop Display (Estimated)";
          
          if (isMobile) {
            estName = "Mobile Device (Estimated)";
            estPpi = 460; // Generic high density phone fallback
          }

          // Try to match exact Apple resolution knowns
          if (!isMobile) {
            if ((w === 2560 && h === 1664) || (w === 1664 && h === 2560)) {
              estName = "MacBook Air 13.6\" (M2/M3)";
              estPpi = 224;
            } else if ((w === 3024 && h === 1964) || (w === 1964 && h === 3024)) {
              estName = "MacBook Pro 14\" (M1/M2/M3)";
              estPpi = 254;
            } else if ((w === 3456 && h === 2234) || (w === 2234 && h === 3456)) {
              estName = "MacBook Pro 16\" (M1/M2/M3)";
              estPpi = 254;
            } else if (w === 3840 && h === 2160) {
              estName = "Generic 27\" Monitor (4K)";
              estPpi = 163;
            } else if (w === 2560 && h === 1440) {
              estName = "Generic 27\" Monitor (1440p)";
              estPpi = 109;
            } else if (w === 1920 && h === 1080) {
              estName = "Generic 24\" Monitor (1080p)";
              estPpi = 92;
            }
          } else {
             if (w === 1170 && h === 2532) {
               estName = "iPhone 13 / 14";
               estPpi = 460;
             } else if (w === 1290 && h === 2796) {
               estName = "iPhone 14 / 15 Pro Max";
               estPpi = 460;
             }
          }

          setDetectedPpi(estPpi);
          setDetectedName(estName);
          setAutoStatus("success");
        } catch {
          setAutoStatus("failed");
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleSliderChange = (newPx: number) => {
    setSliderPx(newPx);
    const widthInches = selectedObj.widthMm / 25.4;
    const newPpi = newPx / widthInches;
    onPpiChange(Math.round(newPpi * 100) / 100);
  };

  const applyDiagonalPpi = () => {
    const diag = parseFloat(diagonalInches);
    const w = parseFloat(resW);
    const h = parseFloat(resH);
    if (!isNaN(diag) && !isNaN(w) && !isNaN(h) && diag > 0) {
      const diagPx = Math.sqrt(w * w + h * h);
      const calculatedPpi = diagPx / diag;
      const roundedPpi = Math.round(calculatedPpi * 100) / 100;
      onPpiChange(roundedPpi);
      const widthInches = selectedObj.widthMm / 25.4;
      setSliderPx(Math.round(widthInches * roundedPpi));
    }
  };

  const isCircular =
    selectedObj.id === "us-quarter" ||
    selectedObj.id === "euro-1" ||
    selectedObj.id === "inr-10";

  const isTooWide = sliderPx > windowWidth - 64;

  const renderVisualObject = (id: string, widthPx: number) => {
    const isCircularObj =
      id === "us-quarter" || id === "euro-1" || id === "inr-10";

    if (id === "credit-card") {
      return (
        <div
          className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 dark:from-slate-900 dark:via-slate-950 dark:to-black rounded-xl shadow-2xl flex flex-col justify-between p-4 border border-white/10 select-none overflow-hidden transition-all duration-200"
          style={{ width: `${widthPx}px`, height: `${Math.round(widthPx * 0.63)}px` }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start shrink-0">
            <div className="w-8 h-6 rounded bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border border-amber-600/30 flex flex-col justify-between p-1">
              <div className="h-[1px] bg-amber-700/40 w-full" />
              <div className="h-[1px] bg-amber-700/40 w-full" />
              <div className="h-[1px] bg-amber-700/40 w-full" />
            </div>
            <div className="text-[8px] font-bold text-accent/80 tracking-wider">PRECISE</div>
          </div>
          <div className="space-y-1 font-mono text-[9px] tracking-widest text-slate-400/90 uppercase">
            <div>•••• •••• •••• ••••</div>
            <div className="flex justify-between text-[6px]">
              <span>RealOnlineRuler</span>
              <span>08/29</span>
            </div>
          </div>
        </div>
      );
    }

    if (isCircularObj) {
      const isGoldInner = id === "inr-10" || id === "euro-1";
      const coinSymbol = id === "us-quarter" ? "25¢" : id === "euro-1" ? "1 €" : "₹10";

      return (
        <div
          className="rounded-full shadow-2xl border-4 border-double border-slate-300 dark:border-slate-500 flex items-center justify-center select-none transition-all duration-200 overflow-hidden relative animate-pulse-glow"
          style={{
            width: `${widthPx}px`,
            height: `${widthPx}px`,
            background: isGoldInner
              ? "radial-gradient(circle, #d97706 60%, #cbd5e1 65%)"
              : "radial-gradient(circle, #cbd5e1 70%, #94a3b8 90%)"
          }}
        >
          <div className="absolute inset-1.5 border border-black/5 rounded-full pointer-events-none" />
          <div className="text-center font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm flex flex-col items-center">
            <span className="text-[7px] uppercase tracking-wider opacity-60 font-semibold text-slate-900 dark:text-slate-300">ACTUAL</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-50">{coinSymbol}</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative bg-white dark:bg-slate-100 rounded shadow-lg flex flex-col justify-between p-4 border border-slate-200 select-none transition-all duration-200"
        style={{ width: `${widthPx}px`, height: `${Math.round(widthPx * 0.7)}px` }}
      >
        <div className="space-y-1.5 w-full">
          <div className="h-1 bg-slate-300 rounded w-1/3" />
          <div className="h-1 bg-slate-200 rounded w-3/4" />
          <div className="h-1 bg-slate-200 rounded w-5/6" />
          <div className="h-1 bg-slate-200 rounded w-2/3" />
        </div>
        <div className="text-[7px] text-slate-400 font-mono flex justify-between items-center mt-2">
          <span>{selectedObj.name}</span>
          <span>1:1 Size</span>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="glass relative z-10 w-full rounded-2xl p-6 animate-fade-in-up flex flex-col transition-all duration-300 max-h-[calc(100vh-2rem)]"
        style={{
          maxWidth: activeTab === "object" ? `min(calc(100vw - 32px), ${isCircular ? 480 : Math.max(480, sliderPx + 64)}px)` : "480px"
        }}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-accent" />
            Screen Calibration
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors text-xl leading-none p-1 cursor-pointer"
            aria-label="Close calibration"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-border/20 mb-4 shrink-0 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              setActiveTab("auto");
              setAutoStatus("detecting");
            }}
            className={`flex-1 min-w-[100px] pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "auto" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
              }`}
          >
            ✨ Auto-detect
          </button>
          <button
            onClick={() => setActiveTab("object")}
            className={`flex-1 min-w-[100px] pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "object" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
              }`}
          >
            💳 Real Object
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 min-w-[110px] pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "presets" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
              }`}
          >
            💻 Device Presets
          </button>
          <button
            onClick={() => setActiveTab("diagonal")}
            className={`flex-1 min-w-[100px] pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "diagonal" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
              }`}
          >
            📐 Screen Size
          </button>
        </div>

        {/* Scrollable middle content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 min-h-0 custom-scrollbar pb-1">
          {activeTab === "auto" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-light">
                We&apos;ll automatically try to detect your screen resolution and device type to estimate the correct PPI.
              </p>

              <div className="bg-surface/50 border border-border-light rounded-xl p-6 text-center space-y-4 min-h-[200px] flex flex-col items-center justify-center">
                {autoStatus === "detecting" && (
                  <div className="space-y-3">
                    <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin mx-auto" />
                    <div className="text-sm font-medium text-foreground">Detecting display...</div>
                  </div>
                )}
                {autoStatus === "success" && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div className="w-12 h-12 bg-accent-green/10 text-accent-green rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground mb-1">{detectedName}</div>
                      <div className="text-sm text-muted">Estimated Density: <span className="text-foreground font-mono font-semibold">{detectedPpi} PPI</span></div>
                    </div>
                    <button
                      onClick={() => {
                        if (detectedPpi) onPpiChange(detectedPpi);
                        onClose();
                      }}
                      className="mt-2 w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      Apply Calibration
                    </button>
                  </div>
                )}
                {autoStatus === "failed" && (
                  <div className="space-y-3">
                    <div className="text-accent-amber mb-2">⚠️</div>
                    <div className="text-sm font-medium text-foreground">Detection failed.</div>
                    <div className="text-xs text-muted">Please try selecting your device manually from the presets.</div>
                    <button onClick={() => setActiveTab("presets")} className="text-sm text-accent hover:underline mt-2">
                      Go to Device Presets
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "object" && (
            <>
              <p className="text-sm text-muted-light">
                Place a real object on your screen and adjust the slider until the
                on-screen shape matches your physical object exactly.
              </p>

              {/* Object selector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CALIBRATION_OBJECTS.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => {
                      setSelectedObj(obj);
                      const widthInches = obj.widthMm / 25.4;
                      setSliderPx(Math.round(widthInches * ppi));
                    }}
                    className={`btn-glass rounded-lg px-3 py-2.5 text-left text-xs transition-all ${selectedObj.id === obj.id
                      ? "border-accent bg-accent/10 text-accent font-semibold"
                      : "border-border-light bg-surface/50 text-muted hover:text-foreground"
                      } border cursor-pointer`}
                  >
                    <span className="text-base mr-1">{obj.emoji}</span>
                    <span className="font-medium">{obj.name}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Warning if selected object exceeds screen width */}
              {isTooWide && (
                <div className="p-3 rounded-lg bg-accent-amber/15 border border-accent-amber/30 text-accent-amber text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    This object is wider than your screen. Please calibrate using a credit card or coin.
                  </span>
                </div>
              )}

              {/* Visual representation */}
              <div className="flex items-center justify-center min-h-[140px] border border-dashed border-border-light rounded-xl bg-surface-light/35 p-4 overflow-hidden">
                {renderVisualObject(selectedObj.id, sliderPx)}
              </div>

              {/* Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-muted mb-2 font-mono">
                  <span>Smaller</span>
                  <span className="text-accent font-semibold">
                    {sliderPx}px → {Math.round(ppi)} PPI
                  </span>
                  <span>Larger</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSliderChange(Math.max(20, sliderPx - 1))}
                    className="btn-glass border border-border-light rounded-lg p-1.5 text-muted-light hover:text-foreground cursor-pointer"
                    aria-label="Decrease size"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min={20}
                    max={800}
                    value={sliderPx}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    className="calibrator-slider flex-1"
                    aria-label="Calibrate size"
                  />
                  <button
                    onClick={() => handleSliderChange(Math.min(800, sliderPx + 1))}
                    className="btn-glass border border-border-light rounded-lg p-1.5 text-muted-light hover:text-foreground cursor-pointer"
                    aria-label="Increase size"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-muted text-center italic">
                {selectedObj.description}
              </p>
            </>
          )}

          {activeTab === "presets" && (
            <>
              <p className="text-sm text-muted-light">
                Select your device from our database to set the exact factory calibrated PPI automatically.
              </p>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-1">
                {(["All", "Laptop", "Phone", "Tablet", "Monitor"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPresetCategory(cat)}
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md border transition-all cursor-pointer ${presetCategory === cat
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border-light text-muted hover:text-foreground"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Presets List */}
              <div className="max-h-[220px] overflow-y-auto border border-border-light rounded-xl bg-surface-light/20 divide-y divide-border-light custom-scrollbar">
                {DEVICE_PRESETS.filter(p => presetCategory === "All" || p.category === presetCategory).map((dev) => (
                  <button
                    key={dev.name}
                    onClick={() => {
                      onPpiChange(dev.ppi);
                      const widthInches = selectedObj.widthMm / 25.4;
                      setSliderPx(Math.round(widthInches * dev.ppi));
                    }}
                    className={`w-full px-4 py-3 text-left flex justify-between items-center hover:bg-white/[0.03] transition-colors cursor-pointer text-xs ${Math.abs(ppi - dev.ppi) < 0.1 ? "text-accent font-semibold bg-accent/5" : "text-foreground"
                      }`}
                  >
                    <div>
                      <div className="font-medium">{dev.name}</div>
                      <div className="text-[10px] text-muted font-normal mt-0.5">{dev.category}</div>
                    </div>
                    <div className="font-mono text-[10px] sm:text-xs bg-surface border border-border-light px-2 py-0.5 rounded-md">
                      {dev.ppi} PPI
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {activeTab === "diagonal" && (
            <>
              <p className="text-sm text-muted-light">
                Enter your physical screen diagonal size and current resolution to calculate screen density.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="diag-input" className="block text-xs font-semibold text-muted mb-1.5">
                    Screen Diagonal (Inches)
                  </label>
                  <input
                    id="diag-input"
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={diagonalInches}
                    onChange={(e) => {
                      setDiagonalInches(e.target.value);
                    }}
                    className="w-full bg-surface-light/40 border border-border-light focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-foreground font-semibold"
                    placeholder="e.g. 15.6, 27, 6.1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="res-w-input" className="block text-xs font-semibold text-muted mb-1.5">
                      Resolution Width (px)
                    </label>
                    <input
                      id="res-w-input"
                      type="number"
                      value={resW}
                      onChange={(e) => {
                        setResW(e.target.value);
                      }}
                      className="w-full bg-surface-light/40 border border-border-light focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-semibold"
                      placeholder="e.g. 1920"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-h-input" className="block text-xs font-semibold text-muted mb-1.5">
                      Resolution Height (px)
                    </label>
                    <input
                      id="res-h-input"
                      type="number"
                      value={resH}
                      onChange={(e) => {
                        setResH(e.target.value);
                      }}
                      className="w-full bg-surface-light/40 border border-border-light focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-semibold"
                      placeholder="e.g. 1080"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyDiagonalPpi}
                  className="w-full py-2.5 rounded-xl border border-accent/20 bg-accent/10 hover:bg-accent/15 text-accent font-semibold text-xs transition-all cursor-pointer"
                >
                  Calculate & Apply ({(Math.round((Math.sqrt(parseFloat(resW || "0") ** 2 + parseFloat(resH || "0") ** 2) / (parseFloat(diagonalInches) || 1)) * 100) / 100) || 0} PPI)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="pt-4 border-t border-border/20 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-accent border border-accent/25 text-surface font-semibold text-sm hover:opacity-90 transition-all cursor-pointer shadow-lg"
          >
            Done — Save Calibration ({Math.round(ppi)} PPI)
          </button>
        </div>
      </div>
    </div>
  );
}
