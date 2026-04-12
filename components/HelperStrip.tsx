"use client";

import { useRouter } from "next/navigation";
import { RotateCcwIcon, PlayCircleIcon } from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { MOCK_CASES } from "@/data/cases";

export function HelperStrip() {
  const router = useRouter();
  const { state, startWalkthrough, restartDemo, openCase } = useReview();

  const firstPending =
    state.cases.find((c) => c.status === "pending") ?? MOCK_CASES[0];

  function handleReplay() {
    startWalkthrough();
    openCase(firstPending.id);
    router.push(`/review/${firstPending.id}`);
  }

  function handleRestart() {
    restartDemo();
    router.push("/");
  }

  const reviewed  = state.sessionStats.casesReviewed;
  const pending   = state.cases.filter((c) => c.status === "pending").length;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-slate-900 border-t border-slate-700">
      <div className="max-w-5xl mx-auto px-6 py-2 flex items-center gap-4">
        {/* Session pill */}
        <div className="text-xs text-slate-400 hidden sm:block">
          <span className="text-slate-200 font-semibold">{reviewed}</span> reviewed
          {" · "}
          <span className="text-slate-200 font-semibold">{pending}</span> pending
        </div>

        <div className="flex-1" />

        {/* Mode indicator */}
        {state.mode === "guided" && (
          <span className="text-xs bg-blue-800 text-blue-200 border border-blue-700 px-2.5 py-1 rounded-full font-medium">
            Guided Mode
          </span>
        )}

        {/* Controls */}
        <button
          onClick={handleReplay}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all"
        >
          <PlayCircleIcon className="w-3.5 h-3.5" />
          Replay Walkthrough
        </button>

        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-semibold transition-all"
        >
          <RotateCcwIcon className="w-3.5 h-3.5" />
          Restart Demo
        </button>
      </div>
    </div>
  );
}
