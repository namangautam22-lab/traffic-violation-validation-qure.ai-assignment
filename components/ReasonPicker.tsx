"use client";

import { useState } from "react";
import { XIcon, FlaskConicalIcon, ArrowUpCircleIcon, XCircleIcon } from "lucide-react";
import type { DismissReason } from "@/types";
import { DISMISS_REASONS } from "@/data/cases";

interface Props {
  action: "dismissed" | "escalated";
  onSubmit: (payload: {
    reason: DismissReason;
    reasonLabel: string;
    note: string;
    isEdgeCase: boolean;
  }) => void;
  onCancel: () => void;
}

export function ReasonPicker({ action, onSubmit, onCancel }: Props) {
  const [reason, setReason]         = useState<DismissReason | null>(null);
  const [note, setNote]             = useState("");
  const [isEdgeCase, setIsEdgeCase] = useState(false);

  const isEsc = action === "escalated";

  function handleSubmit() {
    if (!reason) return;
    const label = DISMISS_REASONS.find((r) => r.value === reason)?.label ?? "";
    onSubmit({ reason, reasonLabel: label, note, isEdgeCase });
  }

  return (
    <div className={`rounded-xl border shadow-md bg-white overflow-hidden ${isEsc ? "border-purple-200" : "border-red-200"}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 border-b ${isEsc ? "bg-purple-50 border-purple-100" : "bg-red-50 border-red-100"}`}>
        <div className="flex items-center gap-2">
          {isEsc
            ? <ArrowUpCircleIcon className="w-3.5 h-3.5 text-purple-600" />
            : <XCircleIcon className="w-3.5 h-3.5 text-red-600" />
          }
          <span className={`text-xs font-bold uppercase tracking-wide ${isEsc ? "text-purple-700" : "text-red-700"}`}>
            {isEsc ? "Escalate — select reason" : "Dismiss — select reason"}
          </span>
          <span className={`text-[10px] ${isEsc ? "text-purple-500" : "text-red-500"}`}>
            (required)
          </span>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded">
          <XIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="px-4 py-3">
        {/* Reason grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {DISMISS_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(reason === r.value ? null : r.value as DismissReason)}
              title={r.description}
              className={`text-xs px-2.5 py-2 rounded-lg border text-left transition-all font-medium leading-tight ${
                reason === r.value
                  ? isEsc
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-red-600 border-red-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Selected reason description */}
        {reason && (
          <div className={`text-xs px-2.5 py-1.5 rounded-lg mb-2.5 ${isEsc ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
            {DISMISS_REASONS.find((r) => r.value === reason)?.description}
          </div>
        )}

        {/* Optional note */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for supervisor / audit log…"
          rows={2}
          className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2.5 resize-none"
          maxLength={300}
        />

        {/* Edge case + submit row */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsEdgeCase(!isEdgeCase)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              isEdgeCase ? "bg-amber-100 border-amber-300 text-amber-800" : "border-slate-200 text-slate-500 hover:border-amber-300"
            }`}
          >
            <FlaskConicalIcon className="w-3 h-3" />
            Tag edge case
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!reason}
              className={`text-xs px-4 py-1.5 rounded-lg font-bold text-white transition-all ${
                reason
                  ? isEsc
                    ? "bg-purple-600 hover:bg-purple-700 shadow-sm"
                    : "bg-red-600 hover:bg-red-700 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isEsc ? "Submit Escalation" : "Confirm Dismiss"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
