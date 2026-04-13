"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  SearchIcon,
  SlidersHorizontalIcon,
  ArrowUpDownIcon,
  KeyboardIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { SummaryStrip } from "@/components/SummaryStrip";
import { CaseRow } from "@/components/CaseRow";
import { DetailModal } from "@/components/DetailModal";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import { VIOLATION_TYPE_LABELS, getReviewLane } from "@/data/cases";
import type { DismissReason, ViolationCase } from "@/types";

// ─── Filter / sort types ──────────────────────────────────────────────────────
type FilterStatus = "all" | "pending" | "approved" | "dismissed" | "escalated";
type FilterConf   = "all" | "high" | "medium" | "low";
type SortOption   = "newest" | "oldest" | "conf_high" | "conf_low" | "ambiguous";

interface PickerState { caseId: string; action: "dismissed" | "escalated" }
interface Toast       { id: number; message: string; type: "success" | "warn" }

export default function QueuePage() {
  const { state, quickDecision } = useReview();

  // ── Filter state ──
  const [search,     setSearch]     = useState("");
  const [status,     setStatus]     = useState<FilterStatus>("pending");
  const [conf,       setConf]       = useState<FilterConf>("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort,       setSort]       = useState<SortOption>("newest");

  // ── UI state ──
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [detailCaseId, setDetailCaseId] = useState<string | null>(null);
  const [detailStart,  setDetailStart]  = useState(0);
  const [picker,       setPicker]       = useState<PickerState | null>(null);
  const [showHelp,     setShowHelp]     = useState(false);
  const [toasts,       setToasts]       = useState<Toast[]>([]);
  const toastCounter = useRef(0);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Derived: filtered + sorted cases ─────────────────────────────────────
  const filteredCases = useMemo(() => {
    const q = search.toLowerCase();
    return state.cases
      .filter((c) => {
        if (status !== "all" && c.status !== status) return false;
        if (conf === "high"   && c.aiConfidence < 85)  return false;
        if (conf === "medium" && (c.aiConfidence < 65 || c.aiConfidence >= 85)) return false;
        if (conf === "low"    && c.aiConfidence >= 65)  return false;
        if (typeFilter !== "all" && c.violationType !== typeFilter) return false;
        if (q && !c.id.toLowerCase().includes(q) &&
            !c.violationLabel.toLowerCase().includes(q) &&
            !c.plateText.toLowerCase().includes(q) &&
            !c.location.toLowerCase().includes(q)) return false;
        return true;
      })
      .slice()
      .sort((a, b) => {
        switch (sort) {
          case "newest":   return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          case "oldest":   return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          case "conf_high": return b.aiConfidence - a.aiConfidence;
          case "conf_low":  return a.aiConfidence - b.aiConfidence;
          case "ambiguous": return a.aiConfidence - b.aiConfidence; // low conf first
          default: return 0;
        }
      });
  }, [state.cases, search, status, conf, typeFilter, sort]);

  const pendingFiltered = useMemo(
    () => filteredCases.filter((c) => c.status === "pending"),
    [filteredCases]
  );

  // ── Auto-select first pending on load / after filter changes ─────────────
  useEffect(() => {
    if (!activeCaseId && pendingFiltered.length > 0) {
      setActiveCaseId(pendingFiltered[0].id);
    } else if (activeCaseId) {
      const stillVisible = filteredCases.find((c) => c.id === activeCaseId);
      if (!stillVisible && pendingFiltered.length > 0) {
        setActiveCaseId(pendingFiltered[0].id);
      }
    }
  }, [pendingFiltered, filteredCases, activeCaseId]);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++toastCounter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  // ── Auto-advance after action ─────────────────────────────────────────────
  const advanceActive = useCallback((completedId: string) => {
    const remaining = pendingFiltered.filter((c) => c.id !== completedId);
    if (remaining.length === 0) { setActiveCaseId(null); return; }
    const currentIdx = pendingFiltered.findIndex((c) => c.id === completedId);
    const next = remaining[Math.min(currentIdx, remaining.length - 1)];
    setActiveCaseId(next?.id ?? null);
    // Scroll into view
    setTimeout(() => {
      if (next) document.getElementById(`case-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, [pendingFiltered]);

  // ── Inline action handlers ────────────────────────────────────────────────
  const handleApprove = useCallback((caseId: string) => {
    quickDecision({ caseId, action: "approved", isEdgeCase: false });
    const label = state.cases.find((c) => c.id === caseId)?.id ?? caseId;
    addToast(`✓ Approved · ${label}`);
    advanceActive(caseId);
  }, [quickDecision, state.cases, addToast, advanceActive]);

  const handleReasonSubmit = useCallback((
    caseId: string,
    action: "dismissed" | "escalated",
    payload: { reason: DismissReason; reasonLabel: string; note: string; isEdgeCase: boolean }
  ) => {
    quickDecision({ caseId, action, ...payload });
    const icon = action === "dismissed" ? "✕" : "↑";
    addToast(`${icon} ${action === "dismissed" ? "Dismissed" : "Escalated"} · ${caseId}`);
    setPicker(null);
    advanceActive(caseId);
  }, [quickDecision, addToast, advanceActive]);

  // ── Global keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't intercept when typing
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Don't intercept when detail modal is open (modal has its own handler)
      if (detailCaseId) return;

      switch (e.key) {
        case "?":
          e.preventDefault();
          setShowHelp((v) => !v);
          break;
        case "f": case "F":
          e.preventDefault();
          searchRef.current?.focus();
          break;
        case "Escape":
          setPicker(null);
          setShowHelp(false);
          break;
        case "j": case "n": case "ArrowDown": {
          e.preventDefault();
          const idx = pendingFiltered.findIndex((c) => c.id === activeCaseId);
          if (idx < pendingFiltered.length - 1) {
            const next = pendingFiltered[idx + 1];
            setActiveCaseId(next.id);
            document.getElementById(`case-${next.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          break;
        }
        case "k": case "p": case "ArrowUp": {
          e.preventDefault();
          const idx = pendingFiltered.findIndex((c) => c.id === activeCaseId);
          if (idx > 0) {
            const prev = pendingFiltered[idx - 1];
            setActiveCaseId(prev.id);
            document.getElementById(`case-${prev.id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          break;
        }
        case "a": case "A":
          if (activeCaseId && !picker) {
            const c = state.cases.find((x) => x.id === activeCaseId);
            if (c?.status === "pending") handleApprove(activeCaseId);
          }
          break;
        case "d": case "D":
          if (activeCaseId && !picker) {
            const c = state.cases.find((x) => x.id === activeCaseId);
            if (c?.status === "pending") setPicker({ caseId: activeCaseId, action: "dismissed" });
          }
          break;
        case "e": case "E":
          if (activeCaseId && !picker) {
            const c = state.cases.find((x) => x.id === activeCaseId);
            if (c?.status === "pending") setPicker({ caseId: activeCaseId, action: "escalated" });
          }
          break;
        case "v": case "V":
          if (activeCaseId && !picker) {
            setDetailCaseId(activeCaseId);
            setDetailStart(Date.now());
          }
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCaseId, detailCaseId, picker, pendingFiltered, handleApprove, state.cases]);

  // ── Violation types for filter ─────────────────────────────────────────────
  const allTypes = useMemo(
    () => Array.from(new Set(state.cases.map((c) => c.violationType))),
    [state.cases]
  );

  // ── Counts for filter labels ───────────────────────────────────────────────
  const statusCounts = useMemo(() => ({
    all:       state.cases.length,
    pending:   state.cases.filter((c) => c.status === "pending").length,
    approved:  state.cases.filter((c) => c.status === "approved").length,
    dismissed: state.cases.filter((c) => c.status === "dismissed").length,
    escalated: state.cases.filter((c) => c.status === "escalated").length,
  }), [state.cases]);

  const pendingIds = useMemo(
    () => pendingFiltered.map((c) => c.id),
    [pendingFiltered]
  );

  // ── Active case position label ─────────────────────────────────────────────
  const activePendingIdx = pendingFiltered.findIndex((c) => c.id === activeCaseId);

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">

      {/* ── Summary strip ── */}
      <SummaryStrip />

      {/* ── Filter bar ── */}
      <div id="tour-filter-bar" className="bg-white border-b border-slate-200 px-5 py-2.5 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3 flex-wrap">

          {/* Search */}
          <div className="relative">
            <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, plate, type… (F)"
              className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            {(["pending", "approved", "dismissed", "escalated", "all"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  status === s
                    ? "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== "all" && (
                  <span className={`ml-1 tabular-nums ${status === s ? "opacity-70" : "text-slate-400"}`}>
                    {statusCounts[s]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* Confidence filter */}
          <div className="flex items-center gap-1">
            {(["all", "high", "medium", "low"] as FilterConf[]).map((c) => (
              <button
                key={c}
                onClick={() => setConf(c)}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  conf === c
                    ? c === "high" ? "bg-emerald-600 text-white"
                      : c === "medium" ? "bg-amber-500 text-white"
                      : c === "low" ? "bg-red-600 text-white"
                      : "bg-slate-800 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="all">All types</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>{VIOLATION_TYPE_LABELS[t] ?? t}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="conf_high">Highest confidence</option>
            <option value="conf_low">Lowest confidence</option>
            <option value="ambiguous">Most ambiguous first</option>
          </select>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {activePendingIdx >= 0 && (
              <span className="text-xs text-slate-400">
                Case <span className="font-semibold text-slate-600">{activePendingIdx + 1}</span>
                {" of "}
                <span className="font-semibold text-slate-600">{pendingFiltered.length}</span>
                {" pending"}
              </span>
            )}
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 transition-all"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Shortcuts</span>
              <kbd className="font-mono text-[10px] text-slate-400">?</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
            <div className="w-6" />
            <div className="flex-1">Violation · Location · Camera · Time</div>
            <div className="w-[88px]">Plate</div>
            <div className="w-28">Confidence</div>
            <div className="w-16">Flags</div>
            <div className="w-[244px] text-right pr-1">Actions</div>
          </div>
        </div>
      </div>

      {/* ── Case list ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {filteredCases.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No cases match your filters.
            </div>
          ) : (
            filteredCases.map((c, idx) => (
              <CaseRow
                key={c.id}
                violationCase={c}
                isActive={c.id === activeCaseId}
                caseIndex={idx}
                pickerOpen={picker?.caseId === c.id ? picker.action : null}
                onActivate={() => setActiveCaseId(c.id)}
                onApprove={() => handleApprove(c.id)}
                onDismissClick={() => {
                  setActiveCaseId(c.id);
                  setPicker((prev) =>
                    prev?.caseId === c.id && prev.action === "dismissed" ? null : { caseId: c.id, action: "dismissed" }
                  );
                }}
                onEscalateClick={() => {
                  setActiveCaseId(c.id);
                  setPicker((prev) =>
                    prev?.caseId === c.id && prev.action === "escalated" ? null : { caseId: c.id, action: "escalated" }
                  );
                }}
                onReasonSubmit={(payload) => handleReasonSubmit(c.id, picker!.action, payload)}
                onPickerCancel={() => setPicker(null)}
                onView={() => {
                  setActiveCaseId(c.id);
                  setDetailCaseId(c.id);
                  setDetailStart(Date.now());
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Keyboard hint strip ── */}
      <div id="tour-keyboard-strip" className="bg-slate-900 border-t border-slate-800 py-1.5 shrink-0">
        <div className="max-w-[1400px] mx-auto px-5 flex items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-500 overflow-x-auto">
            {[
              { key: "A", label: "Approve" },
              { key: "D", label: "Dismiss" },
              { key: "E", label: "Escalate" },
              { key: "V", label: "Detail view" },
              { key: "J/K", label: "Next/Prev" },
              { key: "F", label: "Search" },
              { key: "?", label: "All shortcuts" },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1 whitespace-nowrap">
                <kbd className="text-[10px] font-mono font-bold bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-300">{key}</kbd>
                <span>{label}</span>
              </span>
            ))}
          </div>
          <div className="ml-auto text-xs text-slate-600">
            {state.sessionStats.casesReviewed} reviewed this session
          </div>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {detailCaseId && (
        <DetailModal
          caseId={detailCaseId}
          allPendingIds={pendingIds}
          startTime={detailStart}
          onClose={() => setDetailCaseId(null)}
          onDecision={(caseId, action) => {
            addToast(
              action === "approved" ? `✓ Approved · ${caseId}`
              : action === "dismissed" ? `✕ Dismissed · ${caseId}`
              : `↑ Escalated · ${caseId}`
            );
            advanceActive(caseId);
          }}
        />
      )}

      {/* ── Keyboard help ── */}
      {showHelp && <KeyboardHelp onClose={() => setShowHelp(false)} />}

      {/* ── Toast notifications ── */}
      <div className="fixed top-20 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-right-4"
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
