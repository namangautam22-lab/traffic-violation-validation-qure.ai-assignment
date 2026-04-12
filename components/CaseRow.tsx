"use client";

import { CheckCircleIcon, XCircleIcon, ArrowUpCircleIcon, ExternalLinkIcon, AlertTriangleIcon } from "lucide-react";
import type { ViolationCase } from "@/types";
import { ConfidenceBadge, StatusBadge } from "./ConfidenceBadge";
import { RecommendationBadge } from "./RecommendationBadge";
import { ReasonPicker } from "./ReasonPicker";
import { getReviewLane } from "@/data/cases";

interface Props {
  violationCase: ViolationCase;
  isActive: boolean;
  pickerOpen: "dismissed" | "escalated" | null;
  onActivate: () => void;
  onApprove: () => void;
  onDismissClick: () => void;
  onEscalateClick: () => void;
  onReasonSubmit: (payload: {
    reason: import("@/types").DismissReason;
    reasonLabel: string;
    note: string;
    isEdgeCase: boolean;
  }) => void;
  onPickerCancel: () => void;
  onView: () => void;
  caseIndex: number;   // for showing position
}

export function CaseRow({
  violationCase: c,
  isActive,
  pickerOpen,
  onActivate,
  onApprove,
  onDismissClick,
  onEscalateClick,
  onReasonSubmit,
  onPickerCancel,
  onView,
  caseIndex,
}: Props) {
  const lane    = getReviewLane(c);
  const isPending = c.status === "pending";
  const time    = new Date(c.timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      id={`case-${c.id}`}
      onClick={onActivate}
      className={`
        border-b border-slate-100 transition-colors
        ${isActive ? "bg-blue-50 border-l-[3px] border-l-blue-500" : "bg-white hover:bg-slate-50 border-l-[3px] border-l-transparent"}
      `}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3 px-4 py-3">

        {/* Index / active dot */}
        <div className="w-6 text-center shrink-0">
          {isActive
            ? <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" />
            : <span className="text-xs text-slate-300 tabular-nums">{caseIndex + 1}</span>
          }
        </div>

        {/* Lane + Violation label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <RecommendationBadge lane={lane} size="xs" />
            <span className="text-sm font-semibold text-slate-900 truncate">{c.violationLabel}</span>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">{c.id}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="shrink-0">{c.cameraId}</span>
            <span className="text-slate-200">·</span>
            <span className="truncate max-w-[200px]">{c.location.split("—")[0].trim()}</span>
            <span className="text-slate-200">·</span>
            <span className="shrink-0">{time}</span>
          </div>
        </div>

        {/* Plate */}
        <div className="shrink-0 text-right min-w-[88px]">
          <div className="text-sm font-bold font-mono text-slate-800">{c.plateText}</div>
          <div className={`text-xs ${c.plateConfidence >= 80 ? "text-emerald-600" : c.plateConfidence >= 60 ? "text-amber-600" : "text-red-600"}`}>
            plate {c.plateConfidence}%
          </div>
        </div>

        {/* Confidence */}
        <div className="shrink-0 w-28">
          <ConfidenceBadge confidence={c.aiConfidence} size="sm" />
        </div>

        {/* Exception flags — compact */}
        <div className="shrink-0 w-16">
          {c.exceptionFlags.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
              <AlertTriangleIcon className="w-2.5 h-2.5" />
              {c.exceptionFlags.length}
            </span>
          )}
        </div>

        {/* Actions or status */}
        <div className="shrink-0 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {isPending ? (
            <>
              <button
                onClick={onApprove}
                title="Approve (A)"
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
              >
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={onDismissClick}
                title="Dismiss (D)"
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border font-semibold transition-all ${
                  pickerOpen === "dismissed"
                    ? "bg-red-50 border-red-300 text-red-700"
                    : "border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-700"
                }`}
              >
                <XCircleIcon className="w-3.5 h-3.5" />
                Dismiss
              </button>
              <button
                onClick={onEscalateClick}
                title="Escalate (E)"
                className={`flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border font-semibold transition-all ${
                  pickerOpen === "escalated"
                    ? "bg-purple-50 border-purple-300 text-purple-700"
                    : "border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700"
                }`}
              >
                <ArrowUpCircleIcon className="w-3.5 h-3.5" />
                Esc
              </button>
              <button
                onClick={onView}
                title="View details (V)"
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 font-semibold transition-all"
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                View
              </button>
            </>
          ) : (
            <StatusBadge status={c.status} size="sm" />
          )}
        </div>
      </div>

      {/* ── Inline reason picker (expands below row) ── */}
      {pickerOpen && isPending && (
        <div
          className="px-14 pb-3"
          onClick={(e) => e.stopPropagation()}
        >
          <ReasonPicker
            action={pickerOpen}
            onSubmit={onReasonSubmit}
            onCancel={onPickerCancel}
          />
        </div>
      )}
    </div>
  );
}
