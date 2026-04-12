"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
  RotateCcwIcon,
  FlaskConicalIcon,
} from "lucide-react";
import type { ReviewRecord, ViolationCase } from "@/types";
import { useReview } from "@/context/ReviewContext";

interface Props {
  record: ReviewRecord;
  violationCase: ViolationCase;
}

export function DecisionSummary({ record, violationCase }: Props) {
  const router = useRouter();
  const { state, restartDemo, startWalkthrough, openCase } = useReview();
  const [auditExpanded, setAuditExpanded] = useState(false);

  const cfg = {
    approved: {
      icon:       <CheckCircleIcon className="w-12 h-12 text-emerald-500" />,
      headline:   "Citation Approved",
      subline:    "This case has been confirmed and the citation will be issued.",
      bg:         "bg-emerald-50",
      border:     "border-emerald-200",
      badge:      "bg-emerald-100 text-emerald-800",
    },
    dismissed: {
      icon:       <XCircleIcon className="w-12 h-12 text-red-500" />,
      headline:   "Case Dismissed",
      subline:    record.reasonLabel
                    ? `Reason: ${record.reasonLabel}`
                    : "Evidence was insufficient for a citation.",
      bg:         "bg-red-50",
      border:     "border-red-200",
      badge:      "bg-red-100 text-red-700",
    },
    escalated: {
      icon:       <ArrowUpCircleIcon className="w-12 h-12 text-purple-500" />,
      headline:   "Case Escalated",
      subline:    "Sent for senior review. A decision will be recorded separately.",
      bg:         "bg-purple-50",
      border:     "border-purple-200",
      badge:      "bg-purple-100 text-purple-800",
    },
  }[record.action];

  const nextCase = state.cases.find(
    (c) => c.status === "pending" && c.id !== violationCase.id
  );

  function handleNext() {
    if (!nextCase) return;
    openCase(nextCase.id);
    router.push(`/review/${nextCase.id}`);
  }

  function handleReplay() {
    startWalkthrough();
    const target = state.cases.find((c) => c.status === "pending") ?? state.cases[0];
    openCase(target.id);
    router.push(`/review/${target.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">

      {/* ── Outcome card ── */}
      <div className={`rounded-2xl border-2 ${cfg.border} ${cfg.bg} px-8 py-8 mb-5 text-center`}>
        <div className="flex justify-center mb-4">{cfg.icon}</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{cfg.headline}</h2>
        <p className="text-sm text-slate-600">{cfg.subline}</p>

        {/* Checklist summary */}
        <div className="flex justify-center gap-3 mt-5">
          {[
            { label: "Violation",  val: record.checklist.violationConfirmed },
            { label: "Plate",      val: record.checklist.vehicleConfirmed },
            { label: "Exception",  val: record.checklist.exceptionPresent },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="bg-white/70 rounded-xl border border-white px-4 py-2.5 text-center min-w-[80px]"
            >
              <div className="text-xs text-slate-500 mb-0.5">{label}</div>
              <div
                className={`text-sm font-bold ${
                  val === true  ? "text-emerald-700"
                  : val === false ? "text-red-700"
                  : "text-slate-400"
                }`}
              >
                {val === true ? "Yes" : val === false ? "No" : "—"}
              </div>
            </div>
          ))}
        </div>

        {/* Edge case */}
        {record.isEdgeCase && (
          <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full">
            <FlaskConicalIcon className="w-3.5 h-3.5" />
            Tagged as edge case · ML team will review
          </div>
        )}

        {/* Duration */}
        <p className="mt-4 text-xs text-slate-400">
          Reviewed in {record.durationSeconds}s · by {record.reviewerName}
        </p>
      </div>

      {/* ── Audit trail (collapsible) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5">
        <button
          onClick={() => setAuditExpanded(!auditExpanded)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Audit Record</span>
            <span className="text-xs text-slate-400">· legally defensible</span>
          </div>
          {auditExpanded
            ? <ChevronUpIcon className="w-4 h-4 text-slate-400" />
            : <ChevronDownIcon className="w-4 h-4 text-slate-400" />}
        </button>

        {auditExpanded && (
          <div className="border-t border-slate-100 px-5 py-4 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <AuditRow label="Case ID"      value={violationCase.id} mono />
            <AuditRow label="Action">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.badge}`}>
                {cfg.headline}
              </span>
            </AuditRow>
            <AuditRow label="Violation"    value={violationCase.violationLabel} />
            <AuditRow label="Reason"       value={record.reasonLabel ?? "—"} />
            <AuditRow label="Reviewer"     value={record.reviewerName} />
            <AuditRow label="Reviewer ID"  value={record.reviewerId} mono />
            <AuditRow
              label="Submitted"
              value={new Date(record.submittedAt).toLocaleString()}
            />
            <AuditRow label="AI Confidence" value={`${violationCase.aiConfidence}%`} />
            <AuditRow label="Plate"         value={violationCase.plateText} mono />
            <AuditRow label="Duration"      value={`${record.durationSeconds}s`} />
            {record.note && (
              <div className="col-span-2">
                <AuditRow label="Note" value={record.note} />
              </div>
            )}

            {/* Model feedback */}
            <div className="col-span-2 bg-slate-50 rounded-xl px-3 py-2.5 mt-1">
              <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Model feedback: </span>
                {record.action === "approved"
                  ? "Confirmed violation — positive training signal for the detection model."
                  : record.isEdgeCase
                  ? "Edge case queued for ML team review and model retraining."
                  : `Dismissal (${record.reasonLabel ?? record.reason ?? "—"}) logged as negative signal.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── CTAs ── */}
      <div className="flex flex-col gap-3">
        {nextCase ? (
          <button
            onClick={handleNext}
            className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all text-base shadow-lg shadow-blue-200"
          >
            Review Next Case
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-full text-center py-4 bg-slate-100 text-slate-500 text-sm rounded-xl font-medium">
            All caught up — no more pending cases
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleReplay}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
          >
            <RotateCcwIcon className="w-4 h-4" />
            Replay Walkthrough
          </button>
          <button
            onClick={() => { restartDemo(); router.push("/"); }}
            className="flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
          >
            Restart Demo
          </button>
        </div>
      </div>
    </div>
  );
}

function AuditRow({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </div>
      {children ?? (
        <div className={`text-slate-800 font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}>
          {value}
        </div>
      )}
    </div>
  );
}
