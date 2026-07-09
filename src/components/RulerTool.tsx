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

import CalibratorModal from "./ruler/CalibratorModal";
import MeasurementDisplay from "./ruler/MeasurementDisplay";
import FAQSection from "./ruler/FAQSection";
import RulerSVG from "./ruler/RulerSVG";
import GridOverlay from "./ruler/GridOverlay";

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

  // Modular Workspace Toggles
  const [showLeftRuler, setShowLeftRuler] = useState(true);
  const [showRightRuler, setShowRightRuler] = useState(false);
  const [showTopRuler, setShowTopRuler] = useState(true);
  const [showBottomRuler, setShowBottomRuler] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Interactive Guidelines
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [draggedGuide, setDraggedGuide] = useState<{ type: "v" | "h"; index: number } | null>(null);
  const [guidePreview, setGuidePreview] = useState<{ type: "v" | "h"; pos: number } | null>(null);

  // Welcome Panel
  const [showWelcomePanel, setShowWelcomePanel] = useState(true);

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
        // Unit shortcuts
        case "1":
          e.preventDefault();
          handleUnitChange("cm");
          break;
        case "2":
          e.preventDefault();
          handleUnitChange("in");
          break;
        case "3":
          e.preventDefault();
          handleUnitChange("px");
          break;
        // Toggle shortcuts
        case "c":
          e.preventDefault();
          setShowCrosshair((prev) => !prev);
          break;
        case "g":
          e.preventDefault();
          setShowCoordinates((prev) => !prev);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "d":
          e.preventDefault();
          setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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
        case "escape":
          e.preventDefault();
          setVerticalGuides([]);
          setHorizontalGuides([]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen, workspaceSize, handleUnitChange]);

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
        if (moveEvent.cancelable) {
          moveEvent.preventDefault();
        }
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
        if (moveEvent.cancelable) {
          moveEvent.preventDefault();
        }
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

  // Determine if any ruler is active (for welcome panel logic)
  const anyRulerActive = showLeftRuler || showRightRuler || showTopRuler || showBottomRuler;

  // ─── Interactive Guidelines Rendering ────────────────────────────
  const renderGuidelines = () => (
    <>
      {/* Vertical guidelines (X-axis lines) */}
      {verticalGuides.map((x, i) => (
        <div key={`vg-${i}`}>
          {/* The guideline itself */}
          <div
            className="absolute top-0 h-full z-30 cursor-ew-resize group"
            style={{ left: `${x}px`, width: "1px" }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggedGuide({ type: "v", index: i });
            }}
          >
            <div className="absolute inset-y-0 -left-[6px] w-[13px] group-hover:bg-accent/10 transition-colors" />
            <div className="absolute inset-y-0 left-0 w-[1.5px] bg-accent/70 group-hover:bg-accent" />
          </div>
          {/* Coordinate badge */}
          <div
            className="absolute z-35 bg-surface/90 border border-border-light rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold text-accent pointer-events-none whitespace-nowrap shadow-sm"
            style={{ left: `${x + 4}px`, top: "4px" }}
          >
            {pxToUnit(x, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel}
          </div>
        </div>
      ))}

      {/* Horizontal guidelines (Y-axis lines) */}
      {horizontalGuides.map((y, i) => (
        <div key={`hg-${i}`}>
          {/* The guideline itself */}
          <div
            className="absolute left-0 w-full z-30 cursor-ns-resize group"
            style={{ top: `${y}px`, height: "1px" }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setDraggedGuide({ type: "h", index: i });
            }}
          >
            <div className="absolute inset-x-0 -top-[6px] h-[13px] group-hover:bg-accent-secondary/10 transition-colors" />
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-accent-secondary/70 group-hover:bg-accent-secondary" />
          </div>
          {/* Coordinate badge */}
          <div
            className="absolute z-35 bg-surface/90 border border-border-light rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold text-accent-secondary pointer-events-none whitespace-nowrap shadow-sm"
            style={{ left: "4px", top: `${y + 4}px` }}
          >
            {pxToUnit(y, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel}
          </div>
        </div>
      ))}

      {/* Guide preview line */}
      {guidePreview && (
        guidePreview.type === "v" ? (
          <div
            className="absolute top-0 h-full pointer-events-none z-25"
            style={{ left: `${guidePreview.pos}px`, width: "1.5px", background: "var(--accent)", opacity: 0.35 }}
          />
        ) : (
          <div
            className="absolute left-0 w-full pointer-events-none z-25"
            style={{ top: `${guidePreview.pos}px`, height: "1.5px", background: "var(--accent-secondary)", opacity: 0.35 }}
          />
        )
      )}

      {/* Distance measurements between adjacent vertical guidelines */}
      {verticalGuides.length >= 2 && (() => {
        const sorted = [...verticalGuides].sort((a, b) => a - b);
        return sorted.slice(0, -1).map((x, i) => {
          const nextX = sorted[i + 1];
          const dist = nextX - x;
          const midX = x + dist / 2;
          return (
            <div key={`vd-${i}`} className="absolute pointer-events-none z-25" style={{ left: `${x}px`, top: "50%", width: `${dist}px`, height: "0" }}>
              {/* Connector line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] border-t border-dashed border-accent/40" />
              {/* Left arrow */}
              <div className="absolute -left-[3px] -top-[3px] w-[7px] h-[7px] border-l-2 border-b-2 border-accent/60 rotate-45" />
              {/* Right arrow */}
              <div className="absolute -right-[3px] -top-[3px] w-[7px] h-[7px] border-r-2 border-t-2 border-accent/60 rotate-45" />
              {/* Distance label */}
              <div
                className="absolute -top-5 bg-surface/90 border border-accent/30 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-accent whitespace-nowrap shadow-sm"
                style={{ left: `${(dist / 2) - 20}px` }}
              >
                {pxToUnit(dist, ppi * zoom, unit).toFixed(2)} {UNITS[unit].shortLabel}
              </div>
            </div>
          );
        });
      })()}

      {/* Distance measurements between adjacent horizontal guidelines */}
      {horizontalGuides.length >= 2 && (() => {
        const sorted = [...horizontalGuides].sort((a, b) => a - b);
        return sorted.slice(0, -1).map((y, i) => {
          const nextY = sorted[i + 1];
          const dist = nextY - y;
          return (
            <div key={`hd-${i}`} className="absolute pointer-events-none z-25" style={{ left: "50%", top: `${y}px`, width: "0", height: `${dist}px` }}>
              {/* Connector line */}
              <div className="absolute left-0 top-0 bottom-0 w-[1px] border-l border-dashed border-accent-secondary/40" />
              {/* Top arrow */}
              <div className="absolute -left-[3px] -top-[3px] w-[7px] h-[7px] border-l-2 border-t-2 border-accent-secondary/60 rotate-45" style={{ transform: "rotate(45deg)" }} />
              {/* Bottom arrow */}
              <div className="absolute -left-[3px] -bottom-[3px] w-[7px] h-[7px] border-r-2 border-b-2 border-accent-secondary/60 rotate-45" style={{ transform: "rotate(45deg)" }} />
              {/* Distance label */}
              <div
                className="absolute left-3 bg-surface/90 border border-accent-secondary/30 rounded px-1.5 py-0.5 text-[9px] font-mono font-bold text-accent-secondary whitespace-nowrap shadow-sm"
                style={{ top: `${(dist / 2) - 8}px` }}
              >
                {pxToUnit(dist, ppi * zoom, unit).toFixed(2)} {UNITS[unit].shortLabel}
              </div>
            </div>
          );
        });
      })()}
    </>
  );

  // ─── Welcome Onboarding Panel ──────────────────────────────────
  const renderWelcomePanel = () => {
    if (!showWelcomePanel) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="pointer-events-auto max-w-lg mx-auto text-center space-y-5 p-6">
          {/* Icon */}
          <div className="w-12 h-12 mx-auto rounded-xl bg-surface-light border border-border-light flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-muted" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="20" height="8" rx="1.5" />
              <line x1="6" y1="8" x2="6" y2="11" />
              <line x1="10" y1="8" x2="10" y2="13" />
              <line x1="14" y1="8" x2="14" y2="11" />
              <line x1="18" y1="8" x2="18" y2="12" />
            </svg>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">Place a ruler on any edge.</h2>
            <p className="text-sm text-muted">Choose an edge from the toolbar above, or click a shortcut below.</p>
          </div>

          {/* Shortcut Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setShowLeftRuler(true)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${showLeftRuler ? "border-accent/40 bg-accent/5" : "border-border-light bg-surface-light/50 hover:border-accent/30 hover:bg-accent/5"}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-0.5">Left</div>
              <div className="text-sm font-semibold text-foreground">Vertical</div>
            </button>
            <button
              onClick={() => setShowRightRuler(true)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${showRightRuler ? "border-accent/40 bg-accent/5" : "border-border-light bg-surface-light/50 hover:border-accent/30 hover:bg-accent/5"}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-0.5">Right</div>
              <div className="text-sm font-semibold text-foreground">Vertical</div>
            </button>
            <button
              onClick={() => setShowTopRuler(true)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${showTopRuler ? "border-accent/40 bg-accent/5" : "border-border-light bg-surface-light/50 hover:border-accent/30 hover:bg-accent/5"}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-0.5">Top</div>
              <div className="text-sm font-semibold text-foreground">Horizontal</div>
            </button>
            <button
              onClick={() => setShowBottomRuler(true)}
              className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${showBottomRuler ? "border-accent/40 bg-accent/5" : "border-border-light bg-surface-light/50 hover:border-accent/30 hover:bg-accent/5"}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-0.5">Bottom</div>
              <div className="text-sm font-semibold text-foreground">Horizontal</div>
            </button>
          </div>

          {/* Calibration Status */}
          <div className="inline-flex items-center gap-2 bg-surface-light/70 border border-border-light rounded-full px-4 py-1.5 text-xs text-muted">
            <span className={`w-2 h-2 rounded-full ${isCalibrated ? "bg-accent-green" : "bg-accent-amber animate-pulse"}`} />
            <span>{isCalibrated ? "Calibrated" : "Not calibrated"} · {Math.round(ppi)} PPI</span>
            <span className="text-border-light">·</span>
            <button onClick={() => setShowCalibrator(true)} className="text-accent hover:underline cursor-pointer font-medium">
              {isCalibrated ? "Recalibrate" : "Calibrate now"}
            </button>
          </div>

          {/* Hide button */}
          <div>
            <button
              onClick={() => setShowWelcomePanel(false)}
              className="text-xs text-muted hover:text-foreground transition-colors cursor-pointer underline underline-offset-2"
            >
              Hide this info
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Workspace mouse handlers for guideline interactions ─────────
  const handleWorkspaceMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);
    setMousePos({ x, y });

    // If dragging a guideline, update its position
    if (draggedGuide) {
      if (draggedGuide.type === "v") {
        setVerticalGuides(prev => {
          const next = [...prev];
          next[draggedGuide.index] = x;
          return next;
        });
      } else {
        setHorizontalGuides(prev => {
          const next = [...prev];
          next[draggedGuide.index] = y;
          return next;
        });
      }
    }
  }, [draggedGuide, zoom]);

  const handleWorkspaceMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (draggedGuide) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / zoom);
      const y = Math.round((e.clientY - rect.top) / zoom);

      // Delete guideline if dragged off-screen or onto a ruler edge
      if (draggedGuide.type === "v" && (x < 0 || x > workspaceSize.w)) {
        setVerticalGuides(prev => prev.filter((_, i) => i !== draggedGuide.index));
      } else if (draggedGuide.type === "h" && (y < 0 || y > workspaceSize.h)) {
        setHorizontalGuides(prev => prev.filter((_, i) => i !== draggedGuide.index));
      }
      setDraggedGuide(null);
    }
  }, [draggedGuide, workspaceSize, zoom]);

  // ─── Ruler click/hover handlers for dropping guidelines ──────────
  const handleTopRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    if (x > 0 && x < workspaceSize.w) {
      setVerticalGuides(prev => [...prev, x]);
    }
  }, [zoom, workspaceSize.w]);

  const handleBottomRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    if (x > 0 && x < workspaceSize.w) {
      setVerticalGuides(prev => [...prev, x]);
    }
  }, [zoom, workspaceSize.w]);

  const handleLeftRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.round((e.clientY - rect.top) / zoom);
    if (y > 0 && y < workspaceSize.h) {
      setHorizontalGuides(prev => [...prev, y]);
    }
  }, [zoom, workspaceSize.h]);

  const handleRightRulerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.round((e.clientY - rect.top) / zoom);
    if (y > 0 && y < workspaceSize.h) {
      setHorizontalGuides(prev => [...prev, y]);
    }
  }, [zoom, workspaceSize.h]);

  // Ruler hover preview handlers
  const handleTopRulerHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    setGuidePreview({ type: "v", pos: x });
  }, [zoom]);

  const handleBottomRulerHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    setGuidePreview({ type: "v", pos: x });
  }, [zoom]);

  const handleLeftRulerHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.round((e.clientY - rect.top) / zoom);
    setGuidePreview({ type: "h", pos: y });
  }, [zoom]);

  const handleRightRulerHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = Math.round((e.clientY - rect.top) / zoom);
    setGuidePreview({ type: "h", pos: y });
  }, [zoom]);

  const handleRulerLeave = useCallback(() => {
    setGuidePreview(null);
  }, []);

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
      {/* Mode Selector / Toggles */}
      <div className="flex items-center gap-1 bg-surface-light border border-border-light rounded-xl p-1 shrink-0 shadow-sm">
        {/* Rulers Group */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowLeftRuler(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showLeftRuler
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Left Ruler (Vertical)"
            aria-label="Toggle Left Ruler (Vertical)"
          >
            {/* Left Vertical Ruler Icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="20" rx="1.5" />
              <line x1="8" y1="6" x2="11" y2="6" />
              <line x1="8" y1="10" x2="13" y2="10" />
              <line x1="8" y1="14" x2="11" y2="14" />
              <line x1="8" y1="18" x2="12" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setShowRightRuler(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showRightRuler
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Right Ruler (Vertical)"
            aria-label="Toggle Right Ruler (Vertical)"
          >
            {/* Right Vertical Ruler Icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="20" rx="1.5" />
              <line x1="16" y1="6" x2="13" y2="6" />
              <line x1="16" y1="10" x2="11" y2="10" />
              <line x1="16" y1="14" x2="13" y2="14" />
              <line x1="16" y1="18" x2="12" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setShowTopRuler(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showTopRuler
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Top Ruler (Horizontal)"
            aria-label="Toggle Top Ruler (Horizontal)"
          >
            {/* Top Horizontal Ruler Icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="20" height="8" rx="1.5" />
              <line x1="6" y1="8" x2="6" y2="11" />
              <line x1="10" y1="8" x2="10" y2="13" />
              <line x1="14" y1="8" x2="14" y2="11" />
              <line x1="18" y1="8" x2="18" y2="12" />
            </svg>
          </button>
          <button
            onClick={() => setShowBottomRuler(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showBottomRuler
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Bottom Ruler (Horizontal)"
            aria-label="Toggle Bottom Ruler (Horizontal)"
          >
            {/* Bottom Horizontal Ruler Icon */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="8" width="20" height="8" rx="1.5" />
              <line x1="6" y1="16" x2="6" y2="13" />
              <line x1="10" y1="16" x2="10" y2="11" />
              <line x1="14" y1="16" x2="14" y2="13" />
              <line x1="18" y1="16" x2="18" y2="12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border-light mx-0.5" />

        {/* Cursors & Mouse Tools Group */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowCrosshair(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showCrosshair
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Cursor Crosshairs"
            aria-label="Toggle Cursor Crosshairs"
          >
            {/* Dashed Crosshair */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="3 3" />
              <line x1="3" y1="12" x2="21" y2="12" strokeDasharray="3 3" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={() => setShowCoordinates(v => !v)}
            className={`p-1.5 rounded-lg transition-all cursor-pointer ${showCoordinates
              ? "bg-surface text-foreground font-semibold shadow-sm border border-border-light/20"
              : "text-muted hover:text-foreground hover:bg-white/[0.04]"
              }`}
            title="Toggle Mouse Coordinates"
            aria-label="Toggle Mouse Coordinates"
          >
            {/* Target Circle */}
            <svg viewBox="0 0 24 24" className="w-4 h-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calibrate */}
      <button
        id="calibrate-btn"
        onClick={() => setShowCalibrator(true)}
        className={`btn-glass border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${isCalibrated
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
        className={`btn-glass border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all ${showGrid
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
            className={`px-3 py-2 text-xs font-semibold transition-all ${unit === u
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
        className={`border rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${inFullscreen
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
                Online Ruler — Measure in cm, mm & Inches
              </h1>
              <p className="text-[11px] text-muted hidden sm:block">
                Free Calibrated Screen Ruler at Actual Size
              </p>
            </div>
          </div>
          {renderToolbar(false)}
        </div>
      </header>

      {/* SEO Intro — primary keyword in first 100 words */}
      <div className="relative z-10 px-4 sm:px-6 pt-3 pb-1">
        <p className="max-w-6xl mx-auto text-xs text-muted-light leading-relaxed">
          This <strong>free online ruler</strong> lets you measure objects at <strong>actual size</strong> in{" "}
          <strong>centimeters (cm)</strong>, <strong>millimeters (mm)</strong>, and <strong>inches</strong> directly
          on your screen. Calibrate once with a credit card or coin, then drag the precision cursors to get instant,
          accurate measurements — no app download required.
        </p>
      </div>

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
      <main className="relative z-10 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4">
          {/* Ruler area */}
          <div className="flex-1 min-w-0">
            <div
              className="glass rounded-2xl relative overflow-auto flex flex-col custom-scrollbar"
              style={{
                height: isHorizontal ? "500px" : "500px",
                minHeight: isHorizontal ? "300px" : "500px",
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
                {showTopRuler && (
                  <div className="flex shrink-0 border-b border-border/30 bg-background/50 h-[65px] overflow-hidden">
                    {/* Corner square */}
                    {showLeftRuler && (
                      <div
                        className="shrink-0 bg-surface/40 border-r border-border/30 flex items-center justify-center"
                        style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                      >
                        <span className="text-[9px] text-muted font-mono">
                          {UNITS[unit].shortLabel}
                        </span>
                      </div>
                    )}
                    {/* Top ruler */}
                    <div className="overflow-hidden flex-1 min-w-0 cursor-crosshair" onClick={handleTopRulerClick} onMouseMove={handleTopRulerHover} onMouseLeave={handleRulerLeave}>
                      <RulerSVG
                        lengthPx={workspaceSize.w}
                        ppi={ppi * zoom}
                        unit={unit}
                        side="top"
                        thickness={RULER_THICKNESS}
                        direction="normal"
                      />
                    </div>
                    {/* Right corner square */}
                    {showRightRuler && (
                      <div
                        className="shrink-0 bg-surface/40 border-l border-border/30"
                        style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                      />
                    )}
                  </div>
                )}

                {/* Middle Row: Left Ruler + Workspace + Right Ruler */}
                <div className="flex flex-1 overflow-hidden">
                  {/* Left ruler */}
                  {showLeftRuler && (
                    <div className="shrink-0 bg-background/50 border-r border-border/30 overflow-hidden min-h-0 cursor-crosshair" onClick={handleLeftRulerClick} onMouseMove={handleLeftRulerHover} onMouseLeave={handleRulerLeave}>
                      <RulerSVG
                        lengthPx={workspaceSize.h}
                        ppi={ppi * zoom}
                        unit={unit}
                        side="left"
                        thickness={RULER_THICKNESS}
                        direction="normal"
                      />
                    </div>
                  )}

                  {/* Workspace container */}
                  <div
                    ref={isFullscreen ? null : setWorkspaceRef}
                    className="ruler-workspace flex-1 relative bg-surface/10 min-w-0 min-h-0"
                    onMouseMove={handleWorkspaceMouseMove}
                    onMouseUp={handleWorkspaceMouseUp}
                    onMouseLeave={() => { setMousePos(null); setGuidePreview(null); if (draggedGuide) setDraggedGuide(null); }}
                  >
                    {renderWorkspaceInner()}

                    {/* Interactive Guidelines */}
                    {renderGuidelines()}

                    {/* Welcome Panel (show when no rulers are active) */}
                    {!anyRulerActive && renderWelcomePanel()}

                    {/* Coordinates tooltip */}
                    {showCoordinates && mousePos && (
                      <div
                        className="absolute z-40 bg-surface/95 border border-border-light rounded-lg px-2.5 py-1 text-xs font-mono font-bold shadow-lg pointer-events-none whitespace-nowrap text-foreground"
                        style={{
                          left: `${mousePos.x + 15}px`,
                          top: `${mousePos.y + 15}px`,
                        }}
                      >
                        x: {pxToUnit(mousePos.x, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel} y: {pxToUnit(mousePos.y, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel}
                      </div>
                    )}

                    {/* Mouse crosshair lines */}
                    {showCrosshair && mousePos && (
                      <>
                        <div
                          className="absolute bg-accent/50 pointer-events-none z-20"
                          style={{
                            left: `${mousePos.x}px`,
                            top: 0,
                            width: "1.5px",
                            height: "100%",
                          }}
                        />
                        <div
                          className="absolute bg-accent/50 pointer-events-none z-20"
                          style={{
                            left: 0,
                            top: `${mousePos.y}px`,
                            width: "100%",
                            height: "1.5px",
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Right ruler */}
                  {showRightRuler && (
                    <div className="shrink-0 bg-background/50 border-l border-border/30 overflow-hidden min-h-0 cursor-crosshair" onClick={handleRightRulerClick} onMouseMove={handleRightRulerHover} onMouseLeave={handleRulerLeave}>
                      <RulerSVG
                        lengthPx={workspaceSize.h}
                        ppi={ppi * zoom}
                        unit={unit}
                        side="right"
                        thickness={RULER_THICKNESS}
                        direction="normal"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Row: Corner Square + Bottom Ruler */}
                {showBottomRuler && (
                  <div className="flex shrink-0 border-t border-border/30 bg-background/50 h-[65px] overflow-hidden">
                    {/* Corner square */}
                    {showLeftRuler && (
                      <div
                        className="shrink-0 bg-surface/40 border-r border-border/30"
                        style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                      />
                    )}
                    {/* Bottom ruler */}
                    <div className="overflow-hidden flex-1 min-w-0 cursor-crosshair" onClick={handleBottomRulerClick} onMouseMove={handleBottomRulerHover} onMouseLeave={handleRulerLeave}>
                      <RulerSVG
                        lengthPx={workspaceSize.w}
                        ppi={ppi * zoom}
                        unit={unit}
                        side="bottom"
                        thickness={RULER_THICKNESS}
                        direction="normal"
                      />
                    </div>
                    {/* Right corner square */}
                    {showRightRuler && (
                      <div
                        className="shrink-0 bg-surface/40 border-l border-border/30"
                        style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                      />
                    )}
                  </div>
                )}
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
                    <label htmlFor="cursor-a-input" className="block text-[11px] text-muted mb-1 font-medium">Cursor A</label>
                    <div className="relative flex items-center">
                      <input
                        id="cursor-a-input"
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
                    <label htmlFor="cursor-b-input" className="block text-[11px] text-muted mb-1 font-medium">Cursor B</label>
                    <div className="relative flex items-center">
                      <input
                        id="cursor-b-input"
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
                      <label htmlFor="box-w-input" className="block text-[11px] text-muted mb-1 font-medium">Width (W)</label>
                      <div className="relative flex items-center">
                        <input
                          id="box-w-input"
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
                      <label htmlFor="box-h-input" className="block text-[11px] text-muted mb-1 font-medium">Height (H)</label>
                      <div className="relative flex items-center">
                        <input
                          id="box-h-input"
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
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isCalibrated
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
        className={`${isFullscreen ? "fixed inset-0 z-50 flex flex-col bg-slate-950" : "hidden"
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
            {showTopRuler && (
              <div className="shrink-0 overflow-hidden bg-slate-900 border-b border-border/50 flex">
                {/* Corner square */}
                {showLeftRuler && (
                  <div
                    className="shrink-0 bg-surface/50 border-r border-border/50 flex items-center justify-center"
                    style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                  >
                    <span className="text-[9px] text-muted font-mono">
                      {UNITS[unit].shortLabel}
                    </span>
                  </div>
                )}
                <div className="overflow-hidden flex-1 min-w-0 cursor-crosshair" onClick={handleTopRulerClick} onMouseMove={handleTopRulerHover} onMouseLeave={handleRulerLeave}>
                  <RulerSVG
                    lengthPx={workspaceSize.w}
                    ppi={ppi * zoom}
                    unit={unit}
                    side="top"
                    thickness={RULER_THICKNESS}
                    direction="normal"
                  />
                </div>
                {showRightRuler && (
                  <div
                    className="shrink-0 bg-surface/50 border-l border-border/50"
                    style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                  />
                )}
              </div>
            )}

            {/* Middle row: Left ruler + workspace + Right ruler */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left ruler */}
              {showLeftRuler && (
                <div className="shrink-0 overflow-hidden bg-slate-900 border-r border-border/50 min-h-0 cursor-crosshair" onClick={handleLeftRulerClick} onMouseMove={handleLeftRulerHover} onMouseLeave={handleRulerLeave}>
                  <RulerSVG
                    lengthPx={workspaceSize.h}
                    ppi={ppi * zoom}
                    unit={unit}
                    side="left"
                    thickness={RULER_THICKNESS}
                    direction="normal"
                  />
                </div>
              )}

              {/* Main workspace */}
              <div
                ref={isFullscreen ? setWorkspaceRef : null}
                className="ruler-workspace flex-1 relative bg-surface/5 min-w-0 min-h-0"
                onMouseMove={handleWorkspaceMouseMove}
                onMouseUp={handleWorkspaceMouseUp}
                onMouseLeave={() => { setMousePos(null); setGuidePreview(null); if (draggedGuide) setDraggedGuide(null); }}
              >
                {isFullscreen && renderWorkspaceInner()}

                {/* Interactive Guidelines */}
                {isFullscreen && renderGuidelines()}

                {/* Welcome Panel (show when no rulers are active) */}
                {isFullscreen && !anyRulerActive && renderWelcomePanel()}

                {/* Mouse coordinates tooltip */}
                {isFullscreen && showCoordinates && mousePos && (
                  <div
                    className="absolute z-40 bg-surface/95 border border-border-light rounded-lg px-2.5 py-1 text-xs font-mono font-bold shadow-lg pointer-events-none whitespace-nowrap text-foreground"
                    style={{
                      left: `${mousePos.x + 15}px`,
                      top: `${mousePos.y + 15}px`,
                    }}
                  >
                    x: {pxToUnit(mousePos.x, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel} y: {pxToUnit(mousePos.y, ppi * zoom, unit).toFixed(1)} {UNITS[unit].shortLabel}
                  </div>
                )}
                
                {/* Mouse crosshair lines */}
                {isFullscreen && showCrosshair && mousePos && (
                  <>
                    <div
                      className="absolute bg-accent/50 pointer-events-none z-20"
                      style={{
                        left: `${mousePos.x}px`,
                        top: 0,
                        width: "1.5px",
                        height: "100%",
                      }}
                    />
                    <div
                      className="absolute bg-accent/50 pointer-events-none z-20"
                      style={{
                        left: 0,
                        top: `${mousePos.y}px`,
                        width: "100%",
                        height: "1.5px",
                      }}
                    />
                  </>
                )}
              </div>

              {/* Right ruler */}
              {showRightRuler && (
                <div className="shrink-0 overflow-hidden bg-slate-900 border-l border-border/50 min-h-0 cursor-crosshair" onClick={handleRightRulerClick} onMouseMove={handleRightRulerHover} onMouseLeave={handleRulerLeave}>
                  <RulerSVG
                    lengthPx={workspaceSize.h}
                    ppi={ppi * zoom}
                    unit={unit}
                    side="right"
                    thickness={RULER_THICKNESS}
                    direction="normal"
                  />
                </div>
              )}
            </div>

            {/* Bottom ruler */}
            {showBottomRuler && (
              <div className="shrink-0 overflow-hidden bg-slate-900 border-t border-border/50 flex">
                {/* Corner square */}
                {showLeftRuler && (
                  <div
                    className="shrink-0 bg-surface/50 border-r border-border/50"
                    style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                  />
                )}
                <div className="overflow-hidden flex-1 min-w-0 cursor-crosshair" onClick={handleBottomRulerClick} onMouseMove={handleBottomRulerHover} onMouseLeave={handleRulerLeave}>
                  <RulerSVG
                    lengthPx={workspaceSize.w}
                    ppi={ppi * zoom}
                    unit={unit}
                    side="bottom"
                    thickness={RULER_THICKNESS}
                    direction="normal"
                  />
                </div>
                {showRightRuler && (
                  <div
                    className="shrink-0 bg-surface/50 border-l border-border/50"
                    style={{ width: RULER_THICKNESS, height: RULER_THICKNESS }}
                  />
                )}
              </div>
            )}
            
            {/* Fullscreen view calibrator modal */}
            {isFullscreen && (
              <CalibratorModal
                isOpen={showCalibrator}
                onClose={() => setShowCalibrator(false)}
                ppi={ppi}
                onPpiChange={handlePpiChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* ─── How To Use Component ───────────────────────── */}
      <HowToUseRuler />

      {/* ─── SEO Content ────────────────────────────────── */}
      <article className="relative z-10 px-4 sm:px-6 py-12 border-t border-border">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Rich SEO content */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              The Most Accurate Online Ruler &amp; Virtual Measuring Tape
            </h2>
            <p className="text-sm text-muted-light leading-relaxed">
              RealOnlineRuler is a free, calibrated online ruler that displays at
              actual size on your screen. Unlike other online rulers that silently
              default to{" "}
              <a
                href="https://en.wikipedia.org/wiki/Pixels_per_inch"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
              >
                96 PPI
              </a>{" "}
              — which is wrong for most modern displays — our
              ruler lets you calibrate with a real-world object like a{" "}
              <strong>credit card</strong>, <strong>US quarter</strong>, or{" "}
              <strong>A4 paper</strong>. Once calibrated, you can measure objects
              in <strong>centimeters (cm)</strong>,{" "}
              <strong>millimeters (mm)</strong>, and{" "}
              <strong>inches</strong> with precision. Our calibration method
              aligns with{" "}
              <a
                href="https://www.nist.gov/pml/owm/metric-si/si-units-length"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 hover:text-accent/80 transition-colors"
              >
                NIST length measurement standards
              </a>.
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
      </article>

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
      {!isFullscreen && (
        <CalibratorModal
          isOpen={showCalibrator}
          onClose={() => setShowCalibrator(false)}
          ppi={ppi}
          onPpiChange={handlePpiChange}
        />
      )}
    </>
  );
}
