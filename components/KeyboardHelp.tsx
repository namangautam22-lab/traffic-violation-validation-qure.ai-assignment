"use client";

import { XIcon, KeyboardIcon } from "lucide-react";

const SHORTCUTS = [
  { keys: ["A"],        label: "Approve active case" },
  { keys: ["D"],        label: "Dismiss active case" },
  { keys: ["E"],        label: "Escalate active case" },
  { keys: ["V"],        label: "Open detail view" },
  { keys: ["J", "↓"],  label: "Next case" },
  { keys: ["K", "↑"],  label: "Previous case" },
  { keys: ["Enter"],   label: "Confirm action / submit" },
  { keys: ["Esc"],     label: "Close modal / cancel" },
  { keys: ["F"],       label: "Focus search" },
  { keys: ["?"],       label: "Toggle shortcuts" },
];

export function KeyboardHelp({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm pointer-events-auto overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <KeyboardIcon className="w-4 h-4 text-slate-500" />
              Keyboard Shortcuts
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 gap-2">
            {SHORTCUTS.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-1.5 py-0.5 text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded text-slate-700 min-w-[24px] text-center"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4 text-xs text-slate-400">
            Shortcuts are disabled while typing in search or notes.
          </div>
        </div>
      </div>
    </>
  );
}
