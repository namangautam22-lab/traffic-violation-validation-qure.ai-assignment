"use client";

import { useReview } from "@/context/ReviewContext";

export function SummaryStrip() {
  const { state } = useReview();
  const s = state.sessionStats;
  const total    = state.cases.length;
  const pending  = state.cases.filter((c) => c.status === "pending").length;
  const done     = s.casesReviewed;
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
  const avgTime  = s.reviewTimes.length > 0
    ? (s.reviewTimes.reduce((a, b) => a + b, 0) / s.reviewTimes.length).toFixed(1)
    : "—";

  const metrics = [
    { label: "Pending",   value: pending,      color: "text-slate-700" },
    { label: "Reviewed",  value: done,          color: "text-blue-700"  },
    { label: "Approved",  value: s.approved,    color: "text-emerald-700" },
    { label: "Dismissed", value: s.dismissed,   color: "text-red-700"   },
    { label: "Escalated", value: s.escalated,   color: "text-purple-700" },
    { label: "Done",      value: `${pct}%`,     color: pct >= 50 ? "text-emerald-700" : "text-slate-700" },
    { label: "Avg time",  value: avgTime === "—" ? "—" : `${avgTime}s`, color: "text-slate-700" },
    { label: "Edge cases",value: s.edgeCasesTagged, color: "text-amber-700" },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-[1400px] mx-auto px-5 py-2 flex items-center gap-0 overflow-x-auto">
        {metrics.map((m, i) => (
          <div key={m.label} className="flex items-center shrink-0">
            {i > 0 && <div className="w-px h-3.5 bg-slate-700 mx-3" />}
            <span className="text-xs text-slate-500 mr-1.5 whitespace-nowrap">{m.label}</span>
            <span className={`text-sm font-bold tabular-nums ${m.color}`}>{m.value}</span>
          </div>
        ))}

        {/* Progress bar */}
        <div className="ml-auto pl-6 flex items-center gap-2 shrink-0">
          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 whitespace-nowrap">{pct}% complete</span>
        </div>
      </div>
    </div>
  );
}
