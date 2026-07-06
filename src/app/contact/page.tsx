import React from "react";
import Link from "next/link";
import { Ruler, Mail, MapPin, ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Contact Us | RealOnlineRuler",
  description: "Get in touch with the team at RealOnlineRuler. Submit suggestions, bugs, or general feedback.",
};

export default function ContactPage() {
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
            Contact Us
          </h1>
          <p className="text-sm text-muted-light max-w-xl mx-auto">
            Have questions, feedback, or a feature request? Drop us a line and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Info Side */}
          <div className="md:col-span-2 space-y-4">
            <div className="glass rounded-2xl p-5 space-y-4">
              <h2 className="text-base font-bold text-accent">Get in Touch</h2>
              
              <div className="flex items-start gap-3 text-xs text-muted-light">
                <Mail className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Email</div>
                  <a href="mailto:support@realonlineruler.com" className="hover:text-accent mt-0.5 block">
                    support@realonlineruler.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-muted-light">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">Location</div>
                  <div className="mt-0.5">San Francisco, CA, USA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="md:col-span-3">
            <form className="glass rounded-2xl p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name-input" className="block text-xs font-semibold text-muted">Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="Your Name"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-semibold text-muted">Email</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="msg-input" className="block text-xs font-semibold text-muted">Message</label>
                <textarea
                  id="msg-input"
                  rows={4}
                  required
                  placeholder="Tell us what you think..."
                  className="w-full bg-white/[0.03] border border-white/5 focus:border-accent focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-accent border border-accent/25 text-slate-950 font-semibold text-xs hover:opacity-90 transition-all cursor-pointer shadow-lg"
              >
                Send Message
              </button>
            </form>
          </div>
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
