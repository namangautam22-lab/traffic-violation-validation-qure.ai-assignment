"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  CheckCircleIcon,
} from "lucide-react";

// ─── Step definitions ─────────────────────────────────────────────────────────

interface Step {
  /** Returns the DOM element to spotlight. null = centered modal. */
  getTarget: () => Element | null;
  placement: "below" | "above" | "right" | "left" | "center";
  icon: React.ElementType;
  color: "blue" | "slate" | "purple" | "emerald";
  title: string;
  body: string;
  tip: string;
}

const STEPS: Step[] = [
  {
    getTarget: () => document.getElementById("tour-summary-strip"),
    placement: "below",
    icon: LayoutDashboardIcon,
    color: "blue",
    title: "Session Overview at a Glance",
    body: "This bar shows your live session stats — pending cases, reviewed, approved, dismissed, escalated, completion percentage, and average review time. It updates in real time as you act.",
    tip: "Track your throughput without leaving the queue.",
  },
  {
    getTarget: () => document.getElementById("tour-filter-bar"),
    placement: "below",
    icon: SlidersHorizontalIcon,
    color: "slate",
    title: "Filter, Search & Sort",
    body: "Filter by status (Pending / Approved / Dismissed / Escalated), AI confidence level, or violation type. Sort by newest, oldest, or ambiguity. The search bar finds cases by ID, plate, location, or violation.",
    tip: "Press F to instantly jump to the search box.",
  },
  {
    getTarget: () => document.querySelector('[id^="case-"]'),
    placement: "center",
    icon: ListIcon,
    color: "slate",
    title: "Case Row — Collapsed Scan",
    body: "Each row shows violation type, case ID, camera ID, location, timestamp, number plate, plate confidence, AI confidence, and exception flags — everything needed to decide at a glance. The coloured lane badge (Quick Approve / Needs Review / Inspect) is AI-computed.",
    tip: "Use J / K (or arrow keys) to move between pending cases.",
  },
  {
    getTarget: () => document.querySelector('[id^="case-"]'),
    placement: "center",
    icon: ZapIcon,
    color: "blue",
    title: "Click to Expand — Inline Details",
    body: "Click any row to expand it inline. The expanded card reveals a live evidence thumbnail from the camera, the full AI rationale, a case detail grid, exception flags, and a Decision Guidance label — all without leaving the queue.",
    tip: "Decision guidance: Quick Approve / Needs Review / Inspect Carefully / Escalate Likely.",
  },
  {
    getTarget: () => document.querySelector('[id^="case-"]'),
    placement: "center",
    icon: ArrowUpCircleIcon,
    color: "purple",
    title: "Approve · Dismiss · Escalate",
    body: "Take action directly from the queue. Approve is one click. Dismiss and Escalate open a structured reason picker inline — select a reason, add an optional note, and submit. The next pending case is auto-focused after each action.",
    tip: "A = Approve · D = Dismiss · E = Escalate · V = Full evidence view.",
  },
  {
    getTarget: () => document.getElementById("tour-keyboard-strip"),
    placement: "above",
    icon: KeyboardIcon,
    color: "slate",
    title: "Keyboard Shortcuts",
    body: "ViolationIQ is built for speed. Navigate with J / K, approve with A, dismiss with D, escalate with E, and open the detail modal with V. Press ? at any time to see the full shortcut reference.",
    tip: "Esc closes any open picker, modal, or this tour.",
  },
  {
    getTarget: () => null,
    placement: "center",
    icon: CheckCircleIcon,
    color: "emerald",
    title: "You're ready to review",
    body: "Use the queue as your primary workspace. Expand cases inline, take most actions without opening the detail view, and escalate with a structured reason when needed. Speed up with keyboard shortcuts.",
    tip: "Click Tour in the top bar to replay this walkthrough at any time.",
  },
];

// ─── Colour config ────────────────────────────────────────────────────────────

