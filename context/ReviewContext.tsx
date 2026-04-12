"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from "react";
import type {
  ViolationCase,
  ReviewRecord,
  ReviewChecklist,
  AppMode,
  SessionStats,
  UserDecision,
  DismissReason,
} from "@/types";
import { MOCK_CASES } from "@/data/cases";

// ─── State Shape ──────────────────────────────────────────────────────────────

interface ReviewState {
  cases: ViolationCase[];
  decisions: ReviewRecord[];
  currentCaseId: string | null;
  currentStep: 1 | 2 | 3 | 4;
  mode: AppMode;
  walkthroughActive: boolean;
  walkthroughTipIndex: number; // which tip in the sequence
  checklist: ReviewChecklist;
  caseStartTime: number | null; // Date.now() when case was opened
  sessionStats: SessionStats;
  lastDecision: ReviewRecord | null;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_MODE"; payload: AppMode }
  | { type: "OPEN_CASE"; payload: string }
  | { type: "SET_STEP"; payload: 1 | 2 | 3 | 4 }
  | { type: "NEXT_STEP" }
  | { type: "SET_CHECKLIST"; payload: Partial<ReviewChecklist> }
  | {
      type: "SUBMIT_DECISION";
      payload: {
        action: UserDecision;
        reason?: DismissReason;
        reasonLabel?: string;
        note?: string;
        isEdgeCase: boolean;
      };
    }
  | { type: "START_WALKTHROUGH" }
  | { type: "ADVANCE_WALKTHROUGH" }
  | { type: "END_WALKTHROUGH" }
  | { type: "RESTART_DEMO" }
  | { type: "CLOSE_CASE" }
  // Queue-first fast decisioning — bypasses OPEN_CASE + step flow
  | {
      type: "QUICK_DECISION";
      payload: {
        caseId: string;
        action: UserDecision;
        reason?: DismissReason;
        reasonLabel?: string;
        note?: string;
        isEdgeCase: boolean;
        durationSeconds?: number;
      };
    };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialSessionStats: SessionStats = {
  casesReviewed: 0,
  approved: 0,
  dismissed: 0,
  escalated: 0,
  edgeCasesTagged: 0,
  totalDurationSeconds: 0,
  reviewTimes: [],
};

const initialState: ReviewState = {
  cases: MOCK_CASES.map((c) => ({ ...c })),
  decisions: [],
  currentCaseId: null,
  currentStep: 1,
  mode: "normal",
  walkthroughActive: false,
  walkthroughTipIndex: 0,
  checklist: {
    violationConfirmed: null,
    vehicleConfirmed: null,
    exceptionPresent: null,
  },
  caseStartTime: null,
  sessionStats: initialSessionStats,
  lastDecision: null,
};

// ─── Reviewer mock identity (in a real app, would come from auth) ─────────────
const REVIEWER = { id: "REV-001", name: "Officer A. Williams" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reviewReducer(state: ReviewState, action: Action): ReviewState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "OPEN_CASE":
      return {
        ...state,
        currentCaseId: action.payload,
        currentStep: 1,
        caseStartTime: Date.now(),
        checklist: {
          violationConfirmed: null,
          vehicleConfirmed: null,
          exceptionPresent: null,
        },
        lastDecision: null,
      };

    case "CLOSE_CASE":
      return {
        ...state,
        currentCaseId: null,
        currentStep: 1,
        lastDecision: null,
      };

    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "NEXT_STEP": {
      const next = Math.min(state.currentStep + 1, 4) as 1 | 2 | 3 | 4;
      return { ...state, currentStep: next };
    }

    case "SET_CHECKLIST":
      return {
        ...state,
        checklist: { ...state.checklist, ...action.payload },
      };

    case "SUBMIT_DECISION": {
      if (!state.currentCaseId) return state;

      const duration = state.caseStartTime
        ? Math.round((Date.now() - state.caseStartTime) / 1000)
        : 0;

      const record: ReviewRecord = {
        caseId: state.currentCaseId,
        action: action.payload.action,
        reason: action.payload.reason,
        reasonLabel: action.payload.reasonLabel,
        note: action.payload.note,
        isEdgeCase: action.payload.isEdgeCase,
        reviewerId: REVIEWER.id,
        reviewerName: REVIEWER.name,
        submittedAt: new Date().toISOString(),
        durationSeconds: duration,
        checklist: { ...state.checklist },
      };

      // Update the case status
      const updatedCases = state.cases.map((c) =>
        c.id === state.currentCaseId
          ? {
              ...c,
              status: action.payload.action as ViolationCase["status"],
              reviewHistory: [...c.reviewHistory, record],
            }
          : c
      );

      // Update session stats
      const stats = { ...state.sessionStats };
      stats.casesReviewed += 1;
      stats.totalDurationSeconds += duration;
      stats.reviewTimes = [...stats.reviewTimes, duration];
      if (action.payload.action === "approved") stats.approved += 1;
      else if (action.payload.action === "dismissed") stats.dismissed += 1;
      else if (action.payload.action === "escalated") stats.escalated += 1;
      if (action.payload.isEdgeCase) stats.edgeCasesTagged += 1;

      return {
        ...state,
        cases: updatedCases,
        decisions: [...state.decisions, record],
        lastDecision: record,
        sessionStats: stats,
        currentStep: 4, // Move to step 4 (Decision recorded)
      };
    }

    case "START_WALKTHROUGH":
      return {
        ...state,
        walkthroughActive: true,
        walkthroughTipIndex: 0,
        mode: "guided",
      };

    case "ADVANCE_WALKTHROUGH":
      return {
        ...state,
        walkthroughTipIndex: state.walkthroughTipIndex + 1,
      };

    case "END_WALKTHROUGH":
      return {
        ...state,
        walkthroughActive: false,
        walkthroughTipIndex: 0,
      };

    case "RESTART_DEMO":
      return {
        ...initialState,
        cases: MOCK_CASES.map((c) => ({ ...c })),
      };

    // Quick inline decision — no step flow, no checklist required
    case "QUICK_DECISION": {
      const { caseId, action: act, reason, reasonLabel, note, isEdgeCase, durationSeconds = 0 } = action.payload;

      const record: ReviewRecord = {
        caseId,
        action: act,
        reason,
        reasonLabel,
        note,
        isEdgeCase,
        reviewerId: REVIEWER.id,
        reviewerName: REVIEWER.name,
        submittedAt: new Date().toISOString(),
        durationSeconds,
        checklist: { violationConfirmed: null, vehicleConfirmed: null, exceptionPresent: null },
      };

      const updatedCases = state.cases.map((c) =>
        c.id === caseId
          ? { ...c, status: act as ViolationCase["status"], reviewHistory: [...c.reviewHistory, record] }
          : c
      );

      const stats = { ...state.sessionStats };
      stats.casesReviewed += 1;
      stats.totalDurationSeconds += durationSeconds;
      stats.reviewTimes = [...stats.reviewTimes, durationSeconds];
      if (act === "approved") stats.approved += 1;
      else if (act === "dismissed") stats.dismissed += 1;
      else if (act === "escalated") stats.escalated += 1;
      if (isEdgeCase) stats.edgeCasesTagged += 1;

      return {
        ...state,
        cases: updatedCases,
        decisions: [...state.decisions, record],
        lastDecision: record,
        sessionStats: stats,
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ReviewContextValue {
  state: ReviewState;
  currentCase: ViolationCase | null;
  pendingCases: ViolationCase[];
  openCase: (id: string) => void;
  closeCase: () => void;
  setStep: (step: 1 | 2 | 3 | 4) => void;
  nextStep: () => void;
  setChecklist: (updates: Partial<ReviewChecklist>) => void;
  submitDecision: (payload: {
    action: UserDecision;
    reason?: DismissReason;
    reasonLabel?: string;
    note?: string;
    isEdgeCase: boolean;
  }) => void;
  quickDecision: (payload: {
    caseId: string;
    action: UserDecision;
    reason?: DismissReason;
    reasonLabel?: string;
    note?: string;
    isEdgeCase: boolean;
    durationSeconds?: number;
  }) => void;
  startWalkthrough: () => void;
  advanceWalkthrough: () => void;
  endWalkthrough: () => void;
  restartDemo: () => void;
  setMode: (mode: AppMode) => void;
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reviewReducer, initialState);

  const currentCase = state.currentCaseId
    ? (state.cases.find((c) => c.id === state.currentCaseId) ?? null)
    : null;

  const pendingCases = state.cases.filter((c) => c.status === "pending");

  const openCase = useCallback(
    (id: string) => dispatch({ type: "OPEN_CASE", payload: id }),
    []
  );
  const closeCase = useCallback(() => dispatch({ type: "CLOSE_CASE" }), []);
  const setStep = useCallback(
    (step: 1 | 2 | 3 | 4) => dispatch({ type: "SET_STEP", payload: step }),
    []
  );
  const nextStep = useCallback(() => dispatch({ type: "NEXT_STEP" }), []);
  const setChecklist = useCallback(
    (updates: Partial<ReviewChecklist>) =>
      dispatch({ type: "SET_CHECKLIST", payload: updates }),
    []
  );
  const submitDecision = useCallback(
    (payload: {
      action: UserDecision;
      reason?: DismissReason;
      reasonLabel?: string;
      note?: string;
      isEdgeCase: boolean;
    }) => dispatch({ type: "SUBMIT_DECISION", payload }),
    []
  );
  const quickDecision = useCallback(
    (payload: {
      caseId: string;
      action: UserDecision;
      reason?: DismissReason;
      reasonLabel?: string;
      note?: string;
      isEdgeCase: boolean;
      durationSeconds?: number;
    }) => dispatch({ type: "QUICK_DECISION", payload }),
    []
  );
  const startWalkthrough = useCallback(
    () => dispatch({ type: "START_WALKTHROUGH" }),
    []
  );
  const advanceWalkthrough = useCallback(
    () => dispatch({ type: "ADVANCE_WALKTHROUGH" }),
    []
  );
  const endWalkthrough = useCallback(
    () => dispatch({ type: "END_WALKTHROUGH" }),
    []
  );
  const restartDemo = useCallback(() => dispatch({ type: "RESTART_DEMO" }), []);
  const setMode = useCallback(
    (mode: AppMode) => dispatch({ type: "SET_MODE", payload: mode }),
    []
  );

  return (
    <ReviewContext.Provider
      value={{
        state,
        currentCase,
        pendingCases,
        openCase,
        closeCase,
        setStep,
        nextStep,
        setChecklist,
        submitDecision,
        quickDecision,
        startWalkthrough,
        advanceWalkthrough,
        endWalkthrough,
        restartDemo,
        setMode,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useReview() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReview must be used inside <ReviewProvider>");
  return ctx;
}
