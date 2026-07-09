"use client";

import React from "react";
import { type UnitType, UNITS } from "@/lib/constants";

interface GridOverlayProps {
  widthPx: number;
  heightPx: number;
  ppi: number;
  unit: UnitType;
}

export default function GridOverlay({
  widthPx,
  heightPx,
  ppi,
  unit,
}: GridOverlayProps) {
  // If unit is px, we use 100px as the grid interval
  const pxPerUnit = unit === "px" ? 100 : ppi / UNITS[unit].perInch;

  const lines: React.ReactNode[] = [];

  for (let x = pxPerUnit; x < widthPx; x += pxPerUnit) {
    lines.push(
      <line
        key={`gv-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={heightPx}
        className="stroke-muted/10"
        strokeWidth={0.5}
      />
    );
  }
  for (let y = pxPerUnit; y < heightPx; y += pxPerUnit) {
    lines.push(
      <line
        key={`gh-${y}`}
        x1={0}
        y1={y}
        x2={widthPx}
        y2={y}
        className="stroke-muted/10"
        strokeWidth={0.5}
      />
    );
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={widthPx}
      height={heightPx}
    >
      {lines}
    </svg>
  );
}
