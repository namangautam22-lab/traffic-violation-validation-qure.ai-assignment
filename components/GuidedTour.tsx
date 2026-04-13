"use client";

import { useState, useEffect } from "react";
import {
  XIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LayoutDashboardIcon,
  SlidersHorizontalIcon,
  ListIcon,
  ZapIcon,
  ArrowUpCircleIcon,
  KeyboardIcon,
  ExternalLinkIcon,
} from "lucide-react";

const TOUR_STEPS = [
  {
    icon: LayoutDashboardIcon,
    title: "Session Overview Strip",
    body: "The top bar shows your live session stats — pending cases, reviewed, approved, dismissed, escalated, and average review time. Track your progress at a glance without leaving the queue.",
    tip: "Pending count updates in real time as you act.",
    color: "blue",
  },
  {
    icon: SlidersHorizontalIcon,
    title: "Filters & Search",
    body: "Filter by status (Pending / Approved / Dismissed / Escalated), AI confidence level (High / Medium / Low), violation type, or sort order. Use the search bar to find cases by ID, plate, or location.",
    tip: "Press F to instantly focus the search field.",
    color: "slate",
  },
  {
    icon: ListIcon,
    title: "Queue Card — Collapsed View",
    body: "Each row shows the violation type, case ID, location, camera ID, timestamp, number plate, plate confidence, AI confidence, and exception flags — everything you need to decide at a glance.",
    tip: "Use J / K (or arrow keys) to navigate between pending cases.",
    color: "slate",
  },
  {
    icon: ZapIcon,
    title: "Queue Card — Expanded View",
    body: "Click any case (or press Enter) to expand it inline. The expanded card shows a live camera evidence thumbnail, full AI rationale, all exception flags, and a decision guidance label so most reviews stay in the queue.",
    tip: "Decision guidance labels — Quick Approve, Needs Review, Inspect Carefully, Escalate Likely — are computed from AI confidence, plate confidence, and flags.",
    color: "blue",
  },
  {
    icon: ArrowUpCircleIcon,
    title: "Approve · Dismiss · Escalate",
    body: "Act directly from the queue. Approve is one click. Dismiss and Escalate open an inline reason picker with structured options — Emergency Vehicle, OCR Mismatch, Contextual Ambiguity, Policy Ambiguity, and more. After submitting, the next pending case is auto-focused.",
    tip: "A = Approve · D = Dismiss · E = Escalate from keyboard.",
    color: "purple",
  },
  {
    icon: ExternalLinkIcon,
    title: "Full Evidence View",
    body: "Open the Detail Modal (press V or click View) only for complex cases. It shows all evidence frames, full AI rationale, case metadata, and full action controls. Use J / K to navigate between pending cases inside the modal.",
    tip: "Detail view is secondary — most cases should be decided from the queue.",
    color: "slate",
  },
  {
    icon: KeyboardIcon,
    title: "Keyboard Shortcuts",
    body: "ViolationIQ is built for speed. Navigate and decide without reaching for the mouse. Press ? at any time to see all shortcuts. The shortcut bar at the bottom of the queue is always visible.",
    tip: "Esc closes any open modal or picker.",
    color: "slate",
  },
];

const COLOR_MAP: Record<string, { header: string; icon: string; tip: string; progress: string; btn: string }> = {
  blue: {
    header:   "bg-blue-600",
    icon:     "bg-blue-100 text-blue-700",
    tip:      "bg-blue-50 border-blue-100 text-blue-700",
    progress: "bg-blue-500",
    btn:      "bg-blue-600 hover:bg-blue-700",
  },
  slate: {
    header:   "bg-slate-800",
    icon:     "bg-slate-100 text-slate-700",
    tip:      "bg-slate-50 border-slate-200 text-slate-600",
    progress: "bg-slate-600",
    btn:      "bg-slate-800 hover:bg-slate-900",
  },
  purple: {
    header:   "bg-purple-600",
    icon:     "bg-purple-100 text-purple-700",
    tip:      "bg-purple-50 border-purple-100 text-purple-700",
    progress: "bg-purple-500",
    btn:      "bg-purple-600 hover:bg-purple-700",
  },
};

interface Props {
  onClose: () => void;
}

export function GuidedTour({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const total = TOUR_STEPS.length;
  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const c = COLOR_MAP[current.color];

  // Keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (step < total - 1) setStep((s) => s + 1); else onClose();
      }
      if (e.key === "ArrowLeft" && step > 0) setStep((s) => s - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, total, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Tour card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg pointer-events-auto overflow-hidden">

          {/* Coloured header */}
          <div className={`${c.header} px-5 py-4 flex items-start justify-between gap-3`}>
            <div className="flex items-center gap-3">
              <div className={`${c.icon} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-0.5">
                  Step {step + 1} of {total}
                </div>
                <h2 className="text-base font-bold text-white leading-tight">{current.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors mt-0.5 shrink-0"
              title="Skip tour (Esc)"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <div
              className={`h-full ${c.progress} transition-all duration-300`}
              style={{ width: `${((step + 1) / total) * 100}%` }}
            />
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 leading-relaxed mb-3">{current.body}</p>

            <div className={`flex items-start gap-2 text-xs border rounded-lg px-3 py-2 ${c.tip}`}>
              <span className="font-bold mt-0.5 shrink-0">Tip:</span>
              <span>{current.tip}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {/* Dot indicators */}
              <div className="flex items-center gap-1 mr-2">
                {Array.from({ length: total }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all ${
                      i === step ? "w-4 h-2 bg-slate-700" : "w-2 h-2 bg-slate-200 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <button
                onClick={() => { if (step < total - 1) setStep((s) => s + 1); else onClose(); }}
                className={`flex items-center gap-1 text-xs px-4 py-1.5 rounded-lg font-bold text-white transition-all ${c.btn}`}
              >
                {step < total - 1 ? (
                  <>Next <ChevronRightIcon className="w-3.5 h-3.5" /></>
                ) : (
                  "Start reviewing"
                )}
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="border-t border-slate-100 px-5 py-2 bg-slate-50">
            <p className="text-[10px] text-slate-400 text-center">
              <kbd className="font-mono font-bold text-slate-500">←</kbd>
              {" / "}
              <kbd className="font-mono font-bold text-slate-500">→</kbd>
              {" navigate · "}
              <kbd className="font-mono font-bold text-slate-500">Esc</kbd>
              {" skip tour"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