const COLOR: Record<string, {
  header: string; iconBg: string; iconText: string;
  tip: string; progress: string; btn: string; ring: string;
}> = {
  blue: {
    header:   "bg-blue-600",
    iconBg:   "bg-blue-100",
    iconText: "text-blue-700",
    tip:      "bg-blue-50 border-blue-100 text-blue-700",
    progress: "bg-blue-500",
    btn:      "bg-blue-600 hover:bg-blue-700",
    ring:     "rgba(59,130,246,0.8)",
  },
  slate: {
    header:   "bg-slate-800",
    iconBg:   "bg-slate-100",
    iconText: "text-slate-700",
    tip:      "bg-slate-50 border-slate-200 text-slate-600",
    progress: "bg-slate-600",
    btn:      "bg-slate-800 hover:bg-slate-900",
    ring:     "rgba(100,116,139,0.8)",
  },
  purple: {
    header:   "bg-purple-600",
    iconBg:   "bg-purple-100",
    iconText: "text-purple-700",
    tip:      "bg-purple-50 border-purple-100 text-purple-700",
    progress: "bg-purple-500",
    btn:      "bg-purple-600 hover:bg-purple-700",
    ring:     "rgba(147,51,234,0.8)",
  },
  emerald: {
    header:   "bg-emerald-600",
    iconBg:   "bg-emerald-100",
    iconText: "text-emerald-700",
    tip:      "bg-emerald-50 border-emerald-100 text-emerald-700",
    progress: "bg-emerald-500",
    btn:      "bg-emerald-600 hover:bg-emerald-700",
    ring:     "rgba(16,185,129,0.8)",
  },
};

// ─── Geometry helpers ─────────────────────────────────────────────────────────

const SP = 10;   // spotlight padding around target
const GAP = 18;  // gap between spotlight edge and tooltip
const TW  = 390; // tooltip card width (px)

interface SpotRect { top: number; left: number; width: number; height: number }

const TH_EST = 300; // estimated tooltip height for overflow checks

