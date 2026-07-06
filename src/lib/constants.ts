// Calibration objects with their known real-world sizes
export interface CalibrationObject {
  id: string;
  name: string;
  widthMm: number;
  emoji: string;
  description: string;
}

export const CALIBRATION_OBJECTS: CalibrationObject[] = [
  {
    id: "credit-card",
    name: "Credit / Debit Card",
    widthMm: 85.6,
    emoji: "💳",
    description: "Standard ISO/IEC 7810 ID-1 card (85.6 mm wide)",
  },
  {
    id: "us-quarter",
    name: "US Quarter (25¢)",
    widthMm: 24.26,
    emoji: "🪙",
    description: "United States Quarter coin diameter (24.26 mm)",
  },
  {
    id: "euro-1",
    name: "1 Euro Coin",
    widthMm: 23.25,
    emoji: "🪙",
    description: "One Euro coin diameter (23.25 mm)",
  },
  {
    id: "inr-10",
    name: "₹10 Coin (India)",
    widthMm: 27.0,
    emoji: "🪙",
    description: "Indian 10 Rupee coin diameter (27.0 mm)",
  },
  {
    id: "a4-width",
    name: "A4 Paper (Width)",
    widthMm: 210,
    emoji: "📄",
    description: "A4 paper sheet width (210 mm)",
  },
  {
    id: "letter-width",
    name: "US Letter Paper (Width)",
    widthMm: 215.9,
    emoji: "📄",
    description: "US Letter paper sheet width (215.9 mm / 8.5 in)",
  },
];

export type UnitType = "cm" | "mm" | "in" | "px";

export interface UnitInfo {
  label: string;
  shortLabel: string;
  perInch: number; // how many of this unit per inch
}

export const UNITS: Record<UnitType, UnitInfo> = {
  cm: { label: "Centimeters", shortLabel: "cm", perInch: 2.54 },
  mm: { label: "Millimeters", shortLabel: "mm", perInch: 25.4 },
  in: { label: "Inches", shortLabel: "in", perInch: 1 },
  px: { label: "Pixels", shortLabel: "px", perInch: 1 },
};

// Convert pixels to a given unit based on PPI
export function pxToUnit(px: number, ppi: number, unit: UnitType): number {
  if (unit === "px") return px;
  const inches = px / ppi;
  return inches * UNITS[unit].perInch;
}

// Convert a unit value to pixels
export function unitToPx(value: number, ppi: number, unit: UnitType): number {
  if (unit === "px") return value;
  const inches = value / UNITS[unit].perInch;
  return inches * ppi;
}

export interface DevicePreset {
  name: string;
  category: "Laptop" | "Phone" | "Tablet" | "Monitor";
  ppi: number;
}

export const DEVICE_PRESETS: DevicePreset[] = [
  { name: "MacBook Air 13.6\" (M2/M3)", category: "Laptop", ppi: 224 },
  { name: "MacBook Pro 14\" (M1/M2/M3)", category: "Laptop", ppi: 254 },
  { name: "MacBook Pro 16\" (M1/M2/M3)", category: "Laptop", ppi: 254 },
  { name: "Dell XPS 13 (FHD)", category: "Laptop", ppi: 166 },
  { name: "Dell XPS 15 (FHD)", category: "Laptop", ppi: 141 },
  { name: "iPhone 13 / 14 / 15", category: "Phone", ppi: 460 },
  { name: "iPhone 13 / 14 / 15 Pro Max", category: "Phone", ppi: 460 },
  { name: "iPad Pro 11\"", category: "Tablet", ppi: 264 },
  { name: "iPad Pro 12.9\"", category: "Tablet", ppi: 264 },
  { name: "Generic 24\" Monitor (1080p)", category: "Monitor", ppi: 92 },
  { name: "Generic 27\" Monitor (1080p)", category: "Monitor", ppi: 82 },
  { name: "Generic 27\" Monitor (1440p)", category: "Monitor", ppi: 109 },
  { name: "Generic 27\" Monitor (4K)", category: "Monitor", ppi: 163 },
  { name: "Generic 32\" Monitor (4K)", category: "Monitor", ppi: 138 },
];

// Convert inches to a readable fraction string
export function inchesToFraction(inches: number): string {
  const whole = Math.floor(inches);
  const frac = inches - whole;

  const fractions = [
    { val: 0, str: "" },
    { val: 1 / 16, str: "1/16" },
    { val: 1 / 8, str: "1/8" },
    { val: 3 / 16, str: "3/16" },
    { val: 1 / 4, str: "1/4" },
    { val: 5 / 16, str: "5/16" },
    { val: 3 / 8, str: "3/8" },
    { val: 7 / 16, str: "7/16" },
    { val: 1 / 2, str: "1/2" },
    { val: 9 / 16, str: "9/16" },
    { val: 5 / 8, str: "5/8" },
    { val: 11 / 16, str: "11/16" },
    { val: 3 / 4, str: "3/4" },
    { val: 13 / 16, str: "13/16" },
    { val: 7 / 8, str: "7/8" },
    { val: 15 / 16, str: "15/16" },
    { val: 1, str: "" },
  ];

  let closest = fractions[0];
  let minDiff = Math.abs(frac - fractions[0].val);
  for (const f of fractions) {
    const diff = Math.abs(frac - f.val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = f;
    }
  }

  if (closest.val === 1) {
    return `${whole + 1}"`;
  }
  if (closest.str === "") {
    return `${whole}"`;
  }
  if (whole === 0) {
    return `${closest.str}"`;
  }
  return `${whole} ${closest.str}"`;
}

// Default PPI (96 is browser standard but usually wrong)
export const DEFAULT_PPI = 96;

// Storage keys
export const STORAGE_KEY_PPI = "realonlineruler_ppi";
export const STORAGE_KEY_UNIT = "realonlineruler_unit";
