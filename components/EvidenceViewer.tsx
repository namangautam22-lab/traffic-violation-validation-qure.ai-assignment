"use client";

import { useState } from "react";
import { ZoomInIcon, InfoIcon } from "lucide-react";
import type { ViolationCase } from "@/types";
import { MockCameraFrame } from "./MockCameraFrame";

interface Props {
  violationCase: ViolationCase;
  isGuided?: boolean;
}

export function EvidenceViewer({ violationCase, isGuided }: Props) {
  const [selectedFrameId, setSelectedFrameId] = useState(
    violationCase.evidenceFrames.find((f) => f.isPrimary)?.id ??
      violationCase.evidenceFrames[0]?.id
  );

  const selectedFrame =
    violationCase.evidenceFrames.find((f) => f.id === selectedFrameId) ??
    violationCase.evidenceFrames[0];

  if (!selectedFrame) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Guided prompt */}
      {isGuided && (
        <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          <InfoIcon className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Step 2 — Validate Evidence.</span>{" "}
            Examine each frame carefully. The primary frame shows the moment of
            violation. Look for the highlighted zones: vehicle position, plate
            text, signal state, and lane markings.
          </p>
        </div>
      )}

      {/* Primary frame */}
      <div className="relative">
        <MockCameraFrame
          frame={selectedFrame}
          violationType={violationCase.violationType}
          plateText={violationCase.plateText}
          cameraId={violationCase.cameraId}
          isPrimary
          size="full"
        />

        {/* Primary badge */}
        {selectedFrame.isPrimary && (
          <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Primary Evidence Frame
          </div>
        )}

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs flex items-center gap-1 px-2 py-1 rounded-full">
          <ZoomInIcon className="w-3 h-3" />
          HD Camera Feed
        </div>
      </div>

      {/* Frame description */}
      <div className="bg-slate-800 text-slate-200 rounded-lg px-4 py-2.5 text-sm">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">
          Frame Analysis
        </span>
        <p className="mt-1">{selectedFrame.sceneDescription}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedFrame.highlightZones.map((zone) => (
            <span
              key={zone}
              className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full"
            >
              {zone.charAt(0).toUpperCase() + zone.slice(1)} highlighted
            </span>
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      {violationCase.evidenceFrames.length > 1 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">
            All Evidence Frames ({violationCase.evidenceFrames.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {violationCase.evidenceFrames.map((frame) => (
              <MockCameraFrame
                key={frame.id}
                frame={frame}
                violationType={violationCase.violationType}
                plateText={violationCase.plateText}
                cameraId={violationCase.cameraId}
                isSelected={frame.id === selectedFrameId}
                onClick={() => setSelectedFrameId(frame.id)}
                size="thumb"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
