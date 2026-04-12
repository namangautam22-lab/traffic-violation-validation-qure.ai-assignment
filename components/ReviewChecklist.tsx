"use client";

import { CheckCircleIcon, XCircleIcon, MinusCircleIcon, InfoIcon, AlertTriangleIcon } from "lucide-react";
import type { ReviewChecklist as ChecklistType } from "@/types";

interface Props {
  checklist: ChecklistType;
  onChange: (updates: Partial<ChecklistType>) => void;
  isGuided?: boolean;
}

type TriBool = boolean | null;

function TriToggle({
  value,
  onChange,
  label,
  description,
  warningIfYes,
}: {
  value: TriBool;
  onChange: (v: TriBool) => void;
  label: string;
  description: string;
  warningIfYes?: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          {warningIfYes && value === true && (
            <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
              <InfoIcon className="w-3 h-3" />
              {warningIfYes}
            </p>
          )}
        </div>

        {/* Yes / No / Skip toggle */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onChange(value === true ? null : true)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              value === true
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Yes
          </button>
          <button
            onClick={() => onChange(value === false ? null : false)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              value === false
                ? "bg-red-600 border-red-600 text-white"
                : "bg-white border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-700"
            }`}
          >
            <XCircleIcon className="w-3.5 h-3.5" />
            No
          </button>
          {value !== null && (
            <button
              onClick={() => onChange(null)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 text-xs transition-all"
              title="Clear answer"
            >
              <MinusCircleIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ReviewChecklist({ checklist, onChange, isGuided }: Props) {
  return (
    <div>
      <div className="flex flex-col gap-2.5">
        <TriToggle
          value={checklist.violationConfirmed}
          onChange={(v) => onChange({ violationConfirmed: v })}
          label="Violation Confirmed?"
          description="Does the evidence clearly show the flagged traffic violation occurred?"
        />

        <TriToggle
          value={checklist.vehicleConfirmed}
          onChange={(v) => onChange({ vehicleConfirmed: v })}
          label="Vehicle / Plate Confirmed?"
          description="Is the vehicle identity and plate text readable and verifiable?"
        />

        <TriToggle
          value={checklist.exceptionPresent}
          onChange={(v) => onChange({ exceptionPresent: v })}
          label="Contextual Exception Present?"
          description="Is there evidence of an emergency vehicle, unclear signage, poor visibility, or other exception?"
          warningIfYes="An exception was found. Consider Dismiss or Escalate."
        />
      </div>

      {/* Guidance summary */}
      {checklist.violationConfirmed !== null && (
        <div
          className={`mt-3 px-3 py-2 rounded-lg text-xs font-medium border ${
            checklist.violationConfirmed &&
            checklist.vehicleConfirmed &&
            !checklist.exceptionPresent
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : checklist.exceptionPresent
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-slate-50 border-slate-200 text-slate-700"
          }`}
        >
          {checklist.violationConfirmed &&
          checklist.vehicleConfirmed &&
          !checklist.exceptionPresent ? (
            <>
              ✓ Checklist complete — evidence supports Approve Citation.
            </>
          ) : checklist.exceptionPresent ? (
            <>
              ⚠ Exception detected — consider Dismiss or Escalate with reason.
            </>
          ) : checklist.violationConfirmed === false ||
            checklist.vehicleConfirmed === false ? (
            <>
              ✕ Confirmation failed — consider Dismiss with appropriate reason.
            </>
          ) : (
            <>Answer all three questions to continue to Step 4.</>
          )}
        </div>
      )}
    </div>
  );
}
