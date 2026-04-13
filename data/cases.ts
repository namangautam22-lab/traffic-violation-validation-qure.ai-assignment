import type { ViolationCase } from "@/types";

// ─── Mock Violation Cases — Delhi / NCR Traffic Enforcement ───────────────────
// 10 realistic cases covering Indian traffic violations, varying confidence
// levels, Delhi/NCR locations, Indian plates, and local scenarios.

export const MOCK_CASES: ViolationCase[] = [
  // ── Case 1: Red Light Jump — ITO Crossing, High Confidence ──────────────
  {
    id: "VIO-DL-2024-0841",
    violationType: "red_light",
    violationLabel: "Red Light Violation",
    timestamp: "2024-07-15T08:23:41Z",
    location: "ITO Crossing — Vikas Marg · Cam North",
    cameraId: "DL-ITO-N-07",
    aiConfidence: 97,
    plateText: "DL 3C AB 4581",
    plateConfidence: 99,
    aiRationale:
      "Vehicle entered intersection 1.6 seconds after signal turned red at ITO Crossing. Frontal plate clearly captured. No emergency lights detected. Stop line markings fully visible.",
    evidenceFrames: [
      {
        id: "f1-1",
        label: "Signal turns red",
        offsetSeconds: -1.6,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Traffic signal clearly shows red. Vehicle approaching at speed on Vikas Marg.",
        highlightZones: ["signal"],
      },
      {
        id: "f1-2",
        label: "Vehicle crosses stop line",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Vehicle fully within intersection. Signal is red. Stop line visible behind vehicle.",
        highlightZones: ["vehicle", "signal", "plate"],
      },
      {
        id: "f1-3",
        label: "Plate capture — rear",
        offsetSeconds: 1.2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Rear plate DL 3C AB 4581 captured clearly as vehicle exits ITO Crossing.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "approve",
    exceptionFlags: [],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 2: Wrong-Side Driving — Ring Road, High Confidence ──────────────
  {
    id: "VIO-DL-2024-0842",
    violationType: "wrong_side",
    violationLabel: "Wrong-Side Driving",
    timestamp: "2024-07-15T09:11:08Z",
    location: "Ring Road Southbound — Ashram Chowk Entry",
    cameraId: "DL-RING-E-14",
    aiConfidence: 94,
    plateText: "HR 26 DK 1024",
    plateConfidence: 96,
    aiRationale:
      "Vehicle entered Ring Road against traffic flow from Ashram Chowk slip road. Trajectory confirmed wrong-side entry via dual-camera triangulation. Lane markings and divider clearly visible. No construction diversion active in this zone.",
    evidenceFrames: [
      {
        id: "f2-1",
        label: "Entry against traffic",
        offsetSeconds: -0.5,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Vehicle visible moving against oncoming traffic on Ring Road. Divider clearly marked.",
        highlightZones: ["vehicle", "lane"],
      },
      {
        id: "f2-2",
        label: "Front plate + trajectory",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Front plate HR 26 DK 1024 captured. Vehicle clearly on wrong side of road.",
        highlightZones: ["vehicle", "plate", "lane"],
      },
    ],
    suggestedAction: "approve",
    exceptionFlags: [],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 3: No-Parking — Connaught Place, Low Plate Confidence ────────────
  {
    id: "VIO-DL-2024-0843",
    violationType: "parking",
    violationLabel: "No-Parking Zone Violation",
    timestamp: "2024-07-14T14:05:55Z",
    location: "Connaught Place Block B — Inner Circle",
    cameraId: "DL-CP-B-03",
    aiConfidence: 83,
    plateText: "DL 7C XX 2?01",
    plateConfidence: 44,
    aiRationale:
      "Vehicle stationary in designated No-Parking zone (yellow line) for 22+ minutes. Plate partially obscured — OCR returned low-confidence characters at positions 6 and 10. No-Parking sign clearly visible. Vehicle identity requires manual plate verification before citation.",
    evidenceFrames: [
      {
        id: "f3-1",
        label: "Vehicle parked — wide view",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Stationary vehicle in No-Parking zone. Yellow line visible. Sign visible. Plate partially dirty.",
        highlightZones: ["vehicle", "sign"],
      },
      {
        id: "f3-2",
        label: "Plate close-up",
        offsetSeconds: 2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Zoomed plate. Characters at positions 6 and 10 unclear — possible DL 7C MX 2001 or DL 7C XX 2701.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["low_plate_confidence", "ocr_ambiguity"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 4: Bus-Lane Misuse — Ashram Chowk, Faded Markings ───────────────
  {
    id: "VIO-DL-2024-0844",
    violationType: "bus_lane",
    violationLabel: "Bus Lane Misuse",
    timestamp: "2024-07-15T07:58:14Z",
    location: "Mathura Road — Ashram Chowk Bus Lane (Km 3.2)",
    cameraId: "DL-ASH-BL-02",
    aiConfidence: 68,
    plateText: "UP 16 BT 7712",
    plateConfidence: 91,
    aiRationale:
      "Vehicle detected in Bus Only lane during enforcement hours (07:00–10:00). However, 'BUS ONLY' road markings are 65% faded at this stretch. Signage present but 40 metres from entry point. Recommends signage and marking audit before citation.",
    evidenceFrames: [
      {
        id: "f4-1",
        label: "Vehicle in bus lane",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Vehicle in designated bus lane. Faded lane markings visible. Distant sign present.",
        highlightZones: ["vehicle", "lane", "sign"],
      },
      {
        id: "f4-2",
        label: "Lane marking detail",
        offsetSeconds: 1.5,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Ground-level view. 'BUS ONLY' paint is 65% worn. Boundary ambiguous.",
        highlightZones: ["lane"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["faded_lane_marking", "sign_distance"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 5: Helmetless Two-Wheeler — Dhaula Kuan Flyover ─────────────────
  {
    id: "VIO-DL-2024-0845",
    violationType: "no_helmet",
    violationLabel: "Helmetless Two-Wheeler Rider",
    timestamp: "2024-07-15T08:44:22Z",
    location: "Dhaula Kuan Flyover — Southbound Exit",
    cameraId: "DL-DK-FLY-01",
    aiConfidence: 92,
    plateText: "DL 4S AZ 9981",
    plateConfidence: 95,
    aiRationale:
      "Two-wheeler rider clearly visible without helmet on Dhaula Kuan flyover. High-resolution overhead camera captured both rider and pillion. Neither occupant wearing a helmet. Plate confirmed via rear capture. Clear violation under MV Act Section 129.",
    evidenceFrames: [
      {
        id: "f5-1",
        label: "Overhead — rider visible",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Overhead view of two-wheeler. Rider and pillion clearly visible without helmets.",
        highlightZones: ["vehicle", "plate"],
      },
      {
        id: "f5-2",
        label: "Rear plate capture",
        offsetSeconds: 0.8,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Rear plate DL 4S AZ 9981 captured at high resolution as vehicle exits flyover.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "approve",
    exceptionFlags: [],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 6: Illegal U-Turn — Karol Bagh, Medium Confidence ───────────────
  {
    id: "VIO-DL-2024-0846",
    violationType: "illegal_turn",
    violationLabel: "Illegal U-Turn",
    timestamp: "2024-07-15T07:34:50Z",
    location: "Karol Bagh Crossing — Ajmal Khan Rd",
    cameraId: "DL-KB-INT-06",
    aiConfidence: 71,
    plateText: "DL 8C NP 3341",
    plateConfidence: 88,
    aiRationale:
      "Vehicle made U-turn at Karol Bagh crossing. No U-Turn sign present at this junction but traffic movement rules posted 30m east. AI confidence is medium — camera angle oblique, and turn radius partially matches a permitted wide left turn. Manual review required.",
    evidenceFrames: [
      {
        id: "f6-1",
        label: "Vehicle approach",
        offsetSeconds: -2,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Vehicle in left lane approaching Karol Bagh crossing. No U-Turn sign not directly visible.",
        highlightZones: ["sign", "vehicle"],
      },
      {
        id: "f6-2",
        label: "U-turn maneuver",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Vehicle executing U-turn. Camera angle oblique — possible wide legal turn ambiguity.",
        highlightZones: ["vehicle", "lane"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["sign_distance", "ambiguous_angle"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 7: Ambulance Exception — Safdarjung Hospital Road ───────────────
  {
    id: "VIO-DL-2024-0847",
    violationType: "emergency_vehicle",
    violationLabel: "Red Light — Possible Emergency Override",
    timestamp: "2024-07-13T22:15:33Z",
    location: "Safdarjung Hospital Rd & Ring Rd — Night Camera",
    cameraId: "DL-SFJ-S-09",
    aiConfidence: 88,
    plateText: "DL 1LM 0012",
    plateConfidence: 82,
    aiRationale:
      "Vehicle ran red light at 22:15 near Safdarjung Hospital intersection. High confidence on red-light violation. However, blue-red strobe lights visible in frame. Vehicle may be an unmarked emergency response unit responding to a hospital call. Emergency override must be verified before citation.",
    evidenceFrames: [
      {
        id: "f7-1",
        label: "Night approach — strobes visible",
        offsetSeconds: -1,
        isPrimary: false,
        sceneType: "night",
        sceneDescription: "Vehicle approaching at speed near Safdarjung. Blue/red strobe lights active. Red signal ahead.",
        highlightZones: ["vehicle", "signal"],
      },
      {
        id: "f7-2",
        label: "Intersection crossing on red",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "night",
        sceneDescription: "Vehicle through red signal. Emergency strobes clearly visible. No other vehicle in intersection.",
        highlightZones: ["vehicle", "signal", "plate"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["emergency_strobe_detected", "night_incident"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 8: Rainy Night OCR Mismatch — Noida Border ─────────────────────
  {
    id: "VIO-DL-2024-0848",
    violationType: "ocr_mismatch",
    violationLabel: "Speeding — OCR Mismatch (Rain)",
    timestamp: "2024-07-12T21:42:19Z",
    location: "NH-24 Noida Border — DND Flyway Entry",
    cameraId: "UP-NDBD-E-03",
    aiConfidence: 58,
    plateText: "UP 1? BX 7?18",
    plateConfidence: 39,
    aiRationale:
      "Speed recorded: 89 km/h in 60 km/h zone on NH-24. Heavy rain degraded image quality significantly. OCR returned ambiguous characters at positions 4 and 9. VAHAN lookup returned UP 16 BX 7918 as closest match but confidence is insufficient for citation. Evidence quality fails minimum threshold.",
    evidenceFrames: [
      {
        id: "f8-1",
        label: "Rainy conditions — vehicle",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "rain",
        sceneDescription: "Heavy rain on NH-24. Vehicle barely visible. Speed radar: 89 km/h. Plate smeared.",
        highlightZones: ["vehicle"],
      },
      {
        id: "f8-2",
        label: "Plate — rain-degraded",
        offsetSeconds: 0.6,
        isPrimary: false,
        sceneType: "rain",
        sceneDescription: "Plate partially legible. Rain distortion makes confident OCR impossible at positions 4, 9.",
        highlightZones: ["plate"],
      },
    ],
    suggestedAction: "dismiss",
    exceptionFlags: ["poor_visibility", "weather_degradation", "low_plate_confidence", "ocr_mismatch"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 9: Blocked Intersection — AIIMS Flyover Junction ────────────────
  {
    id: "VIO-DL-2024-0849",
    violationType: "blocked_intersection",
    violationLabel: "Intersection Blocking",
    timestamp: "2024-07-11T09:20:07Z",
    location: "AIIMS Flyover Junction — Sri Aurobindo Marg",
    cameraId: "DL-AIIMS-JN-04",
    aiConfidence: 79,
    plateText: "DL 5S RT 6620",
    plateConfidence: 93,
    aiRationale:
      "Vehicle stopped in box junction at AIIMS junction for 28 seconds during green phase, blocking cross-traffic. Yellow box junction markings partially faded. Violation confirmed but marginal — vehicle appears to have been caught in sudden traffic bunching from ambulance bay exit. Review flagged.",
    evidenceFrames: [
      {
        id: "f9-1",
        label: "Vehicle blocking junction",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Vehicle stationary in box junction at AIIMS. Cross-traffic blocked. Faded yellow box visible.",
        highlightZones: ["vehicle", "lane"],
      },
      {
        id: "f9-2",
        label: "Box marking detail",
        offsetSeconds: 5,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Wider view showing vehicle still blocking. Hospital ambulance bay visible at top of frame.",
        highlightZones: ["vehicle", "sign"],
      },
    ],
    suggestedAction: "review",
    exceptionFlags: ["faded_lane_marking", "possible_ambulance_conflict"],
    status: "pending",
    reviewHistory: [],
  },

  // ── Case 10: Lane Violation — NH-48 Gurgaon Toll, Low Confidence ─────────
  {
    id: "VIO-DL-2024-0850",
    violationType: "false_detection",
    violationLabel: "Lane Violation — Likely False Positive",
    timestamp: "2024-07-10T11:05:44Z",
    location: "NH-48 — Gurgaon Toll Plaza (Km 28.4)",
    cameraId: "HR-NH48-T-11",
    aiConfidence: 37,
    plateText: "HR 29 AK 8814",
    plateConfidence: 90,
    aiRationale:
      "Model flagged lane violation on NH-48 near Gurgaon toll. However, trajectory analysis shows vehicle was performing a legal lane merge before toll plaza where lane narrowing is permitted. No lane violation sign present. Camera angle distorts merge radius. Likely false positive — recommend dismiss.",
    evidenceFrames: [
      {
        id: "f10-1",
        label: "Lane merge — wide view",
        offsetSeconds: 0,
        isPrimary: true,
        sceneType: "day",
        sceneDescription: "Vehicle merging lanes near toll plaza. Legal narrowing zone visible. No restriction signs.",
        highlightZones: ["vehicle", "lane"],
      },
      {
        id: "f10-2",
        label: "Signage check",
        offsetSeconds: -3,
        isPrimary: false,
        sceneType: "day",
        sceneDescription: "Wide-angle view of toll approach. No lane restriction signs visible. Legal merge zone.",
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
// Fast      = high-conf clean cases → near 1-click approve
// Review    = moderate conf, minor flags → manual validation needed
// Exception = ambiguous, heavily flagged, low-conf → escalate / inspect

export type ReviewLane = "fast" | "review" | "exception";

export function getReviewLane(c: ViolationCase): ReviewLane {
  const hasFlags = c.exceptionFlags.length > 0;
  const lowAI    = c.aiConfidence < 65;
  const lowPlate = c.plateConfidence < 60;
  if (lowAI || hasFlags || lowPlate) return "exception";
  if (c.aiConfidence >= 85 && c.plateConfidence >= 85 && c.suggestedAction === "approve") return "fast";
  return "review";
}

// ─── Decision guidance label ──────────────────────────────────────────────────
export type DecisionGuidance =
  | "quick_approve"
  | "needs_review"
  | "inspect_carefully"
  | "escalate_likely";

export function getDecisionGuidance(c: ViolationCase): DecisionGuidance {
  const hasEmergency = c.exceptionFlags.some((f) =>
    f.includes("emergency") || f.includes("strobe")
  );
  if (hasEmergency) return "escalate_likely";

  const hasHeavyFlags = c.exceptionFlags.length >= 2;
  const lowAI         = c.aiConfidence < 65;
  const lowPlate      = c.plateConfidence < 60;

  if (lowAI || lowPlate || hasHeavyFlags) return "inspect_carefully";
  if (c.aiConfidence >= 85 && c.plateConfidence >= 85 && c.exceptionFlags.length === 0 && c.suggestedAction === "approve") return "quick_approve";
  return "needs_review";
}

// ─── Helper: Get confidence bucket ───────────────────────────────────────────
export function getConfidenceBucket(
  confidence: number
): "high" | "medium" | "low" {
  if (confidence >= 85) return "high";
  if (confidence >= 65) return "medium";
  return "low";
}

// ─── Dismiss / Escalate reason list ──────────────────────────────────────────
export const DISMISS_REASONS: Array<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: "emergency_vehicle",
    label: "Emergency Vehicle",
    description: "Authorised emergency response in progress",
  },
  {
    value: "unreadable_plate",
    label: "Unreadable Plate",
    description: "Plate could not be confirmed with sufficient confidence",
  },
  {
    value: "ocr_mismatch",
    label: "OCR / Plate Mismatch",
    description: "OCR output conflicts with VAHAN records",
  },
  {
    value: "no_actual_violation",
    label: "No Actual Violation",
    description: "Evidence does not support the flagged infraction",
  },
  {
    value: "unclear_signage",
    label: "Unclear / Missing Signage",
    description: "Signage absent, obstructed, or ambiguous at location",
  },
  {
    value: "poor_visibility",
    label: "Low Visibility / Weather",
    description: "Rain, night glare, or fog degraded evidence quality",
  },
  {
    value: "contextual_ambiguity",
    label: "Contextual Ambiguity",
    description: "Traffic or road conditions create genuine ambiguity",
  },
  {
    value: "policy_ambiguity",
    label: "Policy Ambiguity",
    description: "Enforcement rules unclear or zone notification pending",
  },
  {
    value: "wrong_vehicle_match",
    label: "Wrong Vehicle Match",
    description: "Detected vehicle does not match VAHAN record",
  },
];

// ─── Violation type labels ────────────────────────────────────────────────────
export const VIOLATION_TYPE_LABELS: Record<string, string> = {
  red_light:           "Red Light",
  speeding:            "Speeding",
  wrong_side:          "Wrong Side",
  no_helmet:           "No Helmet",
  illegal_turn:        "Illegal Turn",
  parking:             "No-Parking",
  bus_lane:            "Bus Lane",
  blocked_intersection:"Blocked Junction",
  emergency_vehicle:   "Emergency Override",
  low_visibility:      "Low Visibility",
  ocr_mismatch:        "OCR Mismatch",
  false_detection:     "False Detection",
};
