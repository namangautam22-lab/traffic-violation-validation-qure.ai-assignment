"use client";

import { useRouter } from "next/navigation";
import {
  MapPinIcon,
  CameraIcon,
  ClockIcon,
  ChevronRightIcon,
} from "lucide-react";
import type { ViolationCase } from "@/types";
import { ConfidenceBadge, StatusBadge } from "./ConfidenceBadge";
import { useReview } from "@/context/ReviewContext";
import { VIOLATION_TYPE_LABELS } from "@/data/cases";

interface Props {
  violationCase: ViolationCase;
  isHighlighted?: boolean;
}

export function CaseCard({ violationCase: c, isHighlighted }: Props) {
  const router = useRouter();
  const { openCase } = useReview();

  function handleClick() {
    openCase(c.id);
    router.push(`/review/${c.id}`);
  }

  const isPending = c.status === "pending";
  const formattedTime = new Date(c.timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <button
      onClick={handleClick}
      disabled={!isPending}
      className={`w-full text-left border rounded-xl transition-all group ${
        isHighlighted ? "ring-2 ring-blue-400" : ""
      } ${
        isPending
          ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-md cursor-pointer"
          : "bg-slate-50 border-slate-100 cursor-default opacity-75"
      }`}
    >
      <div className="px-5 py-4">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Violation type + ID */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-900 truncate">
                {c.violationLabel}
              </span>
              <span className="text-xs text-slate-400 font-mono shrink-0">
                {c.id}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <ClockIcon className="w-3 h-3" />
                {formattedTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 truncate max-w-[200px]">
                <MapPinIcon className="w-3 h-3 shrink-0" />
                {c.location.split("—")[0].trim()}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <CameraIcon className="w-3 h-3" />
                {c.cameraId}
              </span>
            </div>
          </div>

          {/* Right: badges + chevron */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={c.status} size="sm" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 font-mono">
                {c.plateText}
              </span>
              <ChevronRightIcon
                className={`w-4 h-4 transition-all ${
                  isPending
                    ? "text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5"
                    : "text-slate-200"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Bottom row: confidence + exception flags */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-xs text-slate-400 mr-1.5">AI Confidence</span>
              <ConfidenceBadge confidence={c.aiConfidence} size="sm" />
            </div>
            <div className="text-xs text-slate-400">
              Plate{" "}
              <span
                className={
                  c.plateConfidence >= 80
                    ? "text-emerald-700 font-semibold"
                    : c.plateConfidence >= 60
                    ? "text-amber-700 font-semibold"
                    : "text-red-700 font-semibold"
                }
              >
                {c.plateConfidence}%
              </span>
            </div>
          </div>

          {/* Exception flags */}
          {c.exceptionFlags.length > 0 && (
            <div className="flex items-center gap-1.5">
              {c.exceptionFlags.slice(0, 2).map((flag) => (
                <span
                  key={flag}
                  className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200"
                >
                  {flag.replace(/_/g, " ")}
                </span>
              ))}
              {c.exceptionFlags.length > 2 && (
                <span className="text-xs text-slate-400">
                  +{c.exceptionFlags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
