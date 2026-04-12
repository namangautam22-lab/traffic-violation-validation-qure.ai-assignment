"use client";

import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  PlayCircleIcon,
  ListIcon,
  BrainCircuitIcon,
  UserCheckIcon,
  DatabaseIcon,
  TrendingUpIcon,
  ArrowRightIcon,
  ClockIcon,
  ScaleIcon,
  ZapIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { MOCK_CASES } from "@/data/cases";

const FLOW_STEPS = [
  {
    number: 1,
    icon: BrainCircuitIcon,
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    title: "AI Detects",
    desc: "Camera AI flags a potential violation and packages evidence with confidence scores and a rationale.",
  },
  {
    number: 2,
    icon: UserCheckIcon,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    title: "Human Reviews",
    desc: "A review officer examines evidence, verifies the plate, and checks for any exceptions.",
  },
  {
    number: 3,
    icon: DatabaseIcon,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    title: "Decision Recorded",
    desc: "Every action — approve, dismiss, or escalate — is logged with a full, tamper-evident audit trail.",
  },
  {
    number: 4,
    icon: TrendingUpIcon,
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    title: "Model Improves",
    desc: "Human decisions become training signals, reducing false positives in future detections.",
  },
];

const VALUE_PROPS = [
  { icon: ClockIcon,  title: "Faster Reviews",        desc: "Structured workflow cuts average review time from 4 minutes to under 45 seconds." },
  { icon: ScaleIcon,  title: "Legally Defensible",    desc: "Every decision records reviewer ID, checklist answers, reason, and timestamp." },
  { icon: ZapIcon,    title: "AI Gets Smarter",        desc: "Human overrides feed back as training signals to reduce future false positives." },
];

export default function LandingPage() {
  const router = useRouter();
  const { startWalkthrough, openCase, state } = useReview();

  const firstCase = state.cases.find((c) => c.status === "pending") ?? MOCK_CASES[0];
  const pendingCount = state.cases.filter((c) => c.status === "pending").length;

  function handleGuided() {
    startWalkthrough();
    openCase(firstCase.id);
    router.push(`/review/${firstCase.id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">

      {/* ── Hero ── */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full mb-5 border border-blue-200 tracking-wide uppercase">
          <ShieldCheckIcon className="w-3.5 h-3.5" />
          PM Prototype · All data is mocked
        </div>

        <h1 className="text-[2.6rem] font-extrabold text-slate-900 leading-[1.15] mb-4 tracking-tight">
          AI-Powered Traffic<br />Violation Review System
        </h1>

        <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed mb-2">
          A guided workflow for review officers to validate AI-flagged violations
          quickly, accurately, and with a complete audit trail.
        </p>

        {/* Core principle */}
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl px-5 py-2.5 shadow-sm mb-9">
          <span className="font-semibold text-violet-600">AI suggests</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-blue-600">Human confirms</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-emerald-600">System records</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-semibold text-amber-600">Model learns</span>
        </div>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleGuided}
            className="flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-4 rounded-xl shadow-lg shadow-blue-200 transition-all text-base"
          >
            <PlayCircleIcon className="w-5 h-5" />
            Start Guided Walkthrough
          </button>
          <button
            onClick={() => router.push("/queue")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-4 rounded-xl border border-slate-200 shadow-sm transition-all text-sm"
          >
            <ListIcon className="w-4 h-4" />
            Browse Review Queue
            {pendingCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full ml-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Recommended: start with the guided walkthrough — it explains every step
        </p>
      </div>

      {/* ── 4-step flow ── */}
      <div className="mb-14">
        <div className="text-center mb-7">
          <h2 className="text-xl font-bold text-slate-800">The 4-Step Review Process</h2>
          <p className="text-sm text-slate-500 mt-1">Every case follows this exact workflow</p>
        </div>

        <div className="grid grid-cols-4 gap-4 relative">
          <div className="absolute top-[34px] left-[13%] right-[13%] h-0.5 bg-slate-100 z-0" />

          {FLOW_STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative z-10">
                <div className={`border rounded-2xl px-4 py-5 ${step.bg}`}>
                  <div className="flex items-center justify-center gap-1.5 mb-3">
                    <span className="w-6 h-6 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 flex items-center justify-center shadow-sm">
                      {step.number}
                    </span>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 text-center mb-1.5">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed text-center">{step.desc}</p>
                </div>
                {idx < FLOW_STEPS.length - 1 && (
                  <div className="absolute right-0 top-8 translate-x-1/2 z-20">
                    <ArrowRightIcon className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Value props ── */}
      <div className="grid grid-cols-3 gap-4 mb-14">
        {VALUE_PROPS.map((vp) => {
          const Icon = vp.icon;
          return (
            <div key={vp.title} className="bg-white border border-slate-200 rounded-xl px-5 py-5 text-center">
              <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2.5" />
              <h3 className="text-sm font-bold text-slate-800 mb-1">{vp.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{vp.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ── Queue preview ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Current Review Queue</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {pendingCount} cases awaiting human review
            </p>
          </div>
          <button
            onClick={() => router.push("/queue")}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            View all →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {state.cases.slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                openCase(c.id);
                router.push(`/review/${c.id}`);
              }}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 text-left">
                <span className="text-sm font-medium text-slate-800">{c.violationLabel}</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:block">{c.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold ${
                    c.aiConfidence >= 85 ? "text-emerald-700"
                    : c.aiConfidence >= 65 ? "text-amber-700"
                    : "text-red-700"
                  }`}
                >
                  {c.aiConfidence}% AI
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.status === "pending" ? "bg-slate-100 text-slate-600"
                    : c.status === "approved" ? "bg-emerald-100 text-emerald-700"
                    : c.status === "dismissed" ? "bg-red-100 text-red-700"
                    : "bg-purple-100 text-purple-700"
                  }`}
                >
                  {c.status}
                </span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>

        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={handleGuided}
            className="w-full text-center text-sm text-blue-600 font-bold hover:underline"
          >
            Start guided walkthrough with the first case →
          </button>
        </div>
      </div>
    </div>
  );
}
