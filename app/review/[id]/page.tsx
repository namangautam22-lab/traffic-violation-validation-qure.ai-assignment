"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  CameraIcon,
  ClockIcon,
  ShieldAlertIcon,
  BrainCircuitIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { Stepper } from "@/components/Stepper";
import { EvidenceViewer } from "@/components/EvidenceViewer";
import { ReviewChecklist } from "@/components/ReviewChecklist";
import { DecisionSummary } from "@/components/DecisionSummary";
import { DismissModal } from "@/components/DismissModal";
import { WalkthroughOverlay } from "@/components/WalkthroughOverlay";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import type { UserDecision, DismissReason } from "@/types";

interface Props {
  params: { id: string };
}

export default function ReviewPage({ params }: Props) {
  const { id } = params;
  const router  = useRouter();

  const {
    state,
    currentCase,
    openCase,
    setStep,
    nextStep,
    setChecklist,
    submitDecision,
  } = useReview();

  const [modalAction, setModalAction] = useState<"dismissed" | "escalated" | null>(null);

  // Load the case when arriving on the page
  useEffect(() => {
    if (!currentCase || currentCase.id !== id) openCase(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Guard: case not in dataset
  useEffect(() => {
    if (!state.cases.find((c) => c.id === id)) router.replace("/queue");
  }, [id, state.cases, router]);

  const violationCase = state.cases.find((c) => c.id === id);
  if (!violationCase) return <div className="p-10 text-slate-400 text-center">Loading…</div>;

  const isGuided       = state.mode === "guided";
  const currentStep    = state.currentStep;
  const checklist      = state.checklist;
  const lastDecision   = state.lastDecision;
  const isSubmitted    = !!lastDecision && lastDecision.caseId === id;

  // Which steps are fully done?
  const completedSteps = new Set<number>();
  if (currentStep > 1) completedSteps.add(1);
  if (currentStep > 2) completedSteps.add(2);
  if (currentStep > 3) completedSteps.add(3);
  if (isSubmitted)     completedSteps.add(4);

  function handleApprove() {
    submitDecision({ action: "approved", isEdgeCase: false });
  }

  function handleModalSubmit(payload: {
    action: UserDecision;
    reason: DismissReason;
    reasonLabel: string;
    note: string;
    isEdgeCase: boolean;
  }) {
    setModalAction(null);
    submitDecision(payload);
  }

  const formattedTime = new Date(violationCase.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Final state after decision ────────────────────────────────────────────
  if (isSubmitted && currentStep === 4) {
    return (
      <div>
        <Stepper
          currentStep={4}
          onStepClick={setStep}
          completedSteps={new Set([1, 2, 3, 4])}
        />
        <DecisionSummary record={lastDecision!} violationCase={violationCase} />
        <WalkthroughOverlay currentStep={4} />
      </div>
    );
  }

  return (
    <div>
      {/* Sticky stepper */}
      <Stepper
        currentStep={currentStep}
        onStepClick={setStep}
        completedSteps={completedSteps}
      />

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Case header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <button
              onClick={() => router.push("/queue")}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-2 transition-colors"
            >
              <ArrowLeftIcon className="w-3 h-3" /> Back to queue
            </button>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {violationCase.violationLabel}
            </h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <ClockIcon className="w-3.5 h-3.5" /> {formattedTime}
              </span>
              <span className="flex items-center gap-1 text-sm text-slate-500">
                <MapPinIcon className="w-3.5 h-3.5" />
                {violationCase.location.split("—")[0].trim()}
              </span>
              <span className="flex items-center gap-1 text-xs font-mono text-slate-400">
                {violationCase.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <ConfidenceBadge confidence={violationCase.aiConfidence} />
            <div className="text-right">
              <div className="text-xs text-slate-400">Plate</div>
              <div className="text-sm font-bold font-mono text-slate-800">
                {violationCase.plateText}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-[1fr_300px] gap-6">

          {/* LEFT: Step content */}
          <div className="flex flex-col gap-5">

            {/* ── STEP 1: AI Summary ─────────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <BrainCircuitIcon className="w-4.5 h-4.5 text-violet-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-800">AI Detection Summary</span>
                  <span className="ml-auto text-xs text-slate-400">
                    Camera {violationCase.cameraId}
                  </span>
                </div>

                <div className="px-5 py-5">
                  {/* AI rationale — the most important text on this step */}
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-5 py-4 mb-5">
                    <p className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">
                      Why AI flagged this case
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {violationCase.aiRationale}
                    </p>
                  </div>

                  {/* Key details */}
                  <div className="grid grid-cols-2 gap-3">
                    <DetailCell label="AI Confidence">
                      <ConfidenceBadge confidence={violationCase.aiConfidence} />
                    </DetailCell>
                    <DetailCell label="AI Suggestion">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          violationCase.suggestedAction === "approve"
                            ? "bg-emerald-100 text-emerald-800"
                            : violationCase.suggestedAction === "dismiss"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {violationCase.suggestedAction === "approve"
                          ? "Approve"
                          : violationCase.suggestedAction === "dismiss"
                          ? "Dismiss"
                          : "Needs Review"}
                      </span>
                    </DetailCell>
                    <DetailCell label="Plate" mono value={violationCase.plateText} />
                    <DetailCell label="Plate confidence" value={`${violationCase.plateConfidence}%`} />
                    <DetailCell
                      label="Camera"
                      mono
                      value={violationCase.cameraId}
                    />
                    <DetailCell
                      label="Evidence frames"
                      value={`${violationCase.evidenceFrames.length} frames`}
                    />
                  </div>

                  {/* Exception flags */}
                  {violationCase.exceptionFlags.length > 0 && (
                    <div className="mt-4 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                      <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                        <AlertTriangleIcon className="w-3.5 h-3.5" />
                        AI Exception Flags — pay attention
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {violationCase.exceptionFlags.map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full"
                          >
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── STEP 2: Evidence ───────────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <CameraIcon className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-800">Evidence Viewer</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {violationCase.evidenceFrames.length} frames · HD Camera
                  </span>
                </div>
                <div className="p-5">
                  <EvidenceViewer violationCase={violationCase} />
                </div>
              </div>
            )}

            {/* ── STEP 3: Checklist ──────────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <CheckCircleIcon className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-800">Review Checklist</span>
                  <span className="ml-auto text-xs text-slate-400">
                    All three answers required
                  </span>
                </div>
                <div className="p-5">
                  <ReviewChecklist checklist={checklist} onChange={setChecklist} />
                </div>
              </div>
            )}

            {/* ── STEP 4: Action Panel ───────────────────────────────────── */}
            {currentStep === 4 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <ShieldAlertIcon className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-800">Select Your Decision</span>
                </div>

                <div className="p-5">
                  {/* Checklist recap */}
                  <div className="flex items-center gap-2 mb-6 bg-slate-50 rounded-xl px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500 mr-2">Your answers:</span>
                    {[
                      { label: "Violation", val: checklist.violationConfirmed },
                      { label: "Plate",     val: checklist.vehicleConfirmed },
                      { label: "Exception", val: checklist.exceptionPresent },
                    ].map(({ label, val }) => (
                      <span
                        key={label}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          val === true  ? "bg-emerald-100 text-emerald-800"
                          : val === false ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {label}: {val === true ? "Yes" : val === false ? "No" : "—"}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons — large, clear, hierarchical */}
                  <div className="flex flex-col gap-3">
                    {/* Approve — primary */}
                    <button
                      onClick={handleApprove}
                      className="flex items-center gap-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-4 transition-all text-left"
                    >
                      <CheckCircleIcon className="w-7 h-7 shrink-0" />
                      <div>
                        <div className="text-base font-bold">Approve Citation</div>
                        <div className="text-xs text-emerald-200 mt-0.5">
                          Violation is confirmed — citation will be issued
                        </div>
                      </div>
                    </button>

                    {/* Secondary row */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setModalAction("dismissed")}
                        className="flex items-center gap-3 bg-white hover:bg-red-50 border-2 border-slate-200 hover:border-red-300 text-slate-800 rounded-xl px-4 py-4 transition-all text-left"
                      >
                        <XCircleIcon className="w-6 h-6 text-red-500 shrink-0" />
                        <div>
                          <div className="text-sm font-bold">Dismiss</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Evidence insufficient or exception applies
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => setModalAction("escalated")}
                        className="flex items-center gap-3 bg-white hover:bg-purple-50 border-2 border-slate-200 hover:border-purple-300 text-slate-800 rounded-xl px-4 py-4 transition-all text-left"
                      >
                        <ArrowUpCircleIcon className="w-6 h-6 text-purple-500 shrink-0" />
                        <div>
                          <div className="text-sm font-bold">Escalate</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Needs senior review or legal input
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  onClick={() => setStep((currentStep - 1) as 1 | 2 | 3 | 4)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors px-3 py-2"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back
                </button>
              )}

              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-md shadow-blue-200"
                >
                  Continue to Step {currentStep + 1}
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR: always visible ────────────────────────────── */}
          <div className="flex flex-col gap-4">

            {/* Case details */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Case Details
                </p>
              </div>
              <div className="px-4 py-4 flex flex-col gap-3">
                <SidebarRow label="Case ID"    value={violationCase.id} mono />
                <SidebarRow label="Violation"  value={violationCase.violationLabel} />
                <SidebarRow label="Timestamp"  value={formattedTime} />
                <SidebarRow label="Location"   value={violationCase.location.split("—")[0].trim()} />
                <SidebarRow label="Camera"     value={violationCase.cameraId} mono />
                <div>
                  <div className="text-xs text-slate-400 mb-1">AI Confidence</div>
                  <ConfidenceBadge confidence={violationCase.aiConfidence} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Plate</div>
                  <code className="text-sm font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {violationCase.plateText}
                  </code>
                  <span className="text-xs text-slate-400 ml-1.5">
                    ({violationCase.plateConfidence}%)
                  </span>
                </div>
              </div>
            </div>

            {/* What to do next — prominent, step-aware */}
            <div className="bg-blue-600 text-white rounded-2xl px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-200 mb-1.5">
                What to do now
              </p>
              <p className="text-sm leading-relaxed font-medium">
                {currentStep === 1 && "Read the AI rationale on the left. When ready, click Continue."}
                {currentStep === 2 && "Examine the camera frames. Check the plate, vehicle, and violation. When done, click Continue."}
                {currentStep === 3 && "Answer all three questions. They form the audit trail for this decision."}
                {currentStep === 4 && "Choose Approve, Dismiss, or Escalate. Your decision will be recorded."}
              </p>
              {currentStep < 4 && (
                <button
                  onClick={nextStep}
                  className="mt-3 w-full text-center text-xs font-bold text-blue-200 hover:text-white transition-colors"
                >
                  Continue to Step {currentStep + 1} →
                </button>
              )}
            </div>

            {/* AI recommendation */}
            <div
              className={`border rounded-xl px-4 py-3.5 ${
                violationCase.suggestedAction === "approve"
                  ? "bg-emerald-50 border-emerald-200"
                  : violationCase.suggestedAction === "dismiss"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                AI Recommendation
              </p>
              <p
                className={`text-sm font-bold ${
                  violationCase.suggestedAction === "approve"
                    ? "text-emerald-800"
                    : violationCase.suggestedAction === "dismiss"
                    ? "text-red-800"
                    : "text-amber-800"
                }`}
              >
                {violationCase.suggestedAction === "approve"
                  ? "Approve Citation"
                  : violationCase.suggestedAction === "dismiss"
                  ? "Dismiss Case"
                  : "Request Human Review"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                AI guidance only — your judgment overrides.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss / Escalate modal */}
      {modalAction && (
        <DismissModal
          action={modalAction}
          onClose={() => setModalAction(null)}
          onSubmit={handleModalSubmit}
        />
      )}

      <WalkthroughOverlay currentStep={currentStep} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailCell({
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
    <div className="bg-slate-50 rounded-xl px-3.5 py-3">
      <div className="text-xs text-slate-400 font-medium mb-1">{label}</div>
      {children ?? (
        <div className={`text-sm font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>
          {value}
        </div>
      )}
    </div>
  );
}

function SidebarRow({
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
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className={`text-sm text-slate-800 font-medium leading-snug ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </div>
    </div>
  );
}
