"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import {
  type UnitType,
  UNITS,
  pxToUnit,
  inchesToFraction,
} from "@/lib/constants";

interface MeasurementDisplayProps {
  distancePx: number;
  heightPx?: number;
  ppi: number;
  activeUnit: UnitType;
  compact?: boolean;
}

export default function MeasurementDisplay({
  distancePx,
  heightPx,
  ppi,
  activeUnit,
  compact,
}: MeasurementDisplayProps) {
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

  const getSubValuesString = (
    cmVal: number,
    mmVal: number,
    inVal: number,
    pxVal: number,
    fracStr: string
  ) => {
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
          <div className="text-xs text-muted-red mb-1 font-semibold text-accent-red">
            HEIGHT (H)
          </div>
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
            <div className="text-sm font-semibold tabular-nums">
              {Math.round(pxValW)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
