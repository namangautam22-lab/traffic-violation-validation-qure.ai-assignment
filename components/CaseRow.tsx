"use client";

import { CheckCircleIcon, XCircleIcon, ArrowUpCircleIcon, ExternalLinkIcon, AlertTriangleIcon, ChevronDownIcon, ChevronRightIcon, BrainCircuitIcon, CameraIcon } from "lucide-react";
import type { ViolationCase } from "@/types";
import { ConfidenceBadge, StatusBadge } from "./ConfidenceBadge";
import { RecommendationBadge } from "./RecommendationBadge";
import { ReasonPicker } from "./ReasonPicker";
import { MockCameraFrame } from "./MockCameraFrame";
import { getReviewLane, getDecisionGuidance } from "@/data/cases";

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
  caseIndex: number;
}

const GUIDANCE_CONFIG = {
  quick_approve:    { label: "Quick Approve",    classes: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  needs_review:     { label: "Needs Review",     classes: "bg-amber-100 text-amber-800 border-amber-200" },
  inspect_carefully:{ label: "Inspect Carefully", classes: "bg-orange-100 text-orange-800 border-orange-200" },
  escalate_likely:  { label: "Escalate Likely",  classes: "bg-purple-100 text-purple-800 border-purple-200" },
};

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
  const lane     = getReviewLane(c);
  const guidance = getDecisionGuidance(c);
  const isPending = c.status === "pending";
  const isExpanded = isActive;
  const primaryFrame = c.evidenceFrames.find((f) => f.isPrimary) ?? c.evidenceFrames[0];

  const time = new Date(c.timestamp).toLocaleString("en-IN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
  });

  return (
    <div
      id={`case-${c.id}`}
      className={`
        border-b border-slate-100 transition-all duration-150
        ${isExpanded
          ? "bg-blue-50/60 border-l-[3px] border-l-blue-500 shadow-sm"
          : "bg-white hover:bg-slate-50/70 border-l-[3px] border-l-transparent"}
      `}
    >
      {/* ── Collapsed / Summary Row ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer select-none"
        onClick={onActivate}
      >
        {/* Expand indicator */}
        <div className="w-5 shrink-0 text-center">
          {isExpanded
            ? <ChevronDownIcon className="w-3.5 h-3.5 text-blue-500 mx-auto" />
            : <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 mx-auto" />
          }
        </div>

        {/* Violation label + metadata */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <RecommendationBadge lane={lane} size="xs" />
            <span className="text-sm font-semibold text-slate-900 truncate">{c.violationLabel}</span>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">{c.id}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="shrink-0 font-mono">{c.cameraId}</span>
            <span className="text-slate-200">·</span>
            <span className="truncate max-w-[200px]">{c.location.split("—")[0].trim()}</span>
            <span className="text-slate-200">·</span>
            <span className="shrink-0">{time}</span>
          </div>
        </div>

        {/* Plate */}
        <div className="shrink-0 text-right min-w-[96px]">
          <div className="text-sm font-bold font-mono text-slate-800 tracking-wide">{c.plateText}</div>
          <div className={`text-xs ${c.plateConfidence >= 80 ? "text-emerald-600" : c.plateConfidence >= 60 ? "text-amber-600" : "text-red-600"}`}>
            plate {c.plateConfidence}%
          </div>
        </div>

        {/* AI Confidence */}
        <div className="shrink-0 w-28">
          <ConfidenceBadge confidence={c.aiConfidence} size="sm" />
        </div>

        {/* Exception flags */}
        <div className="shrink-0 w-14">
          {c.exceptionFlags.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full">
              <AlertTriangleIcon className="w-2.5 h-2.5" />
              {c.exceptionFlags.length}
            </span>
          )}
        </div>

        {/* Compact actions or status */}
        <div className="shrink-0 flex items-center gap-1.5 min-w-[220px] justify-end" onClick={(e) => e.stopPropagation()}>
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
                Escalate
              </button>
              <button
                onClick={onView}
                title="View details (V)"
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 font-semibold transition-all"
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

      {/* ── Expanded Details Panel ── */}
      {isExpanded && (
        <div className="px-5 pb-4 pt-0" onClick={(e) => e.stopPropagation()}>
          <div className="border border-blue-100 rounded-xl bg-white overflow-hidden shadow-sm">
            <div className="flex gap-0 divide-x divide-slate-100">

              {/* LEFT: Evidence thumbnail */}
              <div className="w-[200px] shrink-0 p-3 flex flex-col gap-2 bg-slate-950">
                {primaryFrame && (
                  <MockCameraFrame
                    frame={primaryFrame}
                    violationType={c.violationType}
                    plateText={c.plateText}
                    cameraId={c.cameraId}
                    isPrimary
                    size="thumb"
                  />
                )}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CameraIcon className="w-3 h-3 text-slate-500" />
                  <span className="text-[10px] font-mono text-slate-400">{c.cameraId}</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed">
                  {c.evidenceFrames.length} frame{c.evidenceFrames.length !== 1 ? "s" : ""} available
                  {" · "}
                  <button
                    onClick={onView}
                    className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    View all
                  </button>
                </div>
              </div>

              {/* MIDDLE: AI rationale + flags */}
              <div className="flex-1 p-3 flex flex-col gap-2.5 min-w-0">
                {/* Case details grid */}
                <div className="grid grid-cols-3 gap-2">
                  <DetailCell label="Location" value={c.location} />
                  <DetailCell label="Timestamp" value={new Date(c.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })} />
                  <DetailCell label="AI Suggestion" value={null}>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.suggestedAction === "approve" ? "bg-emerald-100 text-emerald-800"
                      : c.suggestedAction === "dismiss" ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-800"
                    }`}>
                      {c.suggestedAction === "approve" ? "Approve"
                       : c.suggestedAction === "dismiss" ? "Dismiss"
                       : "Needs Review"}
                    </span>
                  </DetailCell>
                  <DetailCell label="Plate" value={c.plateText} mono />
                  <DetailCell label="Plate Confidence" value={`${c.plateConfidence}%`} colored={c.plateConfidence >= 80 ? "green" : c.plateConfidence >= 60 ? "amber" : "red"} />
                  <DetailCell label="AI Confidence" value={null}>
                    <ConfidenceBadge confidence={c.aiConfidence} size="sm" />
                  </DetailCell>
                </div>

                {/* AI Rationale */}
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BrainCircuitIcon className="w-3 h-3 text-violet-600" />
                    <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wide">AI Rationale</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">{c.aiRationale}</p>
                </div>

                {/* Exception flags */}
                {c.exceptionFlags.length > 0 && (
                  <div className="flex items-start gap-1.5">
                    <AlertTriangleIcon className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {c.exceptionFlags.map((f) => (
                        <span key={f} className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-full">
                          {f.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: Decision guidance + actions */}
              <div className="w-[200px] shrink-0 p-3 flex flex-col gap-2.5 bg-slate-50">
                {/* Decision guidance */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Decision guidance</div>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${GUIDANCE_CONFIG[guidance].classes}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                    {GUIDANCE_CONFIG[guidance].label}
                  </span>
                </div>

                {/* Actions (expanded, clearer) */}
                {isPending ? (
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <button
                      onClick={onApprove}
                      className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Approve Citation
                    </button>
                    <button
                      onClick={onEscalateClick}
                      className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold border-2 transition-all ${
                        pickerOpen === "escalated"
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "border-purple-300 text-purple-700 hover:bg-purple-50"
                      }`}
                    >
                      <ArrowUpCircleIcon className="w-3.5 h-3.5" />
                      Escalate
                    </button>
                    <button
                      onClick={onDismissClick}
                      className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg font-semibold border transition-all ${
                        pickerOpen === "dismissed"
                          ? "bg-red-50 border-red-400 text-red-700"
                          : "border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-700"
                      }`}
                    >
                      <XCircleIcon className="w-3.5 h-3.5" />
                      Dismiss
                    </button>
                    <button
                      onClick={onView}
                      className="flex items-center justify-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all"
                    >
                      <ExternalLinkIcon className="w-3.5 h-3.5" />
                      Full Evidence View
                    </button>
                    <div className="flex justify-center gap-2 text-[10px] text-slate-400 mt-1">
                      <span><kbd className="font-mono font-bold">A</kbd> approve</span>
                      <span><kbd className="font-mono font-bold">D</kbd> dismiss</span>
                      <span><kbd className="font-mono font-bold">E</kbd> escalate</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto">
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* ── Inline reason picker ── */}
            {pickerOpen && isPending && (
              <div className="border-t border-slate-100 p-3 bg-white">
                <ReasonPicker
                  action={pickerOpen}
                  onSubmit={onReasonSubmit}
                  onCancel={onPickerCancel}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Inline reason picker (when NOT expanded — fallback) ── */}
      {pickerOpen && isPending && !isExpanded && (
        <div className="px-14 pb-3" onClick={(e) => e.stopPropagation()}>
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

function DetailCell({
  label, value, mono, colored, children,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  colored?: "green" | "amber" | "red";
  children?: React.ReactNode;
}) {
  const colorClass = colored === "green" ? "text-emerald-700"
    : colored === "amber" ? "text-amber-600"
    : colored === "red" ? "text-red-600"
    : "text-slate-800";
  return (
    <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      {children ?? (
        <div className={`text-xs font-semibold ${colorClass} ${mono ? "font-mono" : ""} truncate`}>
          {value}
        </div>
      )}
    </div>
  );
}
