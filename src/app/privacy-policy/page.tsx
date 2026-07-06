import React from "react";
import Link from "next/link";
import { Ruler, ShieldAlert, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | RealOnlineRuler",
  description: "Read the privacy policy of RealOnlineRuler. Learn how we guarantee complete 100% client-side data privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen relative bg-slate-950 text-slate-100 font-sans">
      <div className="bg-gradient-orb bg-gradient-orb-1 opacity-25" />
      <div className="bg-gradient-orb bg-gradient-orb-2 opacity-25" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
              <Ruler className="w-4 h-4 text-accent" />
            </div>
            <span className="text-base font-bold text-slate-100">RealOnlineRuler</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors font-semibold"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Ruler
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-light max-w-xl mx-auto">
            Last Updated: July 6, 2026. We believe privacy is a fundamental human right.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold text-accent">100% Client-Side Privacy</h2>
            </div>
            <p className="text-sm text-muted-light leading-relaxed">
              RealOnlineRuler operates completely inside your web browser. Everything you do on this website—whether it is measuring objects, dragging cursor lines, entering resolution details, or adjusting diagonal sliders—is processed locally on your processor.
            </p>
            <p className="text-sm text-muted-light leading-relaxed">
              We do not upload coordinates, request access to your device camera, track your activities, or send measurement values to external servers. Your measurement tool is 100% private.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">Local Storage</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              To improve your user experience, we save your calibration settings (such as calculated PPI, theme mode, and preferred units) to your browser's local storage (`localStorage`). This data never leaves your device and is only used to recall your ruler scale when you return to the site. You can clear this data anytime by clearing your browser's cookies and site data.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">Third-Party Analytics</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              We may use privacy-friendly basic web analytics (like Cloudflare or Plausible) to monitor overall visitor numbers and server performance. These analytics do not track personal identifying coordinates, capture IP addresses, or store custom tracking cookies.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/5 pt-6">
            <h2 className="text-lg font-bold text-slate-200">Contact Us</h2>
            <p className="text-sm text-muted-light leading-relaxed">
              If you have any questions or concerns regarding our privacy principles, please contact us at <a href="mailto:privacy@realonlineruler.com" className="text-accent hover:underline">privacy@realonlineruler.com</a>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted">
          <span>© {new Date().getFullYear()} RealOnlineRuler. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground">About</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
