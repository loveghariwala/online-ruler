"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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

export default function FAQSection() {
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
              className={`transition-all duration-300 ease-in-out ${openIndex === i
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
