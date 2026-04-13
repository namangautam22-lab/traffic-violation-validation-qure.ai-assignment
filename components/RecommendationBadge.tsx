"use client";

import type { ReviewLane } from "@/data/cases";

const LANE_CONFIG: Record<ReviewLane, { label: string; classes: string; dot: string }> = {
  fast:      { label: "Quick Approve", classes: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  review:    { label: "Needs Review",  classes: "bg-amber-100 text-amber-800 border-amber-200",       dot: "bg-amber-500"   },
  exception: { label: "Inspect",       classes: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500"     },
};

interface Props {
  lane: ReviewLane;
  size?: "sm" | "xs";
}

export function RecommendationBadge({ lane, size = "sm" }: Props) {
  const { label, classes, dot } = LANE_CONFIG[lane];
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span className={`inline-flex items-center gap-1 ${text} font-semibold px-2 py-0.5 rounded-full border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      {label}
    </span>
  );
}
