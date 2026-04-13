// ─── Core Domain Types ────────────────────────────────────────────────────────

export type ViolationType =
  | "red_light"
  | "speeding"
  | "wrong_side"
  | "no_helmet"
  | "illegal_turn"
  | "parking"
  | "bus_lane"
  | "blocked_intersection"
  | "emergency_vehicle"
  | "low_visibility"
  | "ocr_mismatch"
  | "false_detection";

export type CaseStatus = "pending" | "approved" | "dismissed" | "escalated";

export type ConfidenceBucket = "high" | "medium" | "low";

export type ReviewStep = 1 | 2 | 3 | 4;

export type SuggestedAction = "approve" | "review" | "dismiss";

export type UserDecision = "approved" | "dismissed" | "escalated";

export type DismissReason =
  | "emergency_vehicle"
  | "unreadable_plate"
  | "ocr_mismatch"
  | "no_actual_violation"
  | "unclear_signage"
  | "poor_visibility"
  | "contextual_ambiguity"
  | "policy_ambiguity"
  | "wrong_vehicle_match"
  | "ambiguous_lane_marking";

// ─── Evidence Frame ───────────────────────────────────────────────────────────

export interface EvidenceFrame {
  id: string;
  label: string;
  offsetSeconds: number; // seconds from violation moment
  isPrimary: boolean;
  sceneType: "day" | "night" | "rain" | "blur";
  // Describes what is visible in this mock frame
  sceneDescription: string;
  highlightZones: Array<"vehicle" | "plate" | "signal" | "lane" | "sign">;
}

// ─── Violation Case ───────────────────────────────────────────────────────────

export interface ViolationCase {
  id: string;
  violationType: ViolationType;
  violationLabel: string;
  timestamp: string; // ISO string
  location: string;
  cameraId: string;
  aiConfidence: number; // 0–100
  plateText: string;
  plateConfidence: number; // 0–100
  aiRationale: string;
  evidenceFrames: EvidenceFrame[];
  suggestedAction: SuggestedAction;
  exceptionFlags: string[];
  status: CaseStatus;
  reviewHistory: ReviewRecord[];
}

// ─── Review Record (submitted decision) ──────────────────────────────────────

export interface ReviewRecord {
  caseId: string;
  action: UserDecision;
  reason?: DismissReason;
  reasonLabel?: string;
  note?: string;
  isEdgeCase: boolean;
  reviewerId: string;
  reviewerName: string;
  submittedAt: string; // ISO string
  durationSeconds: number;
  checklist: {
    violationConfirmed: boolean | null;
    vehicleConfirmed: boolean | null;
    exceptionPresent: boolean | null;
  };
}

// ─── Review Checklist State ───────────────────────────────────────────────────

export interface ReviewChecklist {
  violationConfirmed: boolean | null;
  vehicleConfirmed: boolean | null;
  exceptionPresent: boolean | null;
}

// ─── App-level UI Mode ────────────────────────────────────────────────────────

export type AppMode = "guided" | "normal";

// ─── Walkthrough Tip ──────────────────────────────────────────────────────────

export interface WalkthroughTip {
  id: number;
  reviewStep: ReviewStep;
  targetRef: string; // used to scroll to / highlight
  title: string;
  body: string;
  actionLabel: string;
}

// ─── Session Stats ────────────────────────────────────────────────────────────

export interface SessionStats {
  casesReviewed: number;
  approved: number;
  dismissed: number;
  escalated: number;
  edgeCasesTagged: number;
  totalDurationSeconds: number;
  reviewTimes: number[];
}
