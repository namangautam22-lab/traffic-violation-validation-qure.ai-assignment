"use client";

import { useState, useEffect, useCallback } from "react";
import {
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
  CameraIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  BrainCircuitIcon,
} from "lucide-react";
import type { ViolationCase } from "@/types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { RecommendationBadge } from "./RecommendationBadge";
import { ReasonPicker } from "./ReasonPicker";
import { EvidenceViewer } from "./EvidenceViewer";
import { getReviewLane } from "@/data/cases";
import { useReview } from "@/context/ReviewContext";

interface Props {
  caseId: string;
  allPendingIds: string[];          // for prev/next navigation
  onClose: () => void;
  onDecision: (caseId: string, action: "approved" | "dismissed" | "escalated") => void;
  startTime: number;                // Date.now() when case was opened in modal
}

export function DetailModal({ caseId, allPendingIds, onClose, onDecision, startTime }: Props) {
  const { state, quickDecision } = useReview();

  const [currentId, setCurrentId]   = useState(caseId);
  const [reasonFor, setReasonFor]   = useState<"dismissed" | "escalated" | null>(null);
  const [localStart, setLocalStart] = useState(startTime);

  const violationCase = state.cases.find((c) => c.id === currentId);

  // Reset reason picker when navigating to a new case
  useEffect(() => {
    setReasonFor(null);
    setLocalStart(Date.now());
  }, [currentId]);

  // Keyboard shortcuts inside modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (reasonFor) {
        if (e.key === "Escape") setReasonFor(null);
        return;
      }
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "a": case "A":
          handleApprove();
          break;
        case "d": case "D":
          setReasonFor("dismissed");
          break;
        case "e": case "E":
          setReasonFor("escalated");
          break;
        case "j": case "ArrowDown": case "n":
          navigateNext();
          break;
        case "k": case "ArrowUp": case "p":
          navigatePrev();
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, reasonFor, allPendingIds]);

  if (!violationCase) return null;

  const lane           = getReviewLane(violationCase);
  const pendingAll     = state.cases.filter((c) => c.status === "pending");
  const casePosition   = allPendingIds.indexOf(currentId);
  const totalPending   = allPendingIds.length;

  function navigatePrev() {
    const idx = allPendingIds.indexOf(currentId);
    if (idx > 0) setCurrentId(allPendingIds[idx - 1]);
  }

  function navigateNext() {
    const idx = allPendingIds.indexOf(currentId);
    if (idx < allPendingIds.length - 1) setCurrentId(allPendingIds[idx + 1]);
  }

  function handleApprove() {
    const duration = Math.round((Date.now() - localStart) / 1000);
    quickDecision({ caseId: currentId, action: "approved", isEdgeCase: false, durationSeconds: duration });
    onDecision(currentId, "approved");
    // advance to next pending
    const remaining = allPendingIds.filter((id) => id !== currentId);
    if (remaining.length > 0) {
      const nextIdx = Math.min(allPendingIds.indexOf(currentId), remaining.length - 1);
      setCurrentId(remaining[nextIdx] ?? remaining[0]);
    } else {
      onClose();
    }
  }

  function handleReasonSubmit(payload: {
    reason: import("@/types").DismissReason;
    reasonLabel: string;
    note: string;
    isEdgeCase: boolean;
  }) {
    const duration = Math.round((Date.now() - localStart) / 1000);
    const action   = reasonFor!;
    quickDecision({ caseId: currentId, action, ...payload, durationSeconds: duration });
    onDecision(currentId, action);
    setReasonFor(null);
    const remaining = allPendingIds.filter((id) => id !== currentId);
    if (remaining.length > 0) {
      const nextIdx = Math.min(allPendingIds.indexOf(currentId), remaining.length - 1);
      setCurrentId(remaining[nextIdx] ?? remaining[0]);
    } else {
      onClose();
    }
  }

  const formattedTime = new Date(violationCase.timestamp).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const hasPrev = allPendingIds.indexOf(currentId) > 0;
  const hasNext = allPendingIds.indexOf(currentId) < allPendingIds.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
            {/* Prev/Next */}
            <div className="flex items-center gap-1">
              <button
                onClick={navigatePrev}
                disabled={!hasPrev}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous case (K)"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 mx-1.5 tabular-nums whitespace-nowrap">
                {casePosition + 1} / {totalPending} pending
              </span>
              <button
                onClick={navigateNext}
                disabled={!hasNext}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next case (J)"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Case identity */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{violationCase.violationLabel}</span>
              <span className="text-xs font-mono text-slate-400 shrink-0">{violationCase.id}</span>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <ConfidenceBadge confidence={violationCase.aiConfidence} />
              <RecommendationBadge lane={lane} />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shrink-0"
              title="Close (Esc)"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden">

            {/* LEFT: Evidence */}
            <div className="w-[58%] border-r border-slate-100 overflow-y-auto p-5">
              <EvidenceViewer violationCase={violationCase} />
            </div>

            {/* RIGHT: Details + Actions */}
            <div className="w-[42%] overflow-y-auto p-5 flex flex-col gap-4">

              {/* AI Rationale */}
              <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <BrainCircuitIcon className="w-3.5 h-3.5 text-violet-600" />
                  <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">AI Rationale</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">{violationCase.aiRationale}</p>
              </div>

              {/* Case metadata grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <MetaCell label="Camera" value={violationCase.cameraId} mono />
                <MetaCell label="AI Confidence" value={null}>
                  <ConfidenceBadge confidence={violationCase.aiConfidence} size="sm" />
                </MetaCell>
                <MetaCell label="Plate" value={violationCase.plateText} mono />
                <MetaCell label="Plate Confidence" value={`${violationCase.plateConfidence}%`} />
                <MetaCell label="Timestamp" value={formattedTime} />
                <MetaCell label="AI Suggestion" value={null}>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    violationCase.suggestedAction === "approve" ? "bg-emerald-100 text-emerald-800"
                    : violationCase.suggestedAction === "dismiss" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-800"
                  }`}>
                    {violationCase.suggestedAction === "approve" ? "Approve"
                     : violationCase.suggestedAction === "dismiss" ? "Dismiss"
                     : "Needs Review"}
                  </span>
                </MetaCell>
              </div>

              <MetaCell label="Location" value={violationCase.location} />

              {/* Exception flags */}
              {violationCase.exceptionFlags.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Exception Flags
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {violationCase.exceptionFlags.map((f) => (
                      <span key={f} className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        {f.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* ── Actions / Reason picker ── */}
              {reasonFor ? (
                <ReasonPicker
                  action={reasonFor}
                  onSubmit={handleReasonSubmit}
                  onCancel={() => setReasonFor(null)}
                />
              ) : (
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleApprove}
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all text-sm"
                  >
                    <CheckCircleIcon className="w-4.5 h-4.5" />
                    Approve Citation
                    <kbd className="ml-auto text-[10px] font-mono bg-emerald-700 px-1.5 py-0.5 rounded opacity-70">A</kbd>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setReasonFor("dismissed")}
                      className="flex items-center justify-center gap-1.5 bg-white border-2 border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-700 font-semibold py-2.5 rounded-xl transition-all text-sm"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Dismiss
                      <kbd className="ml-auto text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">D</kbd>
                    </button>
                    <button
                      onClick={() => setReasonFor("escalated")}
                      className="flex items-center justify-center gap-1.5 bg-white border-2 border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 font-semibold py-2.5 rounded-xl transition-all text-sm"
                    >
                      <ArrowUpCircleIcon className="w-4 h-4" />
                      Escalate
                      <kbd className="ml-auto text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">E</kbd>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer keyboard hint ── */}
          <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
            <p className="text-xs text-slate-400 text-center">
              <kbd className="font-mono font-bold text-slate-500">A</kbd> approve
              {" · "}
              <kbd className="font-mono font-bold text-slate-500">D</kbd> dismiss
              {" · "}
              <kbd className="font-mono font-bold text-slate-500">E</kbd> escalate
              {" · "}
              <kbd className="font-mono font-bold text-slate-500">J / K</kbd> next / prev
              {" · "}
              <kbd className="font-mono font-bold text-slate-500">Esc</kbd> close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function MetaCell({
  label, value, mono, children,
}: {
  label: string; value: string | null; mono?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 rounded-xl px-3 py-2.5">
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      {children ?? (
        <div className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</div>
      )}
    </div>
  );
}
