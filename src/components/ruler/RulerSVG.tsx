"use client";

import React from "react";
import { type UnitType, UNITS } from "@/lib/constants";

interface RulerSVGProps {
  lengthPx: number;
  ppi: number;
  unit: UnitType;
  side: "top" | "bottom" | "left" | "right";
  thickness?: number;
  direction?: "normal" | "reverse";
}

export default function RulerSVG({
  lengthPx,
  ppi,
  unit,
  side,
  thickness,
  direction = "normal",
}: RulerSVGProps) {
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
        <line
          key={`M${i}`}
          x1={actualPos}
          y1={y1}
          x2={actualPos}
          y2={y2}
          className="stroke-accent"
          strokeWidth={1.5}
        />
      );
      if (i > 0 && i % labelInterval === 0) {
        const ly = side === "top" ? majorLen + 16 : th - majorLen - 6;
        const labelText = isMm ? i * 10 : isPx ? i * 100 : i;
        labels.push(
          <text
            key={`L${i}`}
            x={actualPos}
            y={ly}
            textAnchor="middle"
            className="fill-muted font-medium"
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            {labelText}
          </text>
        );
      }
    } else {
      const x1 = side === "left" ? 0 : th;
      const x2 = side === "left" ? majorLen : th - majorLen;
      lines.push(
        <line
          key={`M${i}`}
          x1={x1}
          y1={actualPos}
          x2={x2}
          y2={actualPos}
          className="stroke-accent"
          strokeWidth={1.5}
        />
      );
      if (i > 0 && i % labelInterval === 0) {
        const lx = side === "left" ? majorLen + 16 : th - majorLen - 6;
        const labelText = isMm ? i * 10 : isPx ? i * 100 : i;
        labels.push(
          <text
            key={`L${i}`}
            x={lx}
            y={actualPos + 4}
            textAnchor="middle"
            className="fill-muted font-medium"
            fontSize={11}
            fontFamily="Inter, sans-serif"
          >
            {labelText}
          </text>
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
          <line
            key={`S${i}-${j}`}
            x1={actualSubPos}
            y1={y1}
            x2={actualSubPos}
            y2={y2}
            className="stroke-muted/30"
            strokeWidth={sw}
          />
        );
      } else {
        const x1 = side === "left" ? 0 : th;
        const x2 = side === "left" ? tickLen : th - tickLen;
        lines.push(
          <line
            key={`S${i}-${j}`}
            x1={x1}
            y1={actualSubPos}
            x2={x2}
            y2={actualSubPos}
            className="stroke-muted/30"
            strokeWidth={sw}
          />
        );
      }
    }
  }

  // Edge line
  let edgeLine: React.ReactNode = null;
  if (side === "top") {
    edgeLine = (
      <line
        x1={0}
        y1={0}
        x2={lengthPx}
        y2={0}
        className="stroke-accent/30"
        strokeWidth={2}
      />
    );
  } else if (side === "bottom") {
    edgeLine = (
      <line
        x1={0}
        y1={th}
        x2={lengthPx}
        y2={th}
        className="stroke-accent/30"
        strokeWidth={2}
      />
    );
  } else if (side === "left") {
    edgeLine = (
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={lengthPx}
        className="stroke-accent/30"
        strokeWidth={2}
      />
    );
  } else {
    edgeLine = (
      <line
        x1={th}
        y1={0}
        x2={th}
        y2={lengthPx}
        className="stroke-accent/30"
        strokeWidth={2}
      />
    );
  }

  return (
    <svg width={svgW} height={svgH} className="block shrink-0">
      {edgeLine}
      {lines}
      {labels}
    </svg>
  );
}
