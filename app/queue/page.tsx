"use client";

import { useState } from "react";
import {
  FilterIcon,
  SearchIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUpCircleIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { CaseCard } from "@/components/CaseCard";
import { VIOLATION_TYPE_LABELS } from "@/data/cases";
import type { ViolationCase } from "@/types";

type FilterStatus = "all" | "pending" | "approved" | "dismissed" | "escalated";
type FilterConfidence = "all" | "high" | "medium" | "low";

export default function QueuePage() {
  const { state } = useReview();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("pending");
  const [confidenceFilter, setConfidenceFilter] =
    useState<FilterConfidence>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Derive unique violation types
  const allTypes = Array.from(
    new Set(state.cases.map((c) => c.violationType))
  );

  // Apply filters
  const filtered = state.cases.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (
      confidenceFilter === "high" &&
      c.aiConfidence < 85
    )
      return false;
    if (
      confidenceFilter === "medium" &&
      (c.aiConfidence < 65 || c.aiConfidence >= 85)
    )
      return false;
    if (confidenceFilter === "low" && c.aiConfidence >= 65) return false;
    if (typeFilter !== "all" && c.violationType !== typeFilter) return false;
    if (
      search &&
      !c.id.toLowerCase().includes(search.toLowerCase()) &&
      !c.violationLabel.toLowerCase().includes(search.toLowerCase()) &&
      !c.plateText.toLowerCase().includes(search.toLowerCase()) &&
      !c.location.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // Stats
  const stats = {
    total: state.cases.length,
    pending: state.cases.filter((c) => c.status === "pending").length,
    approved: state.cases.filter((c) => c.status === "approved").length,
    dismissed: state.cases.filter((c) => c.status === "dismissed").length,
    escalated: state.cases.filter((c) => c.status === "escalated").length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-flagged violations awaiting human review
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3">
          {[
            {
              label: "Pending",
              count: stats.pending,
              color: "text-slate-700 bg-slate-100",
              icon: ClockIcon,
            },
            {
              label: "Approved",
              count: stats.approved,
              color: "text-emerald-700 bg-emerald-100",
              icon: CheckCircleIcon,
            },
            {
              label: "Dismissed",
              count: stats.dismissed,
              color: "text-red-700 bg-red-100",
              icon: XCircleIcon,
            },
            {
              label: "Escalated",
              count: stats.escalated,
              color: "text-purple-700 bg-purple-100",
              icon: ArrowUpCircleIcon,
            },
          ].map(({ label, count, color, icon: Icon }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl ${color}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {count} {label}
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, plate, location..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <FilterIcon className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(
              ["all", "pending", "approved", "dismissed", "escalated"] as FilterStatus[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  statusFilter === s
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Confidence filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400 mr-1">Confidence:</span>
            {(["all", "high", "medium", "low"] as FilterConfidence[]).map(
              (c) => (
                <button
                  key={c}
                  onClick={() => setConfidenceFilter(c)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                    confidenceFilter === c
                      ? c === "high"
                        ? "bg-emerald-600 text-white"
                        : c === "medium"
                        ? "bg-amber-500 text-white"
                        : c === "low"
                        ? "bg-red-600 text-white"
                        : "bg-slate-800 text-white"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="all">All Types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {VIOLATION_TYPE_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">
          Showing {filtered.length} of {state.cases.length} cases
        </p>
        {(statusFilter !== "pending" ||
          confidenceFilter !== "all" ||
          typeFilter !== "all" ||
          search) && (
          <button
            onClick={() => {
              setStatusFilter("pending");
              setConfidenceFilter("all");
              setTypeFilter("all");
              setSearch("");
            }}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Case list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
          <p className="text-slate-500 text-sm">No cases match your filters.</p>
          <button
            onClick={() => {
              setStatusFilter("all");
              setConfidenceFilter("all");
              setTypeFilter("all");
              setSearch("");
            }}
            className="text-blue-600 text-sm font-medium hover:underline mt-2"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((c) => (
            <CaseCard key={c.id} violationCase={c} />
          ))}
        </div>
      )}
    </div>
  );
}
