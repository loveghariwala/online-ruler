"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import HowToUseRuler from "./HowToUseRuler";
import {
  Ruler,
  Settings2,
  RotateCcw,
  Move,
  Grid3X3,
  ChevronDown,
  ChevronUp,
  Shield,
  Zap,
  Smartphone,
  Copy,
  Check,
  Minus,
  Plus,
  Info,
  ArrowLeftRight,
  ArrowUpDown,
  Maximize,
  Minimize,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CALIBRATION_OBJECTS,
  UNITS,
  pxToUnit,
  inchesToFraction,
  DEFAULT_PPI,
  STORAGE_KEY_PPI,
  STORAGE_KEY_UNIT,
  type UnitType,
  type CalibrationObject,
  type DevicePreset,
  DEVICE_PRESETS,
} from "@/lib/constants";

// ─── Calibrator Modal ────────────────────────────────────────────
function CalibratorModal({
  isOpen,
  onClose,
  ppi,
  onPpiChange,
}: {
  isOpen: boolean;
  onClose: () => void;
  ppi: number;
  onPpiChange: (ppi: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<"object" | "presets" | "diagonal">("object");
  const [selectedObj, setSelectedObj] = useState<CalibrationObject>(
    CALIBRATION_OBJECTS[0]
  );
  const [sliderPx, setSliderPx] = useState(() => {
    const widthInches = selectedObj.widthMm / 25.4;
    return Math.round(widthInches * ppi);
  });

  const [windowWidth, setWindowWidth] = useState(1000);

  // Preset Selection state
  const [presetCategory, setPresetCategory] = useState<"All" | "Laptop" | "Phone" | "Tablet" | "Monitor">("All");

  // Diagonal Input state
  const [diagonalInches, setDiagonalInches] = useState("15.6");
  const [resW, setResW] = useState("1920");
  const [resH, setResH] = useState("1080");

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const widthInches = selectedObj.widthMm / 25.4;
    setSliderPx(Math.round(widthInches * ppi));
  }, [selectedObj, ppi]);

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
      onPpiChange(Math.round(calculatedPpi * 100) / 100);
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
        <div className="flex border-b border-border/20 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab("object")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "object" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            💳 Real Object
          </button>
          <button
            onClick={() => setActiveTab("presets")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "presets" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            💻 Device Presets
          </button>
          <button
            onClick={() => setActiveTab("diagonal")}
            className={`flex-1 pb-2 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === "diagonal" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            📐 Screen Size
          </button>
        </div>

        {/* Scrollable middle content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5 min-h-0 custom-scrollbar pb-1">
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
                    onClick={() => setSelectedObj(obj)}
                    className={`btn-glass rounded-lg px-3 py-2.5 text-left text-xs transition-all ${
                      selectedObj.id === obj.id
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
                    className={`px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      presetCategory === cat
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
                    }}
                    className={`w-full px-4 py-3 text-left flex justify-between items-center hover:bg-white/[0.03] transition-colors cursor-pointer text-xs ${
                      Math.abs(ppi - dev.ppi) < 0.1 ? "text-accent font-semibold bg-accent/5" : "text-foreground"
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
                  Calculate & Apply ({(Math.round((Math.sqrt(parseFloat(resW || "0")**2 + parseFloat(resH || "0")**2) / (parseFloat(diagonalInches) || 1)) * 100) / 100) || 0} PPI)
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

// ─── Measurement Display ────────────────────────────────────────
function MeasurementDisplay({
  distancePx,
  heightPx,
  ppi,
  activeUnit,
  compact,
}: {
  distancePx: number;
  heightPx?: number;
  ppi: number;
  activeUnit: UnitType;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const cmValW = pxToUnit(distancePx, ppi, "cm");
  const mmValW = pxToUnit(distancePx, ppi, "mm");
  const inValW = pxToUnit(distancePx, ppi, "in");
  const pxValW = distancePx;
  const fracStrW = inchesToFraction(inValW);

  const isBox = typeof heightPx === "number";

  const cmValH = isBox ? pxToUnit(heightPx!, ppi, "cm") : 0;
  const mmValH = isBox ? pxToUnit(heightPx!, ppi, "mm") : 0;
  const inValH = isBox ? pxToUnit(heightPx!, ppi, "in") : 0;
  const pxValH = isBox ? heightPx! : 0;
  const fracStrH = isBox ? inchesToFraction(inValH) : "";

  const primaryValueW =
    activeUnit === "cm"
      ? cmValW.toFixed(2)
      : activeUnit === "mm"
      ? mmValW.toFixed(1)
      : activeUnit === "px"
      ? Math.round(distancePx).toString()
      : inValW.toFixed(3);

  const primaryValueH = isBox
    ? activeUnit === "cm"
      ? cmValH.toFixed(2)
      : activeUnit === "mm"
      ? mmValH.toFixed(1)
      : activeUnit === "px"
      ? Math.round(heightPx!).toString()
      : inValH.toFixed(3)
    : "";

  const handleCopy = () => {
    const text = isBox
      ? `Width: ${primaryValueW}${UNITS[activeUnit].shortLabel}, Height: ${primaryValueH}${UNITS[activeUnit].shortLabel}`
      : `${primaryValueW} ${UNITS[activeUnit].shortLabel}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const getSubValuesString = (cmVal: number, mmVal: number, inVal: number, pxVal: number, fracStr: string) => {
    const parts: string[] = [];
    if (activeUnit !== "cm") parts.push(`${cmVal.toFixed(1)}cm`);
    if (activeUnit !== "mm") parts.push(`${mmVal.toFixed(0)}mm`);
    if (activeUnit !== "in") parts.push(fracStr || `${inVal.toFixed(2)}"`);
    if (activeUnit !== "px") parts.push(`${Math.round(pxVal)}px`);
    return parts.join(" / ");
  };

  if (compact) {
    if (isBox) {
      return (
        <div className="glass rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Width:</span>
              <span className="text-xl font-bold text-glow-blue text-accent tabular-nums">
                {primaryValueW}
              </span>
              <span className="text-xs text-accent/70 font-medium">
                {UNITS[activeUnit].shortLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Height:</span>
              <span className="text-xl font-bold text-glow-red text-accent-red tabular-nums">
                {primaryValueH}
              </span>
              <span className="text-xs text-accent-red/70 font-medium">
                {UNITS[activeUnit].shortLabel}
              </span>
            </div>
          </div>
          <div className="h-6 w-px bg-border-light hidden sm:block" />
          <div className="flex items-center gap-3 text-[11px] text-muted-light">
            <span>
              W: {getSubValuesString(cmValW, mmValW, inValW, pxValW, fracStrW)}
            </span>
            <span>
              H: {getSubValuesString(cmValH, mmValH, inValH, pxValH, fracStrH)}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="ml-auto text-muted-light hover:text-accent transition-colors"
            aria-label="Copy measurements"
          >
            {copied ? (
              <Check className="w-4 h-4 text-accent-green" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="glass rounded-xl px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-glow-blue text-accent tabular-nums">
            {primaryValueW}
          </span>
          <span className="text-sm text-accent/70 font-medium">
            {UNITS[activeUnit].shortLabel}
          </span>
        </div>
        <div className="h-6 w-px bg-border-light" />
        <div className="flex items-center gap-3 text-xs flex-wrap">
          {activeUnit !== "cm" && (
            <span className="text-muted-light tabular-nums">
              <span className="text-muted">CM</span> {cmValW.toFixed(2)}
            </span>
          )}
          {activeUnit !== "mm" && (
            <span className="text-muted-light tabular-nums">
              <span className="text-muted">MM</span> {mmValW.toFixed(1)}
            </span>
          )}
          {activeUnit !== "in" && (
            <span className="text-muted-light tabular-nums">
              <span className="text-muted">IN</span> {fracStrW}
            </span>
          )}
          {activeUnit !== "px" && (
            <span className="text-muted-light tabular-nums">
              <span className="text-muted">PX</span> {Math.round(pxValW)}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="ml-auto text-muted-light hover:text-accent transition-colors"
          aria-label="Copy measurement"
        >
          {copied ? (
            <Check className="w-4 h-4 text-accent-green" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  if (isBox) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">
            Box Dimensions (2D)
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted-light hover:text-accent transition-colors"
            aria-label="Copy measurements"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-accent-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied" : "Copy All"}
          </button>
        </div>

        {/* Width */}
        <div className="glass-light rounded-xl p-3">
          <div className="text-xs text-muted mb-1 font-semibold">WIDTH (W)</div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-glow-blue text-accent tabular-nums">
                {primaryValueW}
              </span>
              <span className="text-sm text-accent/70 ml-1">
                {UNITS[activeUnit].shortLabel}
              </span>
            </div>
            <div className="text-xs text-muted-light font-mono">
              {getSubValuesString(cmValW, mmValW, inValW, pxValW, fracStrW)}
            </div>
          </div>
        </div>

        {/* Height */}
        <div className="glass-light rounded-xl p-3">
          <div className="text-xs text-muted-red mb-1 font-semibold text-accent-red">HEIGHT (H)</div>
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-2xl sm:text-3xl font-bold text-glow-red text-accent-red tabular-nums">
                {primaryValueH}
              </span>
              <span className="text-sm text-accent-red/70 ml-1">
                {UNITS[activeUnit].shortLabel}
              </span>
            </div>
            <div className="text-xs text-muted-light font-mono">
              {getSubValuesString(cmValH, mmValH, inValH, pxValH, fracStrH)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          Measurement
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-light hover:text-accent transition-colors"
          aria-label="Copy measurement"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-accent-green" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Primary reading */}
      <div className="text-center mb-4">
        <span className="text-4xl sm:text-5xl font-bold text-glow-blue text-accent tabular-nums">
          {primaryValueW}
        </span>
        <span className="text-lg text-accent/70 ml-2 font-medium">
          {UNITS[activeUnit].shortLabel}
        </span>
      </div>

      {/* Secondary readings */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {activeUnit !== "cm" && (
          <div className="glass-light rounded-lg py-2 px-1">
            <div className="text-xs text-muted mb-0.5">CM</div>
            <div className="text-sm font-semibold tabular-nums">
              {cmValW.toFixed(2)}
            </div>
          </div>
        )}
        {activeUnit !== "mm" && (
          <div className="glass-light rounded-lg py-2 px-1">
            <div className="text-xs text-muted mb-0.5">MM</div>
            <div className="text-sm font-semibold tabular-nums">
              {mmValW.toFixed(1)}
            </div>
          </div>
        )}
        {activeUnit !== "in" && (
          <div className="glass-light rounded-lg py-2 px-1">
            <div className="text-xs text-muted mb-0.5">Inches</div>
            <div className="text-sm font-semibold tabular-nums">{fracStrW}</div>
          </div>
        )}
        {activeUnit !== "px" && (
          <div className="glass-light rounded-lg py-2 px-1">
            <div className="text-xs text-muted mb-0.5">Pixels</div>
            <div className="text-sm font-semibold tabular-nums">{Math.round(pxValW)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FAQ Section ────────────────────────────────────────────────
const FAQ_DATA = [
  {
    q: "Why is my online ruler inaccurate by default?",
    a: "Most browsers report a default resolution of 96 PPI (pixels per inch), which does not match most modern screens. Without proper calibration, rulers can be off by 10–30%. RealOnlineRuler solves this by letting you visually calibrate using a credit card, coin, or paper — objects with standardized sizes.",
  },
  {
    q: "How do I calibrate my screen ruler to show actual size?",
    a: "Click the 'Calibrate' button and select a reference object you have on hand (e.g., a credit card is 85.6 mm wide). Place the real object on your screen and drag the slider until the on-screen shape matches perfectly. This calculates your true PPI and is saved for future visits.",
  },
  {
    q: "Does this virtual ruler work on mobile phones?",
    a: "Yes! RealOnlineRuler is fully responsive and touch-optimized. It works on iPhones, Android phones, iPads, and tablets. The drag-to-measure cursors support touch gestures. For best results on mobile, calibrate using a coin that fits comfortably on your phone screen.",
  },
  {
    q: "What is the difference between metric (cm/mm) and imperial (inches) online rulers?",
    a: "Metric rulers use centimeters and millimeters (1 cm = 10 mm). Imperial rulers use inches and fractions (1 inch = 25.4 mm). RealOnlineRuler supports both systems simultaneously — toggle between cm, mm, and inches instantly. All three readings are always displayed.",
  },
  {
    q: "Is my privacy protected when using this online ruler?",
    a: "Absolutely. RealOnlineRuler processes everything 100% in your browser. We do not access your camera, upload images, or track your measurements. Your calibration data is saved locally on your device using localStorage — it never leaves your computer.",
  },
  {
    q: "Can I measure vertically and use this as a virtual measuring tape?",
    a: "Yes! Click the orientation toggle to switch between horizontal and vertical rulers. You can also enable the 2D Grid mode to measure both width and height simultaneously, turning your screen into a precise graph-paper grid — like a virtual measuring tape.",
  },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full max-w-3xl mx-auto" id="faq-section">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-2">
        Frequently Asked Questions
      </h2>
      <p className="text-sm text-muted text-center mb-8">
        Everything you need to know about using an online ruler accurately.
      </p>
      <div className="space-y-3">
        {FAQ_DATA.map((item, i) => (
          <div key={i} className="glass rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
              aria-expanded={openIndex === i}
              aria-controls={`faq-answer-${i}`}
              id={`faq-question-${i}`}
            >
              <span className="text-sm font-medium text-foreground pr-4">
                {item.q}
              </span>
              {openIndex === i ? (
                <ChevronUp className="w-4 h-4 text-accent shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted shrink-0" />
              )}
            </button>
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              className={`transition-all duration-300 ease-in-out ${
                openIndex === i
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0 overflow-hidden"
              }`}
            >
              <p className="px-4 pb-4 text-sm text-muted-light leading-relaxed">
                {item.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Ruler SVG ──────────────────────────────────────────────────
function RulerSVG({
  lengthPx,
  ppi,
  unit,
  side,
  thickness,
  direction = "normal",
}: {
  lengthPx: number;
  ppi: number;
  unit: UnitType;
  side: "top" | "bottom" | "left" | "right";
  thickness?: number;
  direction?: "normal" | "reverse";
}) {
  const isMm = unit === "mm";
  const isPx = unit === "px";
  const displayUnit = isMm ? "cm" : unit;

  let pxPerUnit = 0;
  if (isPx) {
    pxPerUnit = 100;
  } else {
    const unitsPerInch = UNITS[displayUnit].perInch;
    pxPerUnit = ppi / unitsPerInch;
  }

  const isHorizontal = side === "top" || side === "bottom";
  const totalUnits = Math.ceil(lengthPx / pxPerUnit);
  const th = thickness ?? 65;

  const svgW = isHorizontal ? lengthPx : th;
  const svgH = isHorizontal ? th : lengthPx;

  // Space labels dynamically based on scale density to prevent overlaps
  let labelInterval = 1;
  if (unit === "mm") {
    labelInterval = pxPerUnit >= 50 ? 2 : 5;
  } else if (unit === "cm") {
    if (pxPerUnit < 20) {
      labelInterval = 5;
    } else if (pxPerUnit < 35) {
      labelInterval = 2;
    }
  }

  const lines: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];

  for (let i = 0; i <= totalUnits; i++) {
    const pos = Math.round(i * pxPerUnit);
    if (pos > lengthPx) break;

    const actualPos = direction === "reverse" ? lengthPx - pos : pos;
    const majorLen = 38;

    // Major tick
    if (isHorizontal) {
      const y1 = side === "top" ? 0 : th;
      const y2 = side === "top" ? majorLen : th - majorLen;
      lines.push(
        <line key={`M${i}`} x1={actualPos} y1={y1} x2={actualPos} y2={y2} className="stroke-accent" strokeWidth={1.5} />
      );
      if (i > 0 && i % labelInterval === 0) {
        const ly = side === "top" ? majorLen + 16 : th - majorLen - 6;
        const labelText = isMm ? i * 10 : isPx ? i * 100 : i;
        labels.push(
          <text key={`L${i}`} x={actualPos} y={ly} textAnchor="middle" className="fill-muted font-medium" fontSize={11} fontFamily="Inter, sans-serif">{labelText}</text>
        );
      }
    } else {
      const x1 = side === "left" ? 0 : th;
      const x2 = side === "left" ? majorLen : th - majorLen;
      lines.push(
        <line key={`M${i}`} x1={x1} y1={actualPos} x2={x2} y2={actualPos} className="stroke-accent" strokeWidth={1.5} />
      );
      if (i > 0 && i % labelInterval === 0) {
        const lx = side === "left" ? majorLen + 16 : th - majorLen - 6;
        const labelText = isMm ? i * 10 : isPx ? i * 100 : i;
        labels.push(
          <text key={`L${i}`} x={lx} y={actualPos + 4} textAnchor="middle" className="fill-muted font-medium" fontSize={11} fontFamily="Inter, sans-serif">{labelText}</text>
        );
      }
    }

    // Sub-ticks
    const subDivisions = displayUnit === "in" ? 8 : 10;
    for (let j = 1; j < subDivisions; j++) {
      const subPos = Math.round(pos + (j * pxPerUnit) / subDivisions);
      if (subPos > lengthPx) break;

      const actualSubPos = direction === "reverse" ? lengthPx - subPos : subPos;
      const isMid =
        (displayUnit === "in" && j === 4) ||
        ((displayUnit === "cm" || displayUnit === "px") && j === 5);
      const isQuarter = displayUnit === "in" && (j === 2 || j === 6);
      const tickLen = isMid ? 26 : isQuarter ? 20 : 14;
      const sw = isMid ? 1 : 0.7;

      if (isHorizontal) {
        const y1 = side === "top" ? 0 : th;
        const y2 = side === "top" ? tickLen : th - tickLen;
        lines.push(
          <line key={`S${i}-${j}`} x1={actualSubPos} y1={y1} x2={actualSubPos} y2={y2} className="stroke-muted/30" strokeWidth={sw} />
        );
      } else {
        const x1 = side === "left" ? 0 : th;
        const x2 = side === "left" ? tickLen : th - tickLen;
        lines.push(
          <line key={`S${i}-${j}`} x1={x1} y1={actualSubPos} x2={tickLen} y2={actualSubPos} className="stroke-muted/30" strokeWidth={sw} />
        );
      }
    }
  }

  // Edge line
  let edgeLine: React.ReactNode = null;
  if (side === "top") {
    edgeLine = <line x1={0} y1={0} x2={lengthPx} y2={0} className="stroke-accent/30" strokeWidth={2} />;
  } else if (side === "bottom") {
    edgeLine = <line x1={0} y1={th} x2={lengthPx} y2={th} className="stroke-accent/30" strokeWidth={2} />;
  } else if (side === "left") {
    edgeLine = <line x1={0} y1={0} x2={0} y2={lengthPx} className="stroke-accent/30" strokeWidth={2} />;
  } else {
    edgeLine = <line x1={th} y1={0} x2={th} y2={lengthPx} className="stroke-accent/30" strokeWidth={2} />;
  }

  return (
    <svg width={svgW} height={svgH} className="block shrink-0">
      {edgeLine}
      {lines}
      {labels}
    </svg>
  );
}

// ─── Grid Overlay ───────────────────────────────────────────────
function GridOverlay({
  widthPx,
  heightPx,
  ppi,
  unit,
}: {
  widthPx: number;
  heightPx: number;
  ppi: number;
  unit: UnitType;
}) {
  const unitsPerInch = UNITS[unit].perInch;
  const pxPerUnit = ppi / unitsPerInch;

  const lines: React.ReactNode[] = [];

  for (let x = pxPerUnit; x < widthPx; x += pxPerUnit) {
    lines.push(
      <line key={`gv-${x}`} x1={x} y1={0} x2={x} y2={heightPx} className="stroke-muted/10" strokeWidth={0.5} />
    );
  }
  for (let y = pxPerUnit; y < heightPx; y += pxPerUnit) {
    lines.push(
      <line key={`gh-${y}`} x1={0} y1={y} x2={widthPx} y2={y} className="stroke-muted/10" strokeWidth={0.5} />
    );
  }

  return (
    <svg className="absolute inset-0 pointer-events-none" width={widthPx} height={heightPx}>
      {lines}
    </svg>
  );
}


// ─── Main Ruler Tool ────────────────────────────────────────────
const RULER_THICKNESS = 65; // px thickness for the side ruler bars

export default function RulerTool() {
  // State
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [ppi, setPpi] = useState(DEFAULT_PPI);
  const [unit, setUnit] = useState<UnitType>("cm");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">(
    "horizontal"
  );
  const [showGrid, setShowGrid] = useState(false);
  const [showCalibrator, setShowCalibrator] = useState(false);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("preciselyruler_theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("preciselyruler_theme", theme);
    } catch {
      // localStorage unavailable
    }
  }, [theme]);

  // Directional Measurement Modes
  const [measurementMode, setMeasurementMode] = useState<
    "free" | "left" | "right" | "top" | "bottom" | "box"
  >("free");

  // 1D Cursors (A and B)
  const [cursorA, setCursorA] = useState(50);
  const [cursorB, setCursorB] = useState(250);

  // 2D Box Cursors (Left, Right, Top, Bottom)
  const [cursorLeft, setCursorLeft] = useState(100);
  const [cursorRight, setCursorRight] = useState(600);
  const [cursorTop, setCursorTop] = useState(80);
  const [cursorBottom, setCursorBottom] = useState(320);

  // Zoom state (default 100%)
  const [zoom, setZoom] = useState(1.0);
  const prevZoomRef = useRef(zoom);

  // Container dimensions (unzoomed physical pixel bounds of container)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 400 });

  // Workspace dimensions (zoomed inner layout area)
  const workspaceSize = React.useMemo(() => ({
    w: Math.round(containerSize.w * zoom),
    h: Math.round(containerSize.h * zoom),
  }), [containerSize, zoom]);

  // Sync cursor coordinates when zoom changes to maintain physical alignment
  useEffect(() => {
    const prevZoom = prevZoomRef.current;
    if (prevZoom !== zoom) {
      const factor = zoom / prevZoom;
      setCursorA(c => Math.round(c * factor));
      setCursorB(c => Math.round(c * factor));
      setCursorLeft(c => Math.round(c * factor));
      setCursorRight(c => Math.round(c * factor));
      setCursorTop(c => Math.round(c * factor));
      setCursorBottom(c => Math.round(c * factor));
      prevZoomRef.current = zoom;
    }
  }, [zoom]);

  // Unified callback ref for measuring normal and fullscreen workspaces
  const activeWorkspaceRef = useRef<HTMLDivElement | null>(null);
  const setWorkspaceRef = useCallback((node: HTMLDivElement | null) => {
    activeWorkspaceRef.current = node;
    if (node) {
      const rect = node.getBoundingClientRect();
      setContainerSize({
        w: Math.round(rect.width / zoom),
        h: Math.round(rect.height / zoom),
      });
    }
  }, [zoom]);

  // Fullscreen container ref
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Drag states
  const dragRef = useRef<{
    target: "a" | "b" | "left" | "right" | "top" | "bottom" | null;
    startPos: number;
    startCursor: number;
  }>({ target: null, startPos: 0, startCursor: 0 });

  // Load saved PPI and unit from localStorage
  useEffect(() => {
    try {
      const savedPpi = localStorage.getItem(STORAGE_KEY_PPI);
      if (savedPpi) {
        setPpi(parseFloat(savedPpi));
        setIsCalibrated(true);
      }
      const savedUnit = localStorage.getItem(STORAGE_KEY_UNIT);
      if (savedUnit && (savedUnit === "cm" || savedUnit === "mm" || savedUnit === "in" || savedUnit === "px")) {
        setUnit(savedUnit);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Lock cursors based on measurementMode and active workspace dimensions
  useEffect(() => {
    if (measurementMode === "left") {
      setOrientation("horizontal");
      setCursorA(0);
      setCursorB(Math.round(workspaceSize.w * 0.4));
    } else if (measurementMode === "right") {
      setOrientation("horizontal");
      setCursorA(workspaceSize.w);
      setCursorB(Math.round(workspaceSize.w * 0.6));
    } else if (measurementMode === "top") {
      setOrientation("vertical");
      setCursorA(0);
      setCursorB(Math.round(workspaceSize.h * 0.4));
    } else if (measurementMode === "bottom") {
      setOrientation("vertical");
      setCursorA(workspaceSize.h);
      setCursorB(Math.round(workspaceSize.h * 0.6));
    } else if (measurementMode === "box") {
      // Setup initial box sizing within current boundaries
      setCursorLeft(Math.round(workspaceSize.w * 0.2));
      setCursorRight(Math.round(workspaceSize.w * 0.8));
      setCursorTop(Math.round(workspaceSize.h * 0.2));
      setCursorBottom(Math.round(workspaceSize.h * 0.8));
    }
  }, [measurementMode, workspaceSize.w, workspaceSize.h]);

  // Save PPI
  const handlePpiChange = useCallback((newPpi: number) => {
    setPpi(newPpi);
    setIsCalibrated(true);
    try {
      localStorage.setItem(STORAGE_KEY_PPI, String(newPpi));
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Save unit
  const handleUnitChange = useCallback((newUnit: UnitType) => {
    setUnit(newUnit);
    try {
      localStorage.setItem(STORAGE_KEY_UNIT, newUnit);
    } catch {
      // localStorage unavailable
    }
  }, []);

  // Measure workspace on resize or mode change
  useEffect(() => {
    const measure = () => {
      if (activeWorkspaceRef.current) {
        const rect = activeWorkspaceRef.current.getBoundingClientRect();
        setContainerSize({
          w: Math.round(rect.width / zoom),
          h: Math.round(rect.height / zoom),
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isFullscreen, measurementMode, zoom]);

  // Fullscreen API toggler
  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      const el = fullscreenRef.current;
      if (el) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
          (el as any).webkitRequestFullscreen();
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Listen for fullscreen transition events to measure workspace size accurately
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const handleFsChange = () => {
      const isFsNow = !!document.fullscreenElement;
      setIsFullscreen(isFsNow);

      // Measure workspace size after transition settles
      timer = setTimeout(() => {
        if (activeWorkspaceRef.current) {
          const rect = activeWorkspaceRef.current.getBoundingClientRect();
          setContainerSize({
            w: Math.round(rect.width / zoom),
            h: Math.round(rect.height / zoom),
          });
        }
      }, 150);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      clearTimeout(timer);
    };
  }, [zoom]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in a form input or edit block
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "g":
          e.preventDefault();
          setShowGrid((prev) => !prev);
          break;
        case "d":
          e.preventDefault();
          setTheme((prev) => (prev === "dark" ? "light" : "dark"));
          break;
        case "c":
          e.preventDefault();
          setShowCalibrator((prev) => !prev);
          break;
        case "u":
          e.preventDefault();
          setUnit((prev) => {
            const units: UnitType[] = ["cm", "mm", "in", "px"];
            const idx = units.indexOf(prev);
            return units[(idx + 1) % units.length];
          });
          break;
        case "m":
          e.preventDefault();
          setMeasurementMode((prev) => {
            const modes: ("free" | "left" | "right" | "top" | "bottom" | "box")[] = [
              "free",
              "left",
              "right",
              "top",
              "bottom",
              "box",
            ];
            const idx = modes.indexOf(prev);
            return modes[(idx + 1) % modes.length];
          });
          break;
        case "r":
          e.preventDefault();
          setCursorA(50);
          setCursorB(250);
          setCursorLeft(Math.round(workspaceSize.w * 0.2));
          setCursorRight(Math.round(workspaceSize.w * 0.8));
          setCursorTop(Math.round(workspaceSize.h * 0.2));
          setCursorBottom(Math.round(workspaceSize.h * 0.8));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen, workspaceSize]);

  // Drag handlers for 1D mode
  const isHorizontal = orientation === "horizontal";

  // Manual numeric coordinate inputs state
  const [valAInput, setValAInput] = useState("");
  const [valBInput, setValBInput] = useState("");
  const [boxWInput, setBoxWInput] = useState("");
  const [boxHInput, setBoxHInput] = useState("");

  // Input focus tracking states to prevent overwrites during active editing
  const [isFocusA, setIsFocusA] = useState(false);
  const [isFocusB, setIsFocusB] = useState(false);
  const [isFocusW, setIsFocusW] = useState(false);
  const [isFocusH, setIsFocusH] = useState(false);

  // Sync inputs dynamically during drag operations or PPI/Zoom/Unit updates when not focused
  useEffect(() => {
    if (!isFocusA) {
      setValAInput(pxToUnit(cursorA, ppi * zoom, unit).toFixed(2));
    }
  }, [cursorA, ppi, zoom, unit, isFocusA]);

  useEffect(() => {
    if (!isFocusB) {
      setValBInput(pxToUnit(cursorB, ppi * zoom, unit).toFixed(2));
    }
  }, [cursorB, ppi, zoom, unit, isFocusB]);

  useEffect(() => {
    if (!isFocusW) {
      setBoxWInput(pxToUnit(cursorRight - cursorLeft, ppi * zoom, unit).toFixed(2));
    }
  }, [cursorLeft, cursorRight, ppi, zoom, unit, isFocusW]);

  useEffect(() => {
    if (!isFocusH) {
      setBoxHInput(pxToUnit(cursorBottom - cursorTop, ppi * zoom, unit).toFixed(2));
    }
  }, [cursorTop, cursorBottom, ppi, zoom, unit, isFocusH]);

  const handleAInputSubmit = useCallback(() => {
    const val = parseFloat(valAInput);
    if (!isNaN(val) && val >= 0) {
      const unitsPerInch = UNITS[unit].perInch;
      const px = Math.round((val * ppi * zoom) / unitsPerInch);
      const maxVal = isHorizontal ? workspaceSize.w : workspaceSize.h;
      setCursorA(Math.max(0, Math.min(maxVal, px)));
    } else {
      setValAInput(pxToUnit(cursorA, ppi * zoom, unit).toFixed(2));
    }
  }, [valAInput, cursorA, ppi, zoom, unit, isHorizontal, workspaceSize]);

  const handleBInputSubmit = useCallback(() => {
    const val = parseFloat(valBInput);
    if (!isNaN(val) && val >= 0) {
      const unitsPerInch = UNITS[unit].perInch;
      const px = Math.round((val * ppi * zoom) / unitsPerInch);
      const maxVal = isHorizontal ? workspaceSize.w : workspaceSize.h;
      setCursorB(Math.max(0, Math.min(maxVal, px)));
    } else {
      setValBInput(pxToUnit(cursorB, ppi * zoom, unit).toFixed(2));
    }
  }, [valBInput, cursorB, ppi, zoom, unit, isHorizontal, workspaceSize]);

  const handleBoxWInputSubmit = useCallback(() => {
    const val = parseFloat(boxWInput);
    if (!isNaN(val) && val >= 0) {
      const unitsPerInch = UNITS[unit].perInch;
      const px = Math.round((val * ppi * zoom) / unitsPerInch);
      const maxVal = workspaceSize.w;
      const newRight = cursorLeft + px;
      setCursorRight(Math.max(cursorLeft, Math.min(maxVal, newRight)));
    } else {
      setBoxWInput(pxToUnit(cursorRight - cursorLeft, ppi * zoom, unit).toFixed(2));
    }
  }, [boxWInput, cursorLeft, cursorRight, ppi, zoom, unit, workspaceSize]);

  const handleBoxHInputSubmit = useCallback(() => {
    const val = parseFloat(boxHInput);
    if (!isNaN(val) && val >= 0) {
      const unitsPerInch = UNITS[unit].perInch;
      const px = Math.round((val * ppi * zoom) / unitsPerInch);
      const maxVal = workspaceSize.h;
      const newBottom = cursorTop + px;
      setCursorBottom(Math.max(cursorTop, Math.min(maxVal, newBottom)));
    } else {
      setBoxHInput(pxToUnit(cursorBottom - cursorTop, ppi * zoom, unit).toFixed(2));
    }
  }, [boxHInput, cursorTop, cursorBottom, ppi, zoom, unit, workspaceSize]);

  // Keyboard micro-stepping cursor coordinates (arrow keys: 1px, Shift + arrow: 10px)
  const handleKeyDown = useCallback((
    target: "a" | "b" | "left" | "right" | "top" | "bottom",
    e: React.KeyboardEvent
  ) => {
    let step = 1;
    if (e.shiftKey) step = 10;

    let direction = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      direction = -1;
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      direction = 1;
    }

    if (direction !== 0) {
      e.preventDefault();
      const delta = direction * step;
      if (target === "a") {
        const maxVal = isHorizontal ? workspaceSize.w : workspaceSize.h;
        setCursorA(c => Math.max(0, Math.min(maxVal, c + delta)));
      } else if (target === "b") {
        const maxVal = isHorizontal ? workspaceSize.w : workspaceSize.h;
        setCursorB(c => Math.max(0, Math.min(maxVal, c + delta)));
      } else if (target === "left") {
        setCursorLeft(c => Math.max(0, Math.min(cursorRight, c + delta)));
      } else if (target === "right") {
        setCursorRight(c => Math.max(cursorLeft, Math.min(workspaceSize.w, c + delta)));
      } else if (target === "top") {
        setCursorTop(c => Math.max(0, Math.min(cursorBottom, c + delta)));
      } else if (target === "bottom") {
        setCursorBottom(c => Math.max(cursorTop, Math.min(workspaceSize.h, c + delta)));
      }
    }
  }, [isHorizontal, workspaceSize, cursorLeft, cursorRight, cursorTop, cursorBottom]);

  const getEventPos = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!activeWorkspaceRef.current) return 0;
      const rect = activeWorkspaceRef.current.getBoundingClientRect();
      const clientPos =
        "touches" in e
          ? isHorizontal
            ? e.touches[0].clientX
            : e.touches[0].clientY
          : isHorizontal
          ? e.clientX
          : e.clientY;
      return clientPos - (isHorizontal ? rect.left : rect.top);
    },
    [isHorizontal]
  );

  const handlePointerDown = useCallback(
    (target: "a" | "b", e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
      const pos = getEventPos(nativeEvent);
      dragRef.current = {
        target,
        startPos: pos,
        startCursor: target === "a" ? cursorA : cursorB,
      };

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentPos = getEventPos(moveEvent);
        const delta = currentPos - dragRef.current.startPos;
        const newVal = Math.max(
          0,
          Math.min(
            dragRef.current.startCursor + delta,
            isHorizontal ? workspaceSize.w : workspaceSize.h
          )
        );
        if (dragRef.current.target === "a") setCursorA(newVal);
        else setCursorB(newVal);
      };

      const handleUp = () => {
        dragRef.current.target = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleUp);
    },
    [cursorA, cursorB, getEventPos, isHorizontal, workspaceSize]
  );

  // Drag handlers for 2D Box mode
  const getEventPos2D = useCallback(
    (isHorizontalDrag: boolean, e: MouseEvent | TouchEvent) => {
      if (!activeWorkspaceRef.current) return 0;
      const rect = activeWorkspaceRef.current.getBoundingClientRect();
      const clientPos =
        "touches" in e
          ? isHorizontalDrag
            ? e.touches[0].clientX
            : e.touches[0].clientY
          : isHorizontalDrag
          ? e.clientX
          : e.clientY;
      return clientPos - (isHorizontalDrag ? rect.left : rect.top);
    },
    []
  );

  const handlePointerDown2D = useCallback(
    (target: "left" | "right" | "top" | "bottom", e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const nativeEvent = e.nativeEvent as MouseEvent | TouchEvent;
      const isHorizontalDrag = target === "left" || target === "right";
      const pos = getEventPos2D(isHorizontalDrag, nativeEvent);

      let startCursor = 0;
      if (target === "left") startCursor = cursorLeft;
      else if (target === "right") startCursor = cursorRight;
      else if (target === "top") startCursor = cursorTop;
      else if (target === "bottom") startCursor = cursorBottom;

      dragRef.current = {
        target,
        startPos: pos,
        startCursor,
      };

      const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentPos = getEventPos2D(isHorizontalDrag, moveEvent);
        const delta = currentPos - dragRef.current.startPos;
        const limit = isHorizontalDrag ? workspaceSize.w : workspaceSize.h;
        const newVal = Math.max(0, Math.min(dragRef.current.startCursor + delta, limit));

        if (dragRef.current.target === "left") {
          setCursorLeft(Math.min(newVal, cursorRight - 10));
        } else if (dragRef.current.target === "right") {
          setCursorRight(Math.max(newVal, cursorLeft + 10));
        } else if (dragRef.current.target === "top") {
          setCursorTop(Math.min(newVal, cursorBottom - 10));
        } else if (dragRef.current.target === "bottom") {
          setCursorBottom(Math.max(newVal, cursorTop + 10));
        }
      };

      const handleUp = () => {
        dragRef.current.target = null;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
        window.removeEventListener("touchmove", handleMove);
        window.removeEventListener("touchend", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleUp);
    },
    [cursorLeft, cursorRight, cursorTop, cursorBottom, getEventPos2D, workspaceSize]
  );

  const distancePx = Math.abs(cursorB - cursorA);
  const showCursorA = measurementMode === "free";
  const isBoxMode = measurementMode === "box";

  // ─── Workspace Inner Rendering ─────────────────────────────────
  const renderWorkspaceInner = () => {
    if (isBoxMode) {
      const boxW = cursorRight - cursorLeft;
      const boxH = cursorBottom - cursorTop;
      const midY = cursorTop + boxH / 2;
      const midX = cursorLeft + boxW / 2;

      return (
        <>
          {/* Grid */}
          {showGrid && (
            <GridOverlay
              widthPx={workspaceSize.w}
              heightPx={workspaceSize.h}
              ppi={ppi * zoom}
              unit={unit}
            />
          )}

          {/* 2D Highlight Box */}
          <div
            className="absolute bg-accent/[0.06] border border-accent/25 pointer-events-none z-10"
            style={{
              left: `${cursorLeft}px`,
              top: `${cursorTop}px`,
              width: `${boxW}px`,
              height: `${boxH}px`,
            }}
          />

          {/* Left Guide Line */}
          <div
            className="cursor-line vertical"
            style={{ left: `${cursorLeft}px`, top: 0 }}
            onMouseDown={(e) => handlePointerDown2D("left", e)}
            onTouchStart={(e) => handlePointerDown2D("left", e)}
          />
          <div
            className="drag-handle drag-handle-a animate-pulse-glow focus:ring-2 focus:ring-accent focus:outline-none"
            style={{ left: `${cursorLeft - 10}px`, top: `${midY - 10}px` }}
            onMouseDown={(e) => handlePointerDown2D("left", e)}
            onTouchStart={(e) => handlePointerDown2D("left", e)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown("left", e)}
            role="slider"
            aria-valuenow={cursorLeft}
            aria-label="Left Boundary Guide"
          >
            <Move className="w-3 h-3 text-background" />
          </div>

          {/* Right Guide Line */}
          <div
            className="cursor-line vertical"
            style={{ left: `${cursorRight}px`, top: 0 }}
            onMouseDown={(e) => handlePointerDown2D("right", e)}
            onTouchStart={(e) => handlePointerDown2D("right", e)}
          />
          <div
            className="drag-handle drag-handle-a animate-pulse-glow focus:ring-2 focus:ring-accent focus:outline-none"
            style={{ left: `${cursorRight - 10}px`, top: `${midY - 10}px` }}
            onMouseDown={(e) => handlePointerDown2D("right", e)}
            onTouchStart={(e) => handlePointerDown2D("right", e)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown("right", e)}
            role="slider"
            aria-valuenow={cursorRight}
            aria-label="Right Boundary Guide"
          >
            <Move className="w-3 h-3 text-background" />
          </div>

          {/* Top Guide Line */}
          <div
            className="cursor-line horizontal"
            style={{ top: `${cursorTop}px`, left: 0 }}
            onMouseDown={(e) => handlePointerDown2D("top", e)}
            onTouchStart={(e) => handlePointerDown2D("top", e)}
          />
          <div
            className="drag-handle drag-handle-b animate-pulse-glow focus:ring-2 focus:ring-accent focus:outline-none"
            style={{ left: `${midX - 10}px`, top: `${cursorTop - 10}px` }}
            onMouseDown={(e) => handlePointerDown2D("top", e)}
            onTouchStart={(e) => handlePointerDown2D("top", e)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown("top", e)}
            role="slider"
            aria-valuenow={cursorTop}
            aria-label="Top Boundary Guide"
          >
            <Move className="w-3 h-3 text-background" />
          </div>

          {/* Bottom Guide Line */}
          <div
            className="cursor-line horizontal"
            style={{ top: `${cursorBottom}px`, left: 0 }}
            onMouseDown={(e) => handlePointerDown2D("bottom", e)}
            onTouchStart={(e) => handlePointerDown2D("bottom", e)}
          />
          <div
            className="drag-handle drag-handle-b animate-pulse-glow focus:ring-2 focus:ring-accent focus:outline-none"
            style={{ left: `${midX - 10}px`, top: `${cursorBottom - 10}px` }}
            onMouseDown={(e) => handlePointerDown2D("bottom", e)}
            onTouchStart={(e) => handlePointerDown2D("bottom", e)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown("bottom", e)}
            role="slider"
            aria-valuenow={cursorBottom}
            aria-label="Bottom Boundary Guide"
          >
            <Move className="w-3 h-3 text-background" />
          </div>

          {/* 2D Dimensions Badge Overlay */}
          <div
            className="absolute z-30 pointer-events-none text-center"
            style={{
              left: `${midX}px`,
              top: `${midY}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="glass rounded-xl px-3 py-2 shadow-lg">
              <div className="text-[10px] text-muted uppercase font-semibold">
                Box Dimensions
              </div>
              <div className="text-sm font-bold text-accent tabular-nums whitespace-nowrap">
                W: {pxToUnit(boxW, ppi * zoom, unit).toFixed(unit === "mm" ? 1 : 2)}{" "}
                {UNITS[unit].shortLabel}
              </div>
              <div className="text-sm font-bold text-accent-red tabular-nums whitespace-nowrap">
                H: {pxToUnit(boxH, ppi * zoom, unit).toFixed(unit === "mm" ? 1 : 2)}{" "}
                {UNITS[unit].shortLabel}
              </div>
            </div>
          </div>
        </>
      );
    }

    // 1D Measurement modes (Free, Left, Right, Top, Bottom)
    return (
      <>
        {/* Grid */}
        {showGrid && (
          <GridOverlay
            widthPx={workspaceSize.w}
            heightPx={workspaceSize.h}
            ppi={ppi * zoom}
            unit={unit}
          />
        )}

        {/* Highlighted measurement zone */}
        <div
          className="absolute bg-accent/[0.06] pointer-events-none z-10"
          style={
            isHorizontal
              ? {
                  left: `${Math.min(cursorA, cursorB)}px`,
                  top: 0,
                  width: `${distancePx}px`,
                  height: "100%",
                }
              : {
                  left: 0,
                  top: `${Math.min(cursorA, cursorB)}px`,
                  width: "100%",
                  height: `${distancePx}px`,
                }
          }
        />

        {/* Cursor A line */}
        <div
          className={`cursor-line ${isHorizontal ? "vertical" : "horizontal"}`}
          style={
            isHorizontal
              ? { left: `${cursorA}px`, top: 0 }
              : { top: `${cursorA}px`, left: 0 }
          }
          onMouseDown={showCursorA ? (e) => handlePointerDown("a", e) : undefined}
          onTouchStart={showCursorA ? (e) => handlePointerDown("a", e) : undefined}
        />
        {/* Cursor A handle (only shown in Free Drag mode) */}
        {showCursorA && (
          <div
            className="drag-handle drag-handle-a focus:ring-2 focus:ring-accent focus:outline-none"
            style={
              isHorizontal
                ? { left: `${cursorA - 10}px`, bottom: "8px" }
                : { top: `${cursorA - 10}px`, right: "8px" }
            }
            onMouseDown={(e) => handlePointerDown("a", e)}
            onTouchStart={(e) => handlePointerDown("a", e)}
            tabIndex={0}
            onKeyDown={(e) => handleKeyDown("a", e)}
            role="slider"
            aria-valuenow={cursorA}
            aria-label="Cursor A Drag Handle"
          >
            <Move className="w-3 h-3 text-background" />
          </div>
        )}

        {/* Cursor B line */}
        <div
          className={`cursor-line ${isHorizontal ? "vertical" : "horizontal"}`}
          style={
            isHorizontal
              ? { left: `${cursorB}px`, top: 0 }
              : { top: `${cursorB}px`, left: 0 }
          }
          onMouseDown={(e) => handlePointerDown("b", e)}
          onTouchStart={(e) => handlePointerDown("b", e)}
        />
        <div
          className="drag-handle drag-handle-b focus:ring-2 focus:ring-accent focus:outline-none"
          style={
            isHorizontal
              ? { left: `${cursorB - 10}px`, bottom: "8px" }
              : { top: `${cursorB - 10}px`, right: "8px" }
          }
          onMouseDown={(e) => handlePointerDown("b", e)}
          onTouchStart={(e) => handlePointerDown("b", e)}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown("b", e)}
          role="slider"
          aria-valuenow={cursorB}
          aria-label="Cursor B Drag Handle"
        >
          <Move className="w-3 h-3 text-background" />
        </div>

        {/* Distance label overlay */}
        <div
          className="absolute z-30 pointer-events-none"
          style={
            isHorizontal
              ? {
                  left: `${Math.min(cursorA, cursorB) + distancePx / 2}px`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }
              : {
                  top: `${Math.min(cursorA, cursorB) + distancePx / 2}px`,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }
          }
        >
          <div className="glass rounded-lg px-3 py-1.5 text-center">
            <span className="text-lg font-bold text-accent tabular-nums">
              {pxToUnit(distancePx, ppi * zoom, unit).toFixed(unit === "mm" ? 1 : 2)}
            </span>
            <span className="text-xs text-accent/70 ml-1 font-medium">
              {UNITS[unit].shortLabel}
            </span>
          </div>
        </div>

        {/* Instructions overlay */}
        {distancePx < 5 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="glass rounded-xl px-5 py-3 text-center animate-fade-in-up">
              <Move className="w-5 h-5 text-accent mx-auto mb-1.5" />
              <p className="text-sm text-muted-light">
                Drag the{" "}
                <span className="text-accent font-semibold">blue</span> and{" "}
                <span className="text-accent-red font-semibold">red</span>{" "}
                cursors to measure
              </p>
            </div>
          </div>
        )}
      </>
    );
  };

  // ─── Toolbar (shared control layouts) ─────────────────────────
  const renderToolbar = (inFullscreen: boolean) => (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Mode Selector */}
      <div className="relative">
        <select
          id="measurement-mode"
          value={measurementMode}
          onChange={(e) => setMeasurementMode(e.target.value as any)}
          className="btn-glass border border-border-light rounded-lg px-2 py-1.5 text-xs font-semibold bg-slate-950/80 text-muted-light hover:text-foreground cursor-pointer focus:outline-none"
        >
          <option value="free">📏 Free Drag</option>
          <option value="left">👈 From Left</option>
          <option value="right">👉 From Right</option>
          <option value="top">👆 From Top</option>
          <option value="bottom">👇 From Bottom</option>
          <option value="box">📦 2D Box (W x H)</option>
        </select>
      </div>

      {/* Calibrate */}
      <button
        id="calibrate-btn"
        onClick={() => setShowCalibrator(true)}
        className={`btn-glass border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
          isCalibrated
            ? "border-accent-green/30 text-accent-green bg-accent-green/10"
            : "border-accent/50 text-accent bg-accent/10 animate-pulse-glow"
        }`}
      >
        <Settings2 className="w-3.5 h-3.5" />
        {isCalibrated ? "Calibrated" : "Calibrate"}
      </button>

      {/* Orientation toggle (disabled in Box and locked modes) */}
      {measurementMode === "free" && (
        <button
          id="orientation-toggle"
          onClick={() =>
            setOrientation((o) =>
              o === "horizontal" ? "vertical" : "horizontal"
            )
          }
          className="btn-glass border border-border-light rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 text-muted-light hover:text-foreground"
          aria-label="Toggle orientation"
        >
          {isHorizontal ? (
            <ArrowLeftRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowUpDown className="w-3.5 h-3.5" />
          )}
          {isHorizontal ? "Horizontal" : "Vertical"}
        </button>
      )}

      {/* Grid toggle */}
      <button
        id="grid-toggle"
        onClick={() => setShowGrid((g) => !g)}
        className={`btn-glass border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all ${
          showGrid
            ? "border-accent/30 text-accent"
            : "border-border-light text-muted-light hover:text-foreground"
        }`}
        aria-label="Toggle grid"
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        Grid
      </button>

      {/* Zoom Controls */}
      <div className="flex items-center rounded-lg border border-border-light overflow-hidden bg-surface/50">
        <button
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
          className="px-2 py-2 text-xs text-muted hover:text-foreground hover:bg-white/[0.03] transition-all cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 text-[10px] font-bold font-mono text-accent min-w-[42px] text-center select-none">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(3.0, z + 0.25))}
          className="px-2 py-2 text-xs text-muted hover:text-foreground hover:bg-white/[0.03] transition-all cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fullscreen manual inputs */}
      {inFullscreen && !isBoxMode && (
        <div className="flex items-center gap-1 bg-surface-light border border-border-light rounded-lg px-2 py-1 shrink-0">
          <span className="text-[10px] text-muted font-mono font-medium">A:</span>
          <input
            type="number"
            step="any"
            value={valAInput}
            onChange={(e) => setValAInput(e.target.value)}
            onFocus={() => setIsFocusA(true)}
            onBlur={() => { setIsFocusA(false); handleAInputSubmit(); }}
            onKeyDown={(e) => e.key === "Enter" && handleAInputSubmit()}
            className="w-12 bg-transparent text-xs font-semibold text-foreground focus:outline-none text-center"
            aria-label="Cursor A Position"
          />
          <span className="text-[10px] text-muted border-l border-border-light pl-1 font-mono font-medium">B:</span>
          <input
            type="number"
            step="any"
            value={valBInput}
            onChange={(e) => setValBInput(e.target.value)}
            onFocus={() => setIsFocusB(true)}
            onBlur={() => { setIsFocusB(false); handleBInputSubmit(); }}
            onKeyDown={(e) => e.key === "Enter" && handleBInputSubmit()}
            className="w-12 bg-transparent text-xs font-semibold text-foreground focus:outline-none text-center"
            aria-label="Cursor B Position"
          />
          <span className="text-[10px] text-accent font-semibold font-mono ml-0.5 select-none">{UNITS[unit].shortLabel}</span>
        </div>
      )}

      {inFullscreen && isBoxMode && (
        <div className="flex items-center gap-1 bg-surface-light border border-border-light rounded-lg px-2 py-1 shrink-0">
          <span className="text-[10px] text-muted font-mono font-medium">W:</span>
          <input
            type="number"
            step="any"
            value={boxWInput}
            onChange={(e) => setBoxWInput(e.target.value)}
            onFocus={() => setIsFocusW(true)}
            onBlur={() => { setIsFocusW(false); handleBoxWInputSubmit(); }}
            onKeyDown={(e) => e.key === "Enter" && handleBoxWInputSubmit()}
            className="w-12 bg-transparent text-xs font-semibold text-foreground focus:outline-none text-center"
            aria-label="Box Width"
          />
          <span className="text-[10px] text-muted border-l border-border-light pl-1 font-mono font-medium">H:</span>
          <input
            type="number"
            step="any"
            value={boxHInput}
            onChange={(e) => setBoxHInput(e.target.value)}
            onFocus={() => setIsFocusH(true)}
            onBlur={() => { setIsFocusH(false); handleBoxHInputSubmit(); }}
            onKeyDown={(e) => e.key === "Enter" && handleBoxHInputSubmit()}
            className="w-12 bg-transparent text-xs font-semibold text-foreground focus:outline-none text-center"
            aria-label="Box Height"
          />
          <span className="text-[10px] text-accent font-semibold font-mono ml-0.5 select-none">{UNITS[unit].shortLabel}</span>
        </div>
      )}

      {/* Unit selector */}
      <div className="flex rounded-lg border border-border-light overflow-hidden">
        {(["cm", "mm", "in"] as UnitType[]).map((u) => (
          <button
            key={u}
            id={`unit-${u}`}
            onClick={() => handleUnitChange(u)}
            className={`px-3 py-2 text-xs font-semibold transition-all ${
              unit === u
                ? "bg-accent/20 text-accent"
                : "text-muted hover:text-foreground hover:bg-white/[0.03]"
            }`}
          >
            {u.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Reset */}
      <button
        id="reset-btn"
        onClick={() => {
          if (measurementMode === "box") {
            setCursorLeft(Math.round(workspaceSize.w * 0.2));
            setCursorRight(Math.round(workspaceSize.w * 0.8));
            setCursorTop(Math.round(workspaceSize.h * 0.2));
            setCursorBottom(Math.round(workspaceSize.h * 0.8));
          } else {
            setCursorA(50);
            setCursorB(250);
          }
        }}
        className="btn-glass border border-border-light rounded-lg p-2 text-muted-light hover:text-foreground"
        aria-label="Reset cursors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* Theme toggle */}
      <button
        id="theme-toggle"
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        className="btn-glass border border-border-light rounded-lg p-2 text-muted-light hover:text-foreground cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-3.5 h-3.5 text-accent-amber" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-accent" />
        )}
      </button>

      {/* Fullscreen toggle */}
      <button
        id="fullscreen-toggle"
        onClick={toggleFullscreen}
        className={`border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
          inFullscreen
            ? "border-accent bg-accent/20 text-accent shadow-accent/20 animate-pulse-glow"
            : "border-accent/40 bg-accent/10 hover:bg-accent/15 hover:border-accent/60 text-accent shadow-accent/5"
        }`}
        aria-label={inFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {inFullscreen ? (
          <Minimize className="w-3.5 h-3.5" />
        ) : (
          <Maximize className="w-3.5 h-3.5 animate-bounce-slow" />
        )}
        {inFullscreen ? "Exit" : "Fullscreen"}
      </button>
    </div>
  );

  return (
    <>
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="relative z-10 border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center animate-pulse-glow">
              <Ruler className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-tight">
                RealOnlineRuler
              </h1>
              <p className="text-[11px] text-muted hidden sm:block">
                Free Accurate Screen Ruler — Actual Size
              </p>
            </div>
          </div>
          {renderToolbar(false)}
        </div>
      </header>

      {/* ─── Calibration Warning ────────────────────────── */}
      {!isCalibrated && (
        <div className="relative z-10 mx-4 sm:mx-6 mt-3">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setShowCalibrator(true)}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:border-accent-amber/30 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-amber/15 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-accent-amber" />
              </div>
              <div>
                <p className="text-sm font-medium text-accent-amber">
                  Calibrate for Accurate Measurements
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Without calibration, measurements may be off by 10–30%. Click
                  here to calibrate using a credit card, coin, or paper.
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted shrink-0 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Ruler Workspace (Normal Mode) ──────────────── */}
      <main className="flex-1 relative z-10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
          {/* Ruler area */}
          <div className="flex-1 min-w-0">
            <div
              className="glass rounded-2xl relative overflow-auto flex flex-col custom-scrollbar"
              style={{
                height: isHorizontal ? "280px" : "520px",
                minHeight: isHorizontal ? "220px" : "400px",
              }}
            >
              <div
                className="flex flex-col flex-1"
                style={{
                  width: "100%",
                  height: "100%"
                }}
              >
                {/* Top Row: Corner Square + Top Ruler */}
                <div className="flex shrink-0 border-b border-border/30 bg-background/50 h-[65px] overflow-hidden">
                  {/* Corner square */}
                  <div
                    className="shrink-0 bg-surface/40 border-r border-border/30 flex items-center justify-center"
                    style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                  >
                    <span className="text-[9px] text-muted font-mono">
                      {UNITS[unit].shortLabel}
                    </span>
                  </div>
                  {/* Top ruler */}
                  <div className="overflow-hidden flex-1 min-w-0">
                    <RulerSVG
                      lengthPx={workspaceSize.w}
                      ppi={ppi * zoom}
                      unit={unit}
                      side="top"
                      thickness={RULER_THICKNESS}
                      direction={measurementMode === "right" ? "reverse" : "normal"}
                    />
                  </div>
                </div>

                {/* Middle Row: Left Ruler + Workspace */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left ruler */}
                  <div className="shrink-0 bg-background/50 border-r border-border/30 overflow-hidden min-h-0">
                    <RulerSVG
                      lengthPx={workspaceSize.h}
                      ppi={ppi * zoom}
                      unit={unit}
                      side="left"
                      thickness={RULER_THICKNESS}
                      direction={measurementMode === "bottom" ? "reverse" : "normal"}
                    />
                  </div>

                  {/* Workspace container */}
                  <div
                    ref={isFullscreen ? null : setWorkspaceRef}
                    className="ruler-workspace flex-1 relative bg-surface/10 min-w-0 min-h-0"
                  >
                    {renderWorkspaceInner()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:w-72 space-y-4">
            <MeasurementDisplay
              distancePx={isBoxMode ? cursorRight - cursorLeft : distancePx}
              heightPx={isBoxMode ? cursorBottom - cursorTop : undefined}
              ppi={ppi * zoom}
              activeUnit={unit}
            />

            {/* Precise Input Card */}
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  Set Cursors
                </span>
                <span className="text-[10px] text-accent font-semibold font-mono">
                  {unit.toUpperCase()} Mode
                </span>
              </div>

              {!isBoxMode ? (
                // 1D Mode inputs
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-muted mb-1 font-medium">Cursor A</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        value={valAInput}
                        onChange={(e) => setValAInput(e.target.value)}
                        onFocus={() => setIsFocusA(true)}
                        onBlur={() => { setIsFocusA(false); handleAInputSubmit(); }}
                        onKeyDown={(e) => e.key === "Enter" && handleAInputSubmit()}
                        className="w-full bg-surface-light border border-border-light rounded-lg pl-2.5 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
                      />
                      <span className="absolute right-2.5 text-[10px] text-muted-light font-mono select-none">
                        {UNITS[unit].shortLabel}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted mb-1 font-medium">Cursor B</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        value={valBInput}
                        onChange={(e) => setValBInput(e.target.value)}
                        onFocus={() => setIsFocusB(true)}
                        onBlur={() => { setIsFocusB(false); handleBInputSubmit(); }}
                        onKeyDown={(e) => e.key === "Enter" && handleBInputSubmit()}
                        className="w-full bg-surface-light border border-border-light rounded-lg pl-2.5 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
                      />
                      <span className="absolute right-2.5 text-[10px] text-muted-light font-mono select-none">
                        {UNITS[unit].shortLabel}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // 2D Box Mode inputs
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-muted mb-1 font-medium">Width (W)</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          step="any"
                          value={boxWInput}
                          onChange={(e) => setBoxWInput(e.target.value)}
                          onFocus={() => setIsFocusW(true)}
                          onBlur={() => { setIsFocusW(false); handleBoxWInputSubmit(); }}
                          onKeyDown={(e) => e.key === "Enter" && handleBoxWInputSubmit()}
                          className="w-full bg-surface-light border border-border-light rounded-lg pl-2.5 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
                        />
                        <span className="absolute right-2.5 text-[10px] text-muted-light font-mono select-none">
                          {UNITS[unit].shortLabel}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted mb-1 font-medium">Height (H)</label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          step="any"
                          value={boxHInput}
                          onChange={(e) => setBoxHInput(e.target.value)}
                          onFocus={() => setIsFocusH(true)}
                          onBlur={() => { setIsFocusH(false); handleBoxHInputSubmit(); }}
                          onKeyDown={(e) => e.key === "Enter" && handleBoxHInputSubmit()}
                          className="w-full bg-surface-light border border-border-light rounded-lg pl-2.5 pr-8 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
                        />
                        <span className="absolute right-2.5 text-[10px] text-muted-light font-mono select-none">
                          {UNITS[unit].shortLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Boundary coords */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] border-t border-border-light pt-2.5 text-muted">
                    <div className="flex justify-between">
                      <span>Left:</span>
                      <span className="font-mono font-semibold">{pxToUnit(cursorLeft, ppi * zoom, unit).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Right:</span>
                      <span className="font-mono font-semibold">{pxToUnit(cursorRight, ppi * zoom, unit).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top:</span>
                      <span className="font-mono font-semibold">{pxToUnit(cursorTop, ppi * zoom, unit).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bottom:</span>
                      <span className="font-mono font-semibold">{pxToUnit(cursorBottom, ppi * zoom, unit).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PPI info */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">
                  Screen Info
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isCalibrated
                      ? "bg-accent-green/15 text-accent-green"
                      : "bg-accent-amber/15 text-accent-amber"
                  }`}
                >
                  {isCalibrated ? "Calibrated" : "Default"}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">PPI</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {Math.round(ppi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Unit</span>
                  <span className="font-medium">{UNITS[unit].label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Orientation</span>
                  <span className="font-medium capitalize">{orientation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ─── Fullscreen Overlay ──────────────────────────── */}
      <div
        ref={fullscreenRef}
        className={`${
          isFullscreen ? "fixed inset-0 z-50 flex flex-col bg-slate-950" : "hidden"
        }`}
      >
        {/* Fullscreen header bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-slate-950/90 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">RealOnlineRuler</span>
            <span className="text-[10px] text-muted">— Fullscreen Mode</span>
          </div>
          {renderToolbar(true)}
        </div>

        {/* Fullscreen compact measurement display */}
        <div className="px-4 py-2 border-b border-border bg-slate-950 shrink-0">
          <MeasurementDisplay
            distancePx={isBoxMode ? cursorRight - cursorLeft : distancePx}
            heightPx={isBoxMode ? cursorBottom - cursorTop : undefined}
            ppi={ppi * zoom}
            activeUnit={unit}
            compact
          />
        </div>

        {/* Fullscreen workspace with rulers on ALL 4 sides */}
        <div className="flex-1 flex flex-col overflow-auto relative custom-scrollbar">
          <div
            className="flex flex-col flex-1"
            style={{
              width: "100%",
              height: "100%"
            }}
          >
            {/* Top ruler */}
            <div className="shrink-0 overflow-hidden bg-slate-900 border-b border-border/50 flex">
              {/* Corner square */}
              <div
                className="shrink-0 bg-surface/50 border-r border-border/50 flex items-center justify-center"
                style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
              >
                <span className="text-[9px] text-muted font-mono">
                  {UNITS[unit].shortLabel}
                </span>
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <RulerSVG
                  lengthPx={workspaceSize.w}
                  ppi={ppi * zoom}
                  unit={unit}
                  side="top"
                  thickness={RULER_THICKNESS}
                  direction={measurementMode === "right" ? "reverse" : "normal"}
                />
              </div>
            </div>

            {/* Middle row: Left ruler + workspace + Right ruler */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left ruler */}
              <div className="shrink-0 overflow-hidden bg-slate-900 border-r border-border/50 min-h-0">
                <RulerSVG
                  lengthPx={workspaceSize.h}
                  ppi={ppi * zoom}
                  unit={unit}
                  side="left"
                  thickness={RULER_THICKNESS}
                  direction={measurementMode === "bottom" ? "reverse" : "normal"}
                />
              </div>

              {/* Main workspace */}
              <div
                ref={isFullscreen ? setWorkspaceRef : null}
                className="ruler-workspace flex-1 relative bg-surface/5 min-w-0 min-h-0"
              >
                {isFullscreen && renderWorkspaceInner()}
              </div>

              {/* Right ruler */}
              <div className="shrink-0 overflow-hidden bg-slate-900 border-l border-border/50 min-h-0">
                <RulerSVG
                  lengthPx={workspaceSize.h}
                  ppi={ppi * zoom}
                  unit={unit}
                  side="right"
                  thickness={RULER_THICKNESS}
                  direction={measurementMode === "bottom" ? "reverse" : "normal"}
                />
              </div>
            </div>

            {/* Bottom ruler */}
            <div className="shrink-0 overflow-hidden bg-slate-900 border-t border-border/50 flex">
              {/* Corner square */}
              <div
                className="shrink-0 bg-surface/50 border-r border-border/50"
                style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
              />
              <div className="overflow-hidden flex-1 min-w-0">
                <RulerSVG
                  lengthPx={workspaceSize.w}
                  ppi={ppi * zoom}
                  unit={unit}
                  side="bottom"
                  thickness={RULER_THICKNESS}
                  direction={measurementMode === "right" ? "reverse" : "normal"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── How To Use Component ───────────────────────── */}
      <HowToUseRuler />

      {/* ─── SEO Content ────────────────────────────────── */}
      <section className="relative z-10 px-4 sm:px-6 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Rich SEO content */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              The Most Accurate Online Ruler &amp; Virtual Measuring Tape
            </h2>
            <p className="text-sm text-muted-light leading-relaxed">
              RealOnlineRuler is a free, calibrated online ruler that displays at
              actual size on your screen. Unlike other online rulers that silently
              default to 96 PPI — which is wrong for most modern displays — our
              ruler lets you calibrate with a real-world object like a{" "}
              <strong>credit card</strong>, <strong>US quarter</strong>, or{" "}
              <strong>A4 paper</strong>. Once calibrated, you can measure objects
              in <strong>centimeters (cm)</strong>,{" "}
              <strong>millimeters (mm)</strong>, and{" "}
              <strong>inches</strong> with precision.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">100% Private</h3>
              <p className="text-xs text-muted leading-relaxed">
                Everything runs in your browser. No camera access, no uploads,
                no tracking. Your calibration is saved locally.
              </p>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent-green/15 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5 text-accent-green" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">Instant Load</h3>
              <p className="text-xs text-muted leading-relaxed">
                Built for speed with zero layout shift. Loads instantly on any
                device with perfect Core Web Vitals scores.
              </p>
            </div>
            <div className="glass rounded-xl p-5 text-center">
              <div className="w-10 h-10 rounded-xl bg-accent-red/15 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-5 h-5 text-accent-red" />
              </div>
              <h3 className="text-sm font-semibold mb-1.5">Mobile Ready</h3>
              <p className="text-xs text-muted leading-relaxed">
                Fully responsive with touch support. Works on iPhones, Android
                phones, iPads, and tablets of all sizes.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <FAQSection />
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-border px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-accent" />
            <span>
              © {new Date().getFullYear()} RealOnlineRuler — Free Online Ruler
              Tool
            </span>
          </div>

          {/* Page Links */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 font-medium">
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-accent-green" />
              100% Private
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-accent-amber" />
              No Ads
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-accent" />
              Mobile Ready
            </span>
          </div>
        </div>
      </footer>

      {/* ─── Modals ─────────────────────────────────────── */}
      <CalibratorModal
        isOpen={showCalibrator}
        onClose={() => setShowCalibrator(false)}
        ppi={ppi}
        onPpiChange={handlePpiChange}
      />
    </>
  );
}
