import type { ViolationCase } from "@/types";

// ─── Mock Violation Cases ─────────────────────────────────────────────────────
// 10 realistic demo cases covering a wide range of violation types,
// confidence levels, and edge cases for a comprehensive prototype demo.

export const MOCK_CASES: ViolationCase[] = [
  // ── Case 1: Red Light – High Confidence ──────────────────────────────────
  {
    id: "VIO-2024-0841",
    violationType: "red_light",
    violationLabel: "Red Light Violation",
    timestamp: "2024-07-15T08:23:41Z",
    location: "Main St & 5th Ave — Intersection Camera North",
    cameraId: "CAM-N-0127",
    aiConfidence: 97,
    plateText: "TXD 4821",
    plateConfidence: 99,
    aiRationale:
      "Vehicle entered intersection 1.4 seconds after signal turned red. Clear frontal view captured. Plate fully legible. No pedestrian or emergency conflict detected.",
    evidenceFrames: [
      {
        id: "f1-1",
        label: "Signal turns red",
        offsetSeconds: -1.4,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Traffic signal clearly shows red. Vehicle approaching at speed.",
        highlightZones: ["signal"],
      },
      {
        id: "f1-2",
        label: "Vehicle crosses stop line",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Vehicle fully within intersection. Signal is red. Stop line visible behind vehicle.",
        highlightZones: ["vehicle", "signal", "plate"],
      },
      {
        id: "f1-3",
        label: "Plate capture — rear view",
        offsetSeconds: 1.2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Rear plate TXD 4821 captured at high resolution as vehicle clears intersection.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "approve",
    exceptionFlags: [],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 2: Speeding – High Confidence ────────────────────────────────────
  {
    id: "VIO-2024-0842",
    violationType: "speeding",
    violationLabel: "Speeding — 52 mph in 35 mph Zone",
    timestamp: "2024-07-15T09:11:08Z",
    location: "Riverside Blvd — Speed Enforcement Zone (School)",
    cameraId: "CAM-S-0044",
    aiConfidence: 94,
    plateText: "KLP 7733",
    plateConfidence: 96,
    aiRationale:
      "Radar + vision fusion confirms 52 mph in a 35 mph school zone. Speed recorded via dual-loop sensor. Vehicle identity confirmed via front and rear plate match.",
    evidenceFrames: [
      {
        id: "f2-1",
        label: "Speed radar trigger",
        offsetSeconds: -0.5,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Speed zone sign visible. Radar display shows 52 mph reading.",
        highlightZones: ["sign", "vehicle"],
      },
      {
        id: "f2-2",
        label: "Front plate capture",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Clear frontal capture. Speed overlay: 52 mph. Zone limit overlay: 35 mph.",
        highlightZones: ["vehicle", "plate"],
      },
    ],
    suggestedAction: "approve",
    exceptionFlags: [],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 3: Illegal Turn – Medium Confidence ──────────────────────────────
  {
    id: "VIO-2024-0843",
    violationType: "illegal_turn",
    violationLabel: "Illegal Left Turn — No Turn Signal",
    timestamp: "2024-07-15T10:47:22Z",
    location: "Oak Ave & Commerce Dr — Intersection West",
    cameraId: "CAM-W-0088",
    aiConfidence: 71,
    plateText: "MRZ 1190",
    plateConfidence: 88,
    aiRationale:
      "Vehicle made left turn at an intersection marked with a No Left Turn sign. Turn signal usage unclear due to angle. Sign partially obstructed by tree foliage.",
    evidenceFrames: [
      {
        id: "f3-1",
        label: "Vehicle approach",
        offsetSeconds: -2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Vehicle in right lane approaching intersection. No-turn sign visible but partially obstructed.",
        highlightZones: ["sign", "vehicle"],
      },
      {
        id: "f3-2",
        label: "Turn maneuver",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Vehicle executing left turn. No Left Turn sign visible. Camera angle oblique — some ambiguity.",
        highlightZones: ["vehicle", "lane", "sign"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["sign_obstruction", "ambiguous_angle"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 4: Parking – Unclear Plate ───────────────────────────────────────
  {
    id: "VIO-2024-0844",
    violationType: "parking",
    violationLabel: "No Parking Zone Violation",
    timestamp: "2024-07-14T14:05:55Z",
    location: "Pine St — Bus Stop Zone 14B",
    cameraId: "CAM-P-0312",
    aiConfidence: 83,
    plateText: "F?T 20?8",
    plateConfidence: 44,
    aiRationale:
      "Vehicle parked in designated Bus Stop zone for 18+ minutes. Plate partially obscured — OCR returned low-confidence characters at positions 2 and 7.",
    evidenceFrames: [
      {
        id: "f4-1",
        label: "Vehicle parked — wide view",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Stationary vehicle in bus stop zone. No Parking sign clearly visible. Plate partially obscured by dirt/damage.",
        highlightZones: ["vehicle", "sign"],
      },
      {
        id: "f4-2",
        label: "Plate close-up",
        offsetSeconds: 2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Zoomed plate capture. Characters 2 and 7 unclear — possible FRT 2008 or FBT 2078.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["low_plate_confidence", "ocr_ambiguity"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 5: Bus Lane – Signage Ambiguity ──────────────────────────────────
  {
    id: "VIO-2024-0845",
    violationType: "bus_lane",
    violationLabel: "Bus Lane Infringement",
    timestamp: "2024-07-15T07:58:14Z",
    location: "Downtown Corridor — Grant Ave Bus Lane (Blk 400–500)",
    cameraId: "CAM-B-0019",
    aiConfidence: 68,
    plateText: "VNQ 5502",
    plateConfidence: 91,
    aiRationale:
      "Vehicle detected in Bus Only lane during enforcement hours (7–9 AM). However, lane marking paint is significantly faded at this block. Signage review recommended.",
    evidenceFrames: [
      {
        id: "f5-1",
        label: "Lane entry",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Vehicle in bus lane. Lane marking faded. Bus Only sign present but at distance.",
        highlightZones: ["vehicle", "lane", "sign"],
      },
      {
        id: "f5-2",
        label: "Lane marking detail",
        offsetSeconds: 1.5,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Ground-level lane paint is 70% worn. Ambiguity exists about visible boundary.",
        highlightZones: ["lane"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["faded_lane_marking", "sign_distance"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 6: HOV False Positive ────────────────────────────────────────────
  {
    id: "VIO-2024-0846",
    violationType: "hov",
    violationLabel: "HOV Lane Violation — Single Occupant",
    timestamp: "2024-07-15T07:34:50Z",
    location: "I-280 Northbound — HOV Lane Camera MP 14.2",
    cameraId: "CAM-H-0007",
    aiConfidence: 61,
    plateText: "BXR 9940",
    plateConfidence: 93,
    aiRationale:
      "Occupancy detection model flagged single occupant in HOV-2 zone. However, tinted rear windows and sun glare limited visibility into vehicle interior. Confidence is below threshold.",
    evidenceFrames: [
      {
        id: "f6-1",
        label: "HOV lane — vehicle capture",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Vehicle in HOV lane. Tinted windows. Sun glare on windshield. Occupant count uncertain.",
        highlightZones: ["vehicle", "lane"],
      },
      {
        id: "f6-2",
        label: "Interior visibility attempt",
        offsetSeconds: 0.8,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Attempted interior view. Rear seat ambiguous due to tint and glare.",
        highlightZones: ["vehicle"],
      },
    ],
    suggestedAction: "dismiss",
    exceptionFlags: ["tinted_windows", "sun_glare", "occupancy_uncertain"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 7: Emergency Vehicle Exception ───────────────────────────────────
  {
    id: "VIO-2024-0847",
    violationType: "emergency_vehicle",
    violationLabel: "Red Light — Possible Emergency Vehicle",
    timestamp: "2024-07-13T22:15:33Z",
    location: "Central Ave & 12th St — Night Camera",
    cameraId: "CAM-N-0088",
    aiConfidence: 88,
    plateText: "EMG 7741",
    plateConfidence: 85,
    aiRationale:
      "Vehicle ran red light at 22:15. High confidence on violation. However, emergency light strobes visible in frame. Vehicle may be unmarked emergency response unit responding to incident.",
    evidenceFrames: [
      {
        id: "f7-1",
        label: "Night approach — lights visible",
        offsetSeconds: -1,
        isPrimary: false,
        sceneType: "night",
        sceneDescription:
          "Vehicle approaching at speed. Blue/red strobe lights active on dashboard. Red signal ahead.",
        highlightZones: ["vehicle", "signal"],
      },
      {
        id: "f7-2",
        label: "Intersection crossing",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "night",
        sceneDescription:
          "Vehicle through red signal. Emergency strobes clearly visible. No other traffic in intersection.",
        highlightZones: ["vehicle", "signal", "plate"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["emergency_strobe_detected", "night_incident"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 8: Rainy / Low Visibility ────────────────────────────────────────
  {
    id: "VIO-2024-0848",
    violationType: "low_visibility",
    violationLabel: "Speeding — Low Visibility Conditions",
    timestamp: "2024-07-12T17:42:19Z",
    location: "Westfield Hwy — Rain Zone Camera (MP 8.7)",
    cameraId: "CAM-R-0055",
    aiConfidence: 58,
    plateText: "LPV 3317",
    plateConfidence: 67,
    aiRationale:
      "Speed reading: 49 mph in 35 mph zone. Heavy rain conditions degraded image quality. Plate reading partially obscured by water streaks. Evidence quality insufficient for citation.",
    evidenceFrames: [
      {
        id: "f8-1",
        label: "Rainy conditions — vehicle approach",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "rain",
        sceneDescription:
          "Heavy rain. Vehicle barely visible. Speed data from radar: 49 mph. Plate smeared with rain distortion.",
        highlightZones: ["vehicle"],
      },
      {
        id: "f8-2",
        label: "Plate — rain-degraded",
        offsetSeconds: 0.6,
        isPrimary: false,
        sceneType: "rain",
        sceneDescription:
          "Plate partially legible but rain distortion makes confident OCR impossible.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "dismiss",
    exceptionFlags: ["poor_visibility", "weather_degradation", "low_plate_confidence"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 9: OCR Mismatch ──────────────────────────────────────────────────
  {
    id: "VIO-2024-0849",
    violationType: "ocr_mismatch",
    violationLabel: "Red Light — OCR Plate Mismatch",
    timestamp: "2024-07-11T16:20:07Z",
    location: "Harbor Blvd & Station Rd — South Camera",
    cameraId: "CAM-S-0201",
    aiConfidence: 89,
    plateText: "8XR 441 (vs. DMV: BXR 441)",
    plateConfidence: 52,
    aiRationale:
      "Violation clearly recorded — vehicle ran red light. However, OCR read '8XR 441'. DMV lookup returns 'BXR 441' for similar plate. Character '8' vs 'B' confusion likely due to font and angle. Plate re-verification required before citation issuance.",
    evidenceFrames: [
      {
        id: "f9-1",
        label: "Violation frame",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Clear red light violation. Vehicle in intersection on red. Plate visible but OCR mismatch flagged.",
        highlightZones: ["vehicle", "signal", "plate"],
      },
      {
        id: "f9-2",
        label: "Plate — OCR zoom",
        offsetSeconds: 0.4,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Zoomed plate. Ambiguous '8' vs 'B' character at position 1. Manual read needed.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["ocr_mismatch", "character_ambiguity"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 10: Clear False Detection ───────────────────────────────────────
  {
    id: "VIO-2024-0850",
    violationType: "false_detection",
    violationLabel: "Illegal U-Turn — Likely False Positive",
    timestamp: "2024-07-10T11:05:44Z",
    location: "Maple Ave & 3rd St — Wide Intersection",
    cameraId: "CAM-W-0144",
    aiConfidence: 39,
    plateText: "GHN 8801",
    plateConfidence: 90,
    aiRationale:
      "Model flagged a U-turn maneuver but vehicle trajectory analysis suggests a wide legal 3-point turn in a permissible zone. No No-U-Turn sign present at this intersection. Model may have misclassified due to camera angle causing turn radius distortion.",
    evidenceFrames: [
      {
        id: "f10-1",
        label: "Turn maneuver — wide view",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription:
          "Vehicle executing wide turn. No No-U-Turn sign visible. Intersection has legal U-turn provision.",
        highlightZones: ["vehicle", "lane"],
      },
      {
        id: "f10-2",
        label: "Signage check",
        offsetSeconds: -3,
        isPrimary: false,
        sceneType: "day",
        sceneDescription:
          "Wide-angle view. No restriction signs at this intersection. Model false positive likely.",
        highlightZones: ["sign"],
      },
    ],
    suggestedAction: "dismiss",
    exceptionFlags: ["no_sign_present", "likely_false_positive", "legal_maneuver"],
    status: "pending",
    reviewHistory: [],
  },
];

// ─── Review lane classification ───────────────────────────────────────────────
// Fast = high-conf clean cases → near 1-click approve
// Exception = ambiguous, flagged, or low-conf → escalate / inspect
// Review = everything in between → manual validation needed

export type ReviewLane = "fast" | "review" | "exception";

export function getReviewLane(c: ViolationCase): ReviewLane {
  const hasFlags   = c.exceptionFlags.length > 0;
  const lowAI      = c.aiConfidence < 65;
  const lowPlate   = c.plateConfidence < 60;
  if (lowAI || hasFlags || lowPlate) return "exception";
  if (c.aiConfidence >= 85 && c.plateConfidence >= 85 && c.suggestedAction === "approve") return "fast";
  return "review";
}

// ─── Helper: Get confidence bucket ───────────────────────────────────────────
export function getConfidenceBucket(
  confidence: number
): "high" | "medium" | "low" {
  if (confidence >= 85) return "high";
  if (confidence >= 65) return "medium";
  return "low";
}

// ─── Dismiss reason labels ────────────────────────────────────────────────────
export const DISMISS_REASONS: Array<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: "emergency_vehicle",
    label: "Emergency Vehicle",
    description: "Authorized emergency response in progress",
  },
  {
    value: "unreadable_plate",
    label: "Unreadable Plate",
    description: "Plate could not be confirmed with sufficient confidence",
  },
  {
    value: "no_actual_violation",
    label: "No Actual Violation",
    description: "Evidence does not support the flagged infraction",
  },
  {
    value: "unclear_signage",
    label: "Unclear / Missing Signage",
    description: "Signage absent, obstructed, or ambiguous",
  },
  {
    value: "poor_visibility",
    label: "Poor Visibility / Weather",
    description: "Weather or lighting degraded evidence quality",
  },
  {
    value: "wrong_vehicle_match",
    label: "Wrong Vehicle Match",
    description: "Detected vehicle does not match DMV record",
  },
  {
    value: "ambiguous_lane_marking",
    label: "Ambiguous Lane Marking",
    description: "Lane boundaries unclear or heavily faded",
  },
  {
    value: "ocr_mismatch",
    label: "OCR / Plate Mismatch",
    description: "OCR output conflicts with available DMV records",
  },
];

// ─── Violation type labels ────────────────────────────────────────────────────
export const VIOLATION_TYPE_LABELS: Record<string, string> = {
  red_light: "Red Light",
  speeding: "Speeding",
  illegal_turn: "Illegal Turn",
  parking: "Parking",
  bus_lane: "Bus Lane",
  hov: "HOV Violation",
  emergency_vehicle: "Emergency Vehicle",
  low_visibility: "Low Visibility",
  ocr_mismatch: "OCR Mismatch",
  false_detection: "False Detection",
};