function computeTooltipStyle(
  r: SpotRect,
  placement: Step["placement"]
): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Always-safe centered fallback
  const centered: React.CSSProperties = {
    top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: Math.min(TW, vw - 32),
  };

  // Horizontal center of spotlight target, clamped inside viewport
  const clampLeft = (x: number) => Math.max(16, Math.min(x, vw - TW - 16));
  const centerLeft = clampLeft(r.left + r.width / 2 - TW / 2);

  // If element is too wide for left/right placement, force center
  const isWide = r.width > vw * 0.55;

  switch (placement) {
    case "below": {
      const top = r.top + r.height + SP + GAP;
      // Not enough room below → try above
      if (top + TH_EST > vh - 8) {
        const aboveTop = r.top - SP - GAP - TH_EST;
        if (aboveTop >= 8) return { top: aboveTop, left: centerLeft, width: TW };
        return centered; // no room above or below → center
      }
      return { top, left: centerLeft, width: TW };
    }

    case "above": {
      const tooltipBottom = r.top - SP - GAP; // y of tooltip's bottom edge
      const tooltipTop = tooltipBottom - TH_EST;
      if (tooltipTop < 8) {
        // Not enough room above → try below
        const belowTop = r.top + r.height + SP + GAP;
        if (belowTop + TH_EST < vh - 8) return { top: belowTop, left: centerLeft, width: TW };
        return centered;
      }
      // Use CSS bottom so tooltip hugs the spotlight from above
      return { bottom: vh - tooltipBottom, left: centerLeft, width: TW };
    }

    case "right": {
      if (isWide) return centered; // element fills viewport width → can't fit right
      const left = r.left + r.width + SP + GAP;
      if (left + TW > vw - 8) {
        // Try left side
        const leftLeft = r.left - SP - GAP - TW;
        if (leftLeft >= 8) {
          return { top: Math.max(16, Math.min(r.top, vh - TH_EST - 16)), left: leftLeft, width: TW };
        }
        return centered; // no room either side
      }
      return { top: Math.max(16, Math.min(r.top, vh - TH_EST - 16)), left, width: TW };
    }

    case "left": {
      if (isWide) return centered;
      const left = r.left - SP - GAP - TW;
      if (left < 8) {
        // Try right side
        const rightLeft = r.left + r.width + SP + GAP;
        if (rightLeft + TW < vw - 8) {
          return { top: Math.max(16, Math.min(r.top, vh - TH_EST - 16)), left: rightLeft, width: TW };
        }
        return centered;
      }
      return { top: Math.max(16, Math.min(r.top, vh - TH_EST - 16)), left, width: TW };
    }

    case "center":
    default: {
      // If there's a spotlit element, position the tooltip so it doesn't
      // cover the highlighted area. Push tooltip toward whichever edge of the
      // viewport has more free space outside the spotlight.
      const targetCenterY = r.top + r.height / 2;
      const centerLeft = clampLeft(vw / 2 - TW / 2);

      if (targetCenterY <= vh / 2) {
        // Spotlight is in the upper half → push tooltip to the bottom
        const top = Math.max(
          r.top + r.height + 16,   // just below the element
          vh - TH_EST - 20          // anchored near viewport bottom
        );
        return { top: Math.min(top, vh - TH_EST - 12), left: centerLeft, width: TW };
      } else {
        // Spotlight is in the lower half → push tooltip to the top
        const top = Math.max(8, r.top - TH_EST - 16);
        return { top, left: centerLeft, width: TW };
      }
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

export function GuidedTour({ onClose }: Props) {
  const [stepIdx, setStepIdx] = useState(0);
  const [spotRect, setSpotRect] = useState<SpotRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: TW,
  });

  const total   = STEPS.length;
  const step    = STEPS[stepIdx];
  const Icon    = step.icon;
  const c       = COLOR[step.color];

  // ── Spotlight measurement ──
  const measureTarget = useCallback(() => {
    const el = step.getTarget();
    if (!el) {
      setSpotRect(null);
      setTooltipStyle({ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: TW });
      return;
    }
    // Scroll into view first (nearest so queue header doesn't disappear)
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      const sr: SpotRect = { top: r.top, left: r.left, width: r.width, height: r.height };
      setSpotRect(sr);
      setTooltipStyle(computeTooltipStyle(sr, step.placement));
    }, 350);
    return t;
  }, [step]);

  useEffect(() => {
    const t = measureTarget();
    return () => { if (t) clearTimeout(t); };
  }, [measureTarget]);

  useEffect(() => {
    const onResize = () => measureTarget();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureTarget]);

  // ── Keyboard navigation ──
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (stepIdx < total - 1) setStepIdx((s) => s + 1); else onClose();
      }
      if (e.key === "ArrowLeft" && stepIdx > 0) {
        e.preventDefault();
        setStepIdx((s) => s - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIdx, total, onClose]);

  const isLastStep = stepIdx === total - 1;
  const isCenter = step.placement === "center" || !spotRect;

  return (
    <>
      {/* ── Dark backdrop + click-to-close ── */}
      {isCenter ? (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ zIndex: 9040 }}
          onClick={onClose}
        />
      ) : (
        <div
          className="fixed inset-0"
          style={{ zIndex: 9040 }}
          onClick={onClose}
        />
      )}

      {/* ── SVG spotlight mask (only when we have a target) ── */}
      {spotRect && (
        <svg
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 9041, width: "100vw", height: "100vh" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="viq-spotlight">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={spotRect.left - SP}
                y={spotRect.top - SP}
                width={spotRect.width + SP * 2}
                height={spotRect.height + SP * 2}
                rx="10"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width="100%" height="100%"
            fill="rgba(0,0,0,0.68)"
            mask="url(#viq-spotlight)"
          />
        </svg>
      )}

      {/* ── Highlight ring around target ── */}
      {spotRect && (
        <div
          className="fixed pointer-events-none transition-all duration-300"
          style={{
            zIndex: 9042,
            top:    spotRect.top  - SP,
            left:   spotRect.left - SP,
            width:  spotRect.width  + SP * 2,
            height: spotRect.height + SP * 2,
            borderRadius: 10,
            border: `2px solid ${c.ring}`,
            boxShadow: `0 0 0 3px ${c.ring.replace("0.8", "0.2")}, 0 0 24px ${c.ring.replace("0.8", "0.4")}`,
          }}
        />
      )}

      {/* ── Connector arrow (only for side placements) ── */}
      {spotRect && (step.placement === "right" || step.placement === "left") && (
        <ConnectorArrow spotRect={spotRect} tooltipStyle={tooltipStyle} placement={step.placement} color={c.ring} />
      )}

      {/* ── Tooltip card ── */}
      <div
        className="fixed bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        style={{ zIndex: 9043, ...tooltipStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coloured header */}
        <div className={`${c.header} px-4 py-3.5 flex items-start justify-between gap-3`}>
          <div className="flex items-center gap-2.5">
            <div className={`${c.iconBg} w-8 h-8 rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${c.iconText}`} />
            </div>
            <div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest font-semibold mb-0.5">
                Step {stepIdx + 1} of {total}
              </div>
              <h2 className="text-sm font-bold text-white leading-snug">{step.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors shrink-0 mt-0.5"
            title="Close tour (Esc)"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className={`h-full ${c.progress} transition-all duration-300`}
            style={{ width: `${((stepIdx + 1) / total) * 100}%` }}
          />
        </div>

        {/* Body */}
        <div className="px-4 py-3.5">
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{step.body}</p>
          <div className={`flex items-start gap-1.5 text-xs border rounded-lg px-3 py-2 ${c.tip}`}>
            <span className="font-bold shrink-0 mt-px">Tip</span>
            <span className="leading-relaxed">{step.tip}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3.5 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {/* Step dots */}
            <div className="flex items-center gap-1 mr-1">
              {Array.from({ length: total }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStepIdx(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === stepIdx ? "w-4 h-2 bg-slate-700" : "w-2 h-2 bg-slate-200 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>

            {stepIdx > 0 && (
              <button
                onClick={() => setStepIdx((s) => s - 1)}
                className="flex items-center gap-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
              >
                <ChevronLeftIcon className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={() => { if (!isLastStep) setStepIdx((s) => s + 1); else onClose(); }}
              className={`flex items-center gap-1 text-xs px-4 py-1.5 rounded-lg font-bold text-white transition-all ${c.btn}`}
            >
              {isLastStep ? "Start reviewing" : (
                <>Next <ChevronRightIcon className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>
        </div>

        {/* Keyboard hint */}
        <div className="border-t border-slate-100 px-4 py-1.5 bg-slate-50">
          <p className="text-[10px] text-slate-400 text-center">
            <kbd className="font-mono font-bold text-slate-500">←</kbd>
            {" / "}
            <kbd className="font-mono font-bold text-slate-500">→</kbd>
            {" navigate · "}
            <kbd className="font-mono font-bold text-slate-500">Esc</kbd>
            {" close"}
          </p>
        </div>
      </div>
    </>
  );
}

// ─── ConnectorArrow ───────────────────────────────────────────────────────────

function ConnectorArrow({
  spotRect,
  tooltipStyle,
  placement,
  color,
}: {
  spotRect: SpotRect;
  tooltipStyle: React.CSSProperties;
  placement: "right" | "left";
  color: string;
}) {
  // We draw a small arrow from spotlight edge to tooltip edge
  const arrowSize = 8;
  const spotCy = spotRect.top + spotRect.height / 2;

  const arrowStyle: React.CSSProperties =
    placement === "right"
      ? {
          position: "fixed",
          zIndex: 9042,
          top: spotCy - arrowSize,
          left: spotRect.left + spotRect.width + SP,
          width: 0,
          height: 0,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderLeft: `${arrowSize}px solid ${color}`,
          pointerEvents: "none",
        }
      : {
          position: "fixed",
          zIndex: 9042,
          top: spotCy - arrowSize,
          left: spotRect.left - SP - arrowSize,
          width: 0,
          height: 0,
          borderTop: `${arrowSize}px solid transparent`,
          borderBottom: `${arrowSize}px solid transparent`,
          borderRight: `${arrowSize}px solid ${color}`,
          pointerEvents: "none",
        };

  return <div style={arrowStyle} />;
}
