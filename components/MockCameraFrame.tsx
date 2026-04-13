"use client";

import type { EvidenceFrame, ViolationCase } from "@/types";

interface Props {
  frame: EvidenceFrame;
  violationType: ViolationCase["violationType"];
  plateText: string;
  cameraId: string;
  isPrimary?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  size?: "thumb" | "full";
}

// Color theme per scene type
const SCENE_THEMES = {
  day: { bg: "#1a2744", road: "#2a2a2a", sky: "#4a7ab5", roadLine: "#f0c040" },
  night: { bg: "#060d1f", road: "#1a1a1a", sky: "#0a0a1a", roadLine: "#e8e020" },
  rain: { bg: "#1a2030", road: "#252525", sky: "#3a4a5a", roadLine: "#888888" },
  blur: { bg: "#1e2030", road: "#222222", sky: "#4a5a6a", roadLine: "#999999" },
};

// Violation type → what the scene emphasizes
const SCENE_OVERLAYS: Record<
  string,
  { signalColor?: string; showSignal?: boolean; showSpeedGun?: boolean; speedValue?: string }
> = {
  red_light:           { showSignal: true, signalColor: "#ef4444" },
  speeding:            { showSpeedGun: true, speedValue: "89km/h" },
  wrong_side:          { showSignal: false },
  no_helmet:           {},
  illegal_turn:        { showSignal: false },
  parking:             {},
  bus_lane:            {},
  blocked_intersection:{},
  hov:                 {},
  emergency_vehicle:   { showSignal: true, signalColor: "#ef4444" },
  low_visibility:      {},
  ocr_mismatch:        {},
  false_detection:     {},
};

