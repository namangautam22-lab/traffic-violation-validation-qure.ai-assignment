"use client";

import {
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
  FlaskConicalIcon,
  ZapIcon,
  BrainCircuitIcon,
  BarChart2Icon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { MOCK_CASES, DISMISS_REASONS } from "@/data/cases";

export default function InsightsPage() {
  const { state } = useReview();
  const { decisions, cases, sessionStats } = state;

  // ── Compute live metrics from session + mocked baselines ────────────────

  // Real session data
  const totalReviewed = sessionStats.casesReviewed;
  const avgReviewTime =
    sessionStats.reviewTimes.length > 0
      ? Math.round(
          sessionStats.reviewTimes.reduce((a, b) => a + b, 0) /
            sessionStats.reviewTimes.length
        )
      : 0;
  const fastReviews = sessionStats.reviewTimes.filter((t) => t <= 10).length;
  const fastPercent =
    sessionStats.reviewTimes.length > 0
      ? Math.round((fastReviews / sessionStats.reviewTimes.length) * 100)
      : 0;

  // Decision split
  const approvedCount = sessionStats.approved;
  const dismissedCount = sessionStats.dismissed;
  const escalatedCount = sessionStats.escalated;
  const totalDecisions = approvedCount + dismissedCount + escalatedCount;

  // Most common dismissal reason
  const reasonCounts: Record<string, number> = {};
  decisions.forEach((d) => {
    if (d.reason) {
      reasonCounts[d.reason] = (reasonCounts[d.reason] ?? 0) + 1;
    }
  });
  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // AI-human disagreement rate
  const disagreements = decisions.filter((d) => {
    const c = cases.find((c) => c.id === d.caseId);
    if (!c) return false;
    if (c.suggestedAction === "approve" && d.action !== "approved") return true;
    if (c.suggestedAction === "dismiss" && d.action !== "dismissed") return true;
    return false;
  }).length;
  const disagreementRate =
    totalDecisions > 0
      ? Math.round((disagreements / totalDecisions) * 100)
      : 0;

  // Edge cases tagged
  const edgeCasesTagged = sessionStats.edgeCasesTagged;

  // ── Mocked baseline stats for demo richness ──────────────────────────────
  const MOCKED_TOTAL = 1243;
  const MOCKED_AVG_TIME = 38; // seconds
  const MOCKED_FAST_PCT = 67;
  const MOCKED_APPROVAL_RATE = 71;
  const MOCKED_DISMISS_RATE = 22;
  const MOCKED_ESCALATE_RATE = 7;
  const MOCKED_DISAGREEMENT = 14;
  const MOCKED_EDGE_CASES = 89;

  // Use session values if available, otherwise mocked
  const displayAvg = totalReviewed > 0 ? avgReviewTime : MOCKED_AVG_TIME;
  const displayFastPct = totalReviewed > 0 ? fastPercent : MOCKED_FAST_PCT;
  const displayDisagreement =
    totalDecisions > 0 ? disagreementRate : MOCKED_DISAGREEMENT;

  const approvalRate =
    totalDecisions > 0
      ? Math.round((approvedCount / totalDecisions) * 100)
      : MOCKED_APPROVAL_RATE;
  const dismissRate =
    totalDecisions > 0
      ? Math.round((dismissedCount / totalDecisions) * 100)
      : MOCKED_DISMISS_RATE;
  const escalateRate =
    totalDecisions > 0
      ? Math.round((escalatedCount / totalDecisions) * 100)
      : MOCKED_ESCALATE_RATE;

  const displayEdgeCases =
    edgeCasesTagged > 0 ? edgeCasesTagged : MOCKED_EDGE_CASES;

  // Pending cases by confidence
  const pending = cases.filter((c) => c.status === "pending");
  const pendingHigh = pending.filter((c) => c.aiConfidence >= 85).length;
  const pendingMed = pending.filter(
    (c) => c.aiConfidence >= 65 && c.aiConfidence < 85
  ).length;
  const pendingLow = pending.filter((c) => c.aiConfidence < 65).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart2Icon className="w-5 h-5 text-slate-600" />
            <h1 className="text-2xl font-bold text-slate-900">
              Insights & Metrics
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Review performance, AI accuracy, and queue health
          </p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-2 rounded-lg">
          {totalReviewed > 0
            ? `Live session data · ${totalReviewed} decisions`
            : "Demo data · connect to live session to see real stats"}
        </div>
      </div>

      {/* Primary KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard
          icon={<CheckCircleIcon className="w-5 h-5 text-emerald-600" />}
          label="Cases Reviewed"
          value={totalReviewed > 0 ? totalReviewed : MOCKED_TOTAL}
          sub="total in session / demo"
          bg="bg-white"
        />
        <KPICard
          icon={<ClockIcon className="w-5 h-5 text-blue-600" />}
          label="Avg Review Time"
          value={`${displayAvg}s`}
          sub="per case"
          bg="bg-white"
          highlight={displayAvg <= 45}
        />
        <KPICard
          icon={<ZapIcon className="w-5 h-5 text-amber-600" />}
          label="Under 10s Reviews"
          value={`${displayFastPct}%`}
          sub="completed in ≤10 seconds"
          bg="bg-white"
        />
        <KPICard
          icon={<FlaskConicalIcon className="w-5 h-5 text-violet-600" />}
          label="Edge Cases Tagged"
          value={displayEdgeCases}
          sub="flagged for retraining"
          bg="bg-white"
        />
      </div>

      {/* Two column: decision split + disagreement rate */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Decision split */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">
              Decision Split
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Approve vs Dismiss vs Escalate
            </p>
          </div>
          <div className="p-5">
            {/* Bar chart visual */}
            <div className="flex h-8 rounded-lg overflow-hidden mb-4">
              <div
                className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{ width: `${approvalRate}%` }}
              >
                {approvalRate > 10 ? `${approvalRate}%` : ""}
              </div>
              <div
                className="bg-red-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{ width: `${dismissRate}%` }}
              >
                {dismissRate > 10 ? `${dismissRate}%` : ""}
              </div>
              <div
                className="bg-purple-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                style={{ width: `${escalateRate}%` }}
              >
                {escalateRate > 5 ? `${escalateRate}%` : ""}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {[
                {
                  label: "Approved",
                  pct: approvalRate,
                  count: approvedCount || Math.round(MOCKED_TOTAL * 0.71),
                  color: "bg-emerald-500",
                  textColor: "text-emerald-700",
                },
                {
                  label: "Dismissed",
                  pct: dismissRate,
                  count: dismissedCount || Math.round(MOCKED_TOTAL * 0.22),
                  color: "bg-red-400",
                  textColor: "text-red-700",
                },
                {
                  label: "Escalated",
                  pct: escalateRate,
                  count: escalatedCount || Math.round(MOCKED_TOTAL * 0.07),
                  color: "bg-purple-400",
                  textColor: "text-purple-700",
                },
              ].map(({ label, pct, count, color, textColor }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                    <span className="text-slate-700">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-xs">{count}</span>
                    <span className={`font-bold text-sm ${textColor}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI-Human Disagreement */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">
              AI — Human Agreement
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Where humans override AI suggestions
            </p>
          </div>
          <div className="p-5">
            {/* Big number */}
            <div className="text-center mb-4">
              <div className="text-5xl font-extrabold text-slate-900 mb-1">
                {displayDisagreement}%
              </div>
              <div className="text-sm text-slate-500">
                disagreement rate
              </div>
              <div
                className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                  displayDisagreement <= 15
                    ? "bg-emerald-100 text-emerald-700"
                    : displayDisagreement <= 25
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {displayDisagreement <= 15
                  ? "Within healthy range"
                  : displayDisagreement <= 25
                  ? "Review model calibration"
                  : "High — model retraining recommended"}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-800 mb-1">
                Why this matters
              </p>
              <p className="leading-relaxed">
                When humans consistently override AI, it signals the model
                needs recalibration. Disagreements are automatically queued
                for ML team review to improve future predictions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: dismissal reasons + queue health */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Dismissal Reasons */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">
              Top Dismissal Reasons
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Most common reasons for case dismissal
            </p>
          </div>
          <div className="p-5">
            {topReasons.length > 0 ? (
              <div className="flex flex-col gap-3">
                {topReasons.map(([reason, count]) => {
                  const label =
                    DISMISS_REASONS.find((r) => r.value === reason)?.label ??
                    reason;
                  const maxCount = topReasons[0][1];
                  const width = Math.round((count / maxCount) * 100);
                  return (
                    <div key={reason}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">
                          {label}
                        </span>
                        <span className="text-slate-400">{count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-400 rounded-full"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Mocked data for demo
              <div className="flex flex-col gap-3">
                {[
                  { label: "Poor Visibility / Weather", count: 31, pct: 100 },
                  { label: "Unreadable Plate", count: 24, pct: 77 },
                  { label: "No Actual Violation", count: 18, pct: 58 },
                  { label: "Ambiguous Lane Marking", count: 12, pct: 39 },
                ].map(({ label, count, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-700 font-medium">
                        {label}
                      </span>
                      <span className="text-slate-400">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Queue Health */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Queue Health</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Pending cases by AI confidence bucket
            </p>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3 mb-4">
              {[
                {
                  label: "High Confidence (≥85%)",
                  count: pendingHigh,
                  color: "bg-emerald-500",
                  textColor: "text-emerald-700",
                  note: "Straightforward to approve",
                },
                {
                  label: "Medium (65–84%)",
                  count: pendingMed,
                  color: "bg-amber-500",
                  textColor: "text-amber-700",
                  note: "Review evidence carefully",
                },
                {
                  label: "Low Confidence (<65%)",
                  count: pendingLow,
                  color: "bg-red-400",
                  textColor: "text-red-700",
                  note: "Likely to dismiss or escalate",
                },
              ].map(({ label, count, color, textColor, note }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                  >
                    {count}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-700">
                      {label}
                    </div>
                    <div className="text-xs text-slate-400">{note}</div>
                  </div>
                  <span className={`text-sm font-bold ${textColor}`}>
                    {pending.length > 0
                      ? Math.round((count / pending.length) * 100)
                      : 0}
                    %
                  </span>
                </div>
              ))}
            </div>

            {/* Model feedback loop reminder */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BrainCircuitIcon className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-semibold text-violet-800">
                  Model Feedback Loop
                </span>
              </div>
              <p className="text-xs text-violet-700 leading-relaxed">
                {displayEdgeCases} edge cases have been tagged for ML review.
                Human overrides are logged as training signals to reduce false
                positives in future detections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  sub,
  bg,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`${bg} border border-slate-200 rounded-2xl px-5 py-5 ${
        highlight ? "ring-2 ring-emerald-200" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-3">{icon}</div>
      <div className="text-3xl font-extrabold text-slate-900 mb-0.5">
        {value}
      </div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}
