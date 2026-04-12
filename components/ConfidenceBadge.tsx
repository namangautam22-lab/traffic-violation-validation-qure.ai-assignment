"use client";

import { getConfidenceBucket } from "@/data/cases";

interface Props {
  confidence: number;
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function ConfidenceBadge({
  confidence,
  size = "md",
  showLabel = true,
}: Props) {
  const bucket = getConfidenceBucket(confidence);

  const colorMap = {
    high: "bg-emerald-100 text-emerald-800 border-emerald-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-red-100 text-red-800 border-red-200",
  };

  const dotMap = {
    high: "bg-emerald-500",
    medium: "bg-amber-500",
    low: "bg-red-500",
  };

  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  const labelMap = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorMap[bucket]} ${sizeMap[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[bucket]}`} />
      {confidence}%{showLabel && ` · ${labelMap[bucket]}`}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: "pending" | "approved" | "dismissed" | "escalated";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colorMap = {
    pending: "bg-slate-100 text-slate-600 border-slate-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dismissed: "bg-red-100 text-red-700 border-red-200",
    escalated: "bg-purple-100 text-purple-800 border-purple-200",
  };

  const labelMap = {
    pending: "Pending Review",
    approved: "Approved",
    dismissed: "Dismissed",
    escalated: "Escalated",
  };

  const sizeMap = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colorMap[status]} ${sizeMap[size]}`}
    >
      {labelMap[status]}
    </span>
  );
}