export function MockCameraFrame({
  frame,
  violationType,
  plateText,
  cameraId,
  isPrimary = false,
  isSelected = false,
  onClick,
  size = "full",
}: Props) {
  const theme = SCENE_THEMES[frame.sceneType];
  const overlay = SCENE_OVERLAYS[violationType] ?? {};
  const isThumb = size === "thumb";

  // Plate display — blur if rainy/low vis
  const displayPlate =
    frame.sceneType === "rain" || frame.sceneType === "blur"
      ? plateText.replace(/[A-Z0-9]/g, (c, i) =>
          i % 3 === 0 ? "?" : c
        )
      : plateText;

  const showPlateHighlight = frame.highlightZones.includes("plate");
  const showVehicleHighlight = frame.highlightZones.includes("vehicle");
  const showSignalHighlight = frame.highlightZones.includes("signal");
  const showLaneHighlight = frame.highlightZones.includes("lane");

  const w = isThumb ? 140 : 620;
  const h = isThumb ? 90 : 380;
  const scale = isThumb ? 0.23 : 1;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border-2 transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-300"
          : "border-slate-700"
      } ${onClick ? "cursor-pointer hover:border-blue-400" : ""}`}
      style={{ width: w, height: h, background: theme.bg }}
      title={frame.sceneDescription}
    >
      <svg
        width={w}
        height={h}
        viewBox="0 0 620 380"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        {/* Sky / background */}
        <rect width="620" height="380" fill={theme.bg} />

        {/* Rain effect */}
        {frame.sceneType === "rain" && (
          <g opacity="0.25">
            {Array.from({ length: 50 }).map((_, i) => (
              <line
                key={i}
                x1={10 + i * 12}
                y1={0}
                x2={5 + i * 12}
                y2={30}
                stroke="#aaccff"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Blur effect overlay */}
        {frame.sceneType === "blur" && (
          <rect width="620" height="380" fill="rgba(0,0,0,0.35)" />
        )}

        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.sky} />
            <stop offset="100%" stopColor={theme.bg} />
          </linearGradient>
          <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#333333" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect x="0" y="0" width="620" height="200" fill="url(#skyGrad)" />

        {/* Road */}
        <polygon
          points="0,380 620,380 490,200 130,200"
          fill="url(#roadGrad)"
        />

        {/* Road center lines */}
        <g opacity={frame.sceneType === "rain" ? 0.4 : 1}>
          {[240, 270, 300, 330, 360].map((y, i) => (
            <rect
              key={i}
              x={310 - (y - 180) * 0.15}
              y={y}
              width={Math.max(30 - (y - 240) * 0.3, 4)}
              height={8}
              fill={theme.roadLine}
              opacity={0.7}
            />
          ))}
        </g>

        {/* Lane highlight for bus/HOV/turn cases */}
        {showLaneHighlight && (
          <polygon
            points="200,380 310,200 430,200 500,380"
            fill="rgba(245,158,11,0.1)"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
        )}

        {/* Traffic signal */}
        {(overlay.showSignal || showSignalHighlight) && (
          <g>
            <rect x="460" y="80" width="28" height="80" rx="4" fill="#111827" />
            {/* Red light */}
            <circle
              cx="474"
              cy="100"
              r="9"
              fill={overlay.signalColor ?? "#ef4444"}
              filter="url(#glow)"
            />
            {/* Amber (off) */}
            <circle cx="474" cy="120" r="9" fill="#374151" />
            {/* Green (off) */}
            <circle cx="474" cy="140" r="9" fill="#374151" />
            {/* Glow for red */}
            <circle
              cx="474"
              cy="100"
              r="14"
              fill={overlay.signalColor ?? "#ef4444"}
              opacity="0.25"
            />
          </g>
        )}

        {/* Speed gun / radar overlay */}
        {overlay.showSpeedGun && (
          <g>
            <rect x="490" y="60" width="100" height="40" rx="4" fill="rgba(0,0,0,0.7)" />
            <text x="498" y="76" fill="#6b7280" fontSize="9" fontFamily="monospace">RADAR SPEED</text>
            <text x="498" y="94" fill="#ef4444" fontSize="18" fontFamily="monospace" fontWeight="bold">
              {overlay.speedValue}
            </text>
          </g>
        )}

        {/* Emergency strobes for emergency vehicle case */}
        {violationType === "emergency_vehicle" && frame.sceneType === "night" && (
          <g>
            <circle cx="280" cy="195" r="6" fill="#3b82f6" opacity="0.9" />
            <circle cx="280" cy="195" r="12" fill="#3b82f6" opacity="0.3" />
            <circle cx="310" cy="193" r="5" fill="#ef4444" opacity="0.9" />
            <circle cx="310" cy="193" r="10" fill="#ef4444" opacity="0.3" />
          </g>
        )}

        {/* Vehicle body — simplified silhouette */}
        {showVehicleHighlight ? (
          <g>
            {/* Vehicle highlight box */}
            <rect
              x="220"
              y="210"
              width="180"
              height="120"
              rx="2"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4,2"
            />
            <text x="222" y="226" fill="#3b82f6" fontSize="10" fontFamily="monospace">
              VEHICLE DETECTED
            </text>
            {/* Confidence bar */}
            <rect x="222" y="322" width="176" height="4" rx="2" fill="#1e3a5f" />
            <rect x="222" y="322" width="160" height="4" rx="2" fill="#3b82f6" />
          </g>
        ) : null}

        {/* Car silhouette */}
        <g transform="translate(230, 215)">
          {/* Car body */}
          <rect x="10" y="40" width="140" height="55" rx="4" fill="#2d3748" />
          {/* Car roof */}
          <polygon points="30,40 50,15 110,15 130,40" fill="#374151" />
          {/* Windows */}
          <polygon points="38,40 53,20 90,20 90,40" fill="#4a5568" opacity="0.8" />
          <polygon points="92,40 92,20 107,20 122,40" fill="#4a5568" opacity="0.8" />
          {/* Headlights */}
          <rect x="140" y="55" width="10" height="12" rx="2" fill="#fef3c7" opacity="0.9" />
          <circle cx="145" cy="61" r="4" fill="white" opacity="0.7" />
          {/* Wheels */}
          <circle cx="35" cy="95" r="12" fill="#1a202c" />
          <circle cx="35" cy="95" r="7" fill="#2d3748" />
          <circle cx="120" cy="95" r="12" fill="#1a202c" />
          <circle cx="120" cy="95" r="7" fill="#2d3748" />
        </g>

        {/* Plate area */}
        {showPlateHighlight ? (
          <g>
            <rect
              x="267"
              y="286"
              width="78"
              height="24"
              rx="2"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
            />
            <rect x="267" y="286" width="78" height="24" rx="2" fill="rgba(245,158,11,0.08)" />
            <text x="269" y="299" fill="#f59e0b" fontSize="8" fontFamily="monospace">
              PLATE OCR
            </text>
          </g>
        ) : null}

        {/* License plate on vehicle */}
        <rect x="272" y="290" width="68" height="16" rx="1" fill="white" />
        <text
          x="306"
          y="302"
          textAnchor="middle"
          fill="#111827"
          fontSize="9"
          fontFamily="monospace"
          fontWeight="bold"
          style={{
            filter:
              frame.sceneType === "rain"
                ? "blur(0.8px)"
                : frame.sceneType === "blur"
                ? "blur(1px)"
                : "none",
          }}
        >
          {displayPlate}
        </text>

        {/* Camera HUD overlay */}
        <g>
          {/* Top-left: camera ID */}
          <rect x="0" y="0" width="200" height="18" fill="rgba(0,0,0,0.55)" />
          <text
            x="6"
            y="12"
            fill="#9ca3af"
            fontSize="9"
            fontFamily="monospace"
          >
            {cameraId} · HD TRAFFIC CAM
          </text>

          {/* Top-right: REC indicator */}
          <circle cx="600" cy="10" r="5" fill="#ef4444" opacity="0.9" />
          <text x="572" y="14" fill="#9ca3af" fontSize="9" fontFamily="monospace">
            REC
          </text>

          {/* Bottom timestamp bar */}
          <rect x="0" y="362" width="620" height="18" fill="rgba(0,0,0,0.65)" />
          <text x="6" y="374" fill="#9ca3af" fontSize="9" fontFamily="monospace">
            {frame.offsetSeconds === 0
              ? "▶ VIOLATION MOMENT"
              : frame.offsetSeconds < 0
              ? `▶ T${frame.offsetSeconds}s (pre-event)`
              : `▶ T+${frame.offsetSeconds}s (post-event)`}
          </text>
          <text
            x="614"
            y="374"
            textAnchor="end"
            fill="#9ca3af"
            fontSize="9"
            fontFamily="monospace"
          >
            FRAME · {frame.label}
          </text>
        </g>

        {/* Low visibility fog overlay */}
        {frame.sceneType === "rain" && (
          <rect width="620" height="380" fill="rgba(100,120,140,0.18)" />
        )}
      </svg>

      {/* Thumbnail label overlay */}
      {isThumb && (
        <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5">
          <p className="text-white text-xs truncate leading-none py-0.5">
            {frame.label}
          </p>
        </div>
      )}
    </div>
  );
}
