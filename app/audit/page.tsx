"use client";

import {
  ClipboardListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
  FlaskConicalIcon,
  ShieldCheckIcon,
  CameraIcon,
  ClockIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";

export default function AuditPage() {
  const { state } = useReview();

  // Combine submitted decisions with case data for rich display
  const records = state.decisions
    .slice()
    .reverse()
    .map((decision) => {
      const violationCase = state.cases.find(
        (c) => c.id === decision.caseId
      );
      return { decision, violationCase };
    });

  const actionConfig = {
    approved: {
      icon: <CheckCircleIcon className="w-4 h-4" />,
      label: "Approved",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    dismissed: {
      icon: <XCircleIcon className="w-4 h-4" />,
      label: "Dismissed",
      color: "text-red-700 bg-red-50 border-red-200",
    },
    escalated: {
      icon: <ArrowUpCircleIcon className="w-4 h-4" />,
      label: "Escalated",
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
            <h1 className="text-2xl font-bold text-slate-900">Audit Log</h1>
          </div>
          <p className="text-sm text-slate-500">
            Complete record of all human review decisions — legally defensible
            audit trail
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {records.length}
          </div>
          <div className="text-xs text-slate-400">decisions recorded</div>
        </div>
      </div>

      {/* Legal defensibility note */}
      <div className="bg-slate-800 text-slate-200 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <ShieldCheckIcon className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            Legal Defensibility
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every record below contains: original AI prediction, reviewer
            identity, structured decision reason, checklist confirmation state,
            and precise timestamp. This trail meets evidentiary standards for
            citation issuance and dispute resolution.
          </p>
        </div>
      </div>

      {/* Records */}
      {records.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <ClipboardListIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm font-medium">
            No decisions recorded yet
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Complete a case review to see audit records here
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {records.map(({ decision, violationCase }, idx) => {
            const config = actionConfig[decision.action];
            return (
              <div
                key={`${decision.caseId}-${idx}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
              >
                {/* Record header */}
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.color}`}
                    >
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {violationCase?.violationLabel ?? decision.caseId}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {decision.caseId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    {decision.isEdgeCase && (
                      <span className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-semibold">
                        <FlaskConicalIcon className="w-3 h-3" />
                        Edge Case
                      </span>
                    )}
                    <ClockIcon className="w-3 h-3" />
                    {new Date(decision.submittedAt).toLocaleString()}
                  </div>
                </div>

                {/* Record body */}
                <div className="px-5 py-4 grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                  <AuditRow
                    label="Reviewer"
                    value={decision.reviewerName}
                  />
                  <AuditRow
                    label="Reviewer ID"
                    value={decision.reviewerId}
                    mono
                  />
                  <AuditRow
                    label="Review Duration"
                    value={`${decision.durationSeconds}s`}
                  />

                  {violationCase && (
                    <>
                      <AuditRow
                        label="AI Confidence"
                        value={`${violationCase.aiConfidence}%`}
                      />
                      <AuditRow
                        label="Plate"
                        value={`${violationCase.plateText} (${violationCase.plateConfidence}%)`}
                        mono
                      />
                      <AuditRow
                        label="Camera ID"
                        value={violationCase.cameraId}
                        mono
                      />
                    </>
                  )}

                  {decision.reason && (
                    <AuditRow
                      label="Reason"
                      value={decision.reasonLabel ?? decision.reason}
                    />
                  )}

                  {/* Checklist */}
                  <div className="col-span-3">
                    <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide font-semibold">
                      Checklist Confirmation
                    </div>
                    <div className="flex gap-4">
                      {[
                        {
                          label: "Violation Confirmed",
                          val: decision.checklist.violationConfirmed,
                        },
                        {
                          label: "Vehicle Confirmed",
                          val: decision.checklist.vehicleConfirmed,
                        },
                        {
                          label: "Exception Present",
                          val: decision.checklist.exceptionPresent,
                        },
                      ].map(({ label, val }) => (
                        <div
                          key={label}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <span
                            className={`font-bold ${
                              val === true
                                ? "text-emerald-600"
                                : val === false
                                ? "text-red-600"
                                : "text-slate-400"
                            }`}
                          >
                            {val === true ? "✓" : val === false ? "✕" : "—"}
                          </span>
                          <span className="text-slate-600">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI rationale */}
                  {violationCase && (
                    <div className="col-span-3 bg-slate-50 rounded-xl px-3 py-2.5">
                      <div className="text-xs text-slate-400 mb-1 font-medium">
                        Original AI Rationale
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {violationCase.aiRationale}
                      </p>
                    </div>
                  )}

                  {decision.note && (
                    <div className="col-span-3">
                      <AuditRow
                        label="Reviewer Note"
                        value={decision.note}
                      />
                    </div>
                  )}
                </div>

                {/* Model feedback footer */}
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-600">
                      Model Feedback:{" "}
                    </span>
                    {decision.action === "approved"
                      ? "Confirmed violation — positive signal for detection model."
                      : decision.isEdgeCase
                      ? "Edge case tagged — queued for ML team review and model retraining."
                      : `Dismissed (${decision.reasonLabel ?? decision.reason ?? "—"}) — negative signal recorded for similar pattern detection.`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AuditRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div
        className={`text-sm text-slate-800 font-medium ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
