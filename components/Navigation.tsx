"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheckIcon, ListIcon, ClipboardListIcon, BarChartIcon, RotateCcwIcon, PlayCircleIcon } from "lucide-react";
import { useReview } from "@/context/ReviewContext";
import { GuidedTour } from "@/components/GuidedTour";

const TOUR_KEY = "viq_tour_seen";

export function Navigation() {
  const pathname  = usePathname();
  const { state, restartDemo } = useReview();
  const [showTour, setShowTour] = useState(false);

  // Auto-open tour on first visit to the queue
  useEffect(() => {
    if (pathname === "/queue" || pathname === "/") {
      if (!localStorage.getItem(TOUR_KEY)) {
        // Small delay so the page renders before tour opens
        const t = setTimeout(() => setShowTour(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [pathname]);

  function handleTourClose() {
    setShowTour(false);
    localStorage.setItem(TOUR_KEY, "1");
  }

  const pending = state.cases.filter((c) => c.status === "pending").length;

  const links = [
    { href: "/queue",    label: "Queue",   icon: ListIcon,          badge: pending },
    { href: "/audit",    label: "Audit",   icon: ClipboardListIcon, badge: null },
    { href: "/insights", label: "Insights",icon: BarChartIcon,      badge: null },
  ];

  return (
    <>
      <nav className="bg-slate-900 text-white border-b border-slate-800 px-5 h-[57px] flex items-center gap-5 sticky top-0 z-40">
        {/* Logo */}
        <Link href="/queue" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
            <ShieldCheckIcon className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold leading-none">ViolationIQ</div>
            <div className="text-[10px] text-slate-500 leading-none mt-0.5">Traffic Review Console</div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon, badge }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  active ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {badge !== null && badge > 0 && (
                  <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {/* Session summary inline */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span>
              <span className="text-slate-300 font-semibold">{state.sessionStats.casesReviewed}</span> reviewed
            </span>
            <span>·</span>
            <span>
              <span className="text-slate-300 font-semibold">{pending}</span> pending
            </span>
          </div>

          {/* Tour button */}
          <button
            onClick={() => { setShowTour(true); }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 rounded-lg transition-all"
            title="Start guided tour"
          >
            <PlayCircleIcon className="w-3 h-3" />
            <span className="hidden lg:block">Tour</span>
          </button>

          <button
            onClick={restartDemo}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-white border border-slate-700 hover:border-slate-500 px-2.5 py-1.5 rounded-lg transition-all"
            title="Reset all cases to pending"
          >
            <RotateCcwIcon className="w-3 h-3" />
            Reset
          </button>

          {/* Reviewer */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold text-[10px]">
              A
            </div>
            <span className="hidden lg:block">Insp. A. Sharma</span>
          </div>
        </div>
      </nav>

      {showTour && <GuidedTour onClose={handleTourClose} />}
    </>
  );
}
