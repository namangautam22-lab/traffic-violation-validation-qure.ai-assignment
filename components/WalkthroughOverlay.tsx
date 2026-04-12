"use client";

import { XIcon, ArrowRightIcon, BookOpenIcon } from "lucide-react";
import { useReview } from "@/context/ReviewContext";

const TIPS = [
  {
    step: 1,
    eyebrow: "Step 1 of 4",
    title: "Read the AI summary",
    body: "The system has already analyzed this case. Read the AI Rationale — it tells you what was detected, the confidence level, and any exception flags. You're not starting blind.",
    cta: "Got it — show me the evidence",
  },
  {
    step: 2,
    eyebrow: "Step 2 of 4",
    title: "Examine the evidence",
    body: "Click through the camera frames. Look at the highlighted zones: vehicle position, plate text, signal state. The primary frame shows the exact moment of the violation.",
    cta: "Evidence reviewed — continue",
  },
  {
    step: 3,
    eyebrow: "Step 3 of 4",
    title: "Answer the checklist",
    body: "Three simple Yes/No questions. Was there a violation? Is the plate readable? Is there an exception (emergency vehicle, bad weather, etc.)? Your answers become the legal record.",
    cta: "Checklist done — choose action",
  },
  {
    step: 4,
    eyebrow: "Step 4 of 4",
    title: "Submit your decision",
    body: "Pick one: Approve the citation, Dismiss the case, or Escalate for a senior review. Dismiss and Escalate need a reason. Your decision is logged and feeds back to improve the AI.",
    cta: "Understood — I'm ready",
  },
];

export function WalkthroughOverlay({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  const { state, advanceWalkthrough, endWalkthrough, setStep } = useReview();

  if (!state.walkthroughActive) return null;

  const tip = TIPS.find((t) => t.step === currentStep) ?? TIPS[0];
  const isLast = currentStep === 4;

  function handleCta() {
    if (isLast) {
      endWalkthrough();
    } else {
      setStep((currentStep + 1) as 1 | 2 | 3 | 4);
      advanceWalkthrough();
    }
  }

  return (
    <>
      {/* Dim backdrop — doesn't block clicks */}
      <div className="fixed inset-0 bg-slate-900/20 z-40 pointer-events-none" aria-hidden />

      {/* Tip card */}
      <div className="fixed bottom-20 right-6 z-50 w-[340px] rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpenIcon className="w-4 h-4 text-blue-200 shrink-0" />
            <span className="text-white text-xs font-bold tracking-wide uppercase">
              Guided Walkthrough
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Step dots */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`rounded-full transition-all ${
                    n === currentStep ? "w-4 h-2 bg-white"
                    : n < currentStep  ? "w-2 h-2 bg-blue-300"
                    : "w-2 h-2 bg-blue-800"
                  }`}
                />
              ))}
            </div>
            <button onClick={endWalkthrough} className="text-blue-300 hover:text-white transition-colors ml-1">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="bg-white px-5 py-5">
          <p className="text-xs font-semibold text-blue-600 mb-1">{tip.eyebrow}</p>
          <h3 className="text-base font-bold text-slate-900 mb-2.5">{tip.title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{tip.body}</p>
        </div>

        {/* CTA */}
        <div className="bg-white px-5 pb-5">
          <button
            onClick={handleCta}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 rounded-xl transition-all"
          >
            {tip.cta}
            {!isLast && <ArrowRightIcon className="w-4 h-4" />}
          </button>
          <button
            onClick={endWalkthrough}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-2.5 transition-colors"
          >
            Skip walkthrough
          </button>
        </div>
      </div>
    </>
  );
}
