"use client";

import { CheckIcon } from "lucide-react";

interface StepDef {
  number: 1 | 2 | 3 | 4;
  label: string;
  shortLabel: string;
}

const STEPS: StepDef[] = [
  { number: 1, label: "Open Case",       shortLabel: "Case" },
  { number: 2, label: "Review Evidence", shortLabel: "Evidence" },
  { number: 3, label: "Check Flags",     shortLabel: "Flags" },
  { number: 4, label: "Submit Decision", shortLabel: "Submit" },
];

// Per-step instruction shown in the banner below the dots
const STEP_INSTRUCTIONS: Record<number, { action: string; detail: string }> = {
  1: {
    action: "Read the AI summary",
    detail: "Understand what was flagged and why before examining evidence.",
  },
  2: {
    action: "Examine all evidence frames",
    detail: "Verify the vehicle, plate text, and whether the violation is clearly visible.",
  },
  3: {
    action: "Answer the three checklist questions",
    detail: "Your answers are recorded and form the legal audit trail for this decision.",
  },
  4: {
    action: "Choose your action and submit",
    detail: "Approve, Dismiss, or Escalate. Every decision feeds back to the AI model.",
  },
};

interface StepperProps {
  currentStep: 1 | 2 | 3 | 4;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
  completedSteps?: Set<number>;
}

export function Stepper({
  currentStep,
  onStepClick,
  completedSteps = new Set(),
}: StepperProps) {
  const instruction = STEP_INSTRUCTIONS[currentStep];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-[57px] z-20">
      {/* ── Step dots row ── */}
      <div className="max-w-5xl mx-auto px-6 pt-4 pb-3">
        <div className="flex items-center">
          {STEPS.map((step, idx) => {
            const isActive    = step.number === currentStep;
            const isComplete  = completedSteps.has(step.number);
            const isClickable = !!onStepClick;

            return (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => isClickable && onStepClick(step.number)}
                  disabled={!isClickable}
                  className={`flex items-center gap-2.5 group ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  {/* Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all shrink-0
                      ${isActive
                        ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                        : isComplete
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-400"}
                    `}
                  >
                    {isComplete && !isActive ? <CheckIcon className="w-4 h-4" /> : step.number}
                  </div>

                  {/* Label — full on active, abbreviated otherwise */}
                  <span
                    className={`text-sm font-semibold whitespace-nowrap transition-colors ${
                      isActive    ? "text-blue-700"
                      : isComplete ? "text-emerald-700"
                      : "text-slate-400"
                    }`}
                  >
                    {isActive ? step.label : step.shortLabel}
                  </span>
                </button>

                {/* Connector */}
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 mx-3">
                    <div
                      className={`h-0.5 rounded-full transition-all ${
                        completedSteps.has(step.number) || currentStep > step.number
                          ? "bg-emerald-400"
                          : "bg-slate-100"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* Progress fraction */}
          <span className="ml-6 text-xs text-slate-400 font-medium whitespace-nowrap shrink-0">
            {currentStep} / 4
          </span>
        </div>
      </div>

      {/* ── Active step instruction banner ── */}
      {instruction && (
        <div className="bg-blue-600 text-white">
          <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest opacity-70 shrink-0">
              Step {currentStep}
            </span>
            <div className="w-px h-4 bg-blue-400 opacity-50 shrink-0" />
            <span className="text-sm font-semibold">{instruction.action}</span>
            <span className="hidden md:block text-sm text-blue-200 truncate">
              — {instruction.detail}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
