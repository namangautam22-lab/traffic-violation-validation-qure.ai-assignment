"use client";

import { useState } from "react";
import { XIcon, AlertTriangleIcon, FlaskConicalIcon } from "lucide-react";
import type { DismissReason, UserDecision } from "@/types";
import { DISMISS_REASONS } from "@/data/cases";

interface Props {
  action: "dismissed" | "escalated";
  onClose: () => void;
  onSubmit: (payload: {
    action: UserDecision;
    reason: DismissReason;
    reasonLabel: string;
    note: string;
    isEdgeCase: boolean;
  }) => void;
}

export function DismissModal({ action, onClose, onSubmit }: Props) {
  const [selectedReason, setSelectedReason] = useState<DismissReason | null>(
    null
  );
  const [note, setNote] = useState("");
  const [isEdgeCase, setIsEdgeCase] = useState(false);

  const isEscalate = action === "escalated";
  const canSubmit = selectedReason !== null;

  function handleSubmit() {
    if (!selectedReason) return;
    const label =
      DISMISS_REASONS.find((r) => r.value === selectedReason)?.label ?? "";
    onSubmit({ action, reason: selectedReason, reasonLabel: label, note, isEdgeCase });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          {/* Header */}
          <div
            className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between rounded-t-2xl ${
              isEscalate ? "bg-purple-50" : "bg-red-50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangleIcon
                className={`w-5 h-5 ${
                  isEscalate ? "text-purple-600" : "text-red-600"
                }`}
              />
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {isEscalate ? "Escalate Case" : "Dismiss Case"}
                </h2>
                <p className="text-xs text-slate-500">
                  Select a reason to record with this decision
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Reason chips */}
          <div className="px-6 pt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Select Reason *
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DISMISS_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() =>
                    setSelectedReason(
                      selectedReason === reason.value
                        ? null
                        : (reason.value as DismissReason)
                    )
                  }
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    selectedReason === reason.value
                      ? isEscalate
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "bg-red-600 border-red-600 text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                  }`}
                  title={reason.description}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {selectedReason && (
              <p className="text-xs text-slate-500 mt-2 italic">
                {DISMISS_REASONS.find((r) => r.value === selectedReason)
                  ?.description}
              </p>
            )}
          </div>

          {/* Optional note */}
          <div className="px-6 pt-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Additional Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any additional context for this decision..."
              className="mt-1.5 w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={2}
              maxLength={280}
            />
          </div>

          {/* Edge case toggle */}
          <div className="px-6 pt-3">
            <button
              onClick={() => setIsEdgeCase(!isEdgeCase)}
              className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl border transition-all text-sm ${
                isEdgeCase
                  ? "bg-amber-50 border-amber-300 text-amber-900"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-amber-300"
              }`}
            >
              <FlaskConicalIcon
                className={`w-4 h-4 ${
                  isEdgeCase ? "text-amber-600" : "text-slate-400"
                }`}
              />
              <div className="flex-1 text-left">
                <span className="font-semibold">Tag as Edge Case for Model Retraining</span>
                <p className="text-xs mt-0.5 opacity-70">
                  Flags this case so AI engineers can review and improve detection
                </p>
              </div>
              <div
                className={`w-9 h-5 rounded-full transition-all flex items-center ${
                  isEdgeCase ? "bg-amber-500" : "bg-slate-200"
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition-all mx-0.5 ${
                    isEdgeCase ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 flex gap-2 border-t border-slate-100 mt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all ${
                canSubmit
                  ? isEscalate
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-red-600 hover:bg-red-700"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isEscalate ? "Submit Escalation" : "Submit Dismissal"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
