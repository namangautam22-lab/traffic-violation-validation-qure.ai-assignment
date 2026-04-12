"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheckIcon,
  ListIcon,
  ClipboardListIcon,
  BarChartIcon,
} from "lucide-react";
import { useReview } from "@/context/ReviewContext";

export function Navigation() {
  const pathname = usePathname();
  const { state } = useReview();
  const pendingCount = state.cases.filter((c) => c.status === "pending").length;

  const links = [
    { href: "/queue", label: "Review Queue", icon: ListIcon, badge: pendingCount },
    { href: "/audit", label: "Audit Log", icon: ClipboardListIcon, badge: null },
    { href: "/insights", label: "Insights", icon: BarChartIcon, badge: null },
  ];

  return (
    <nav className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 flex items-center gap-6 sticky top-0 z-40">
      {/* Logo / home */}
      <Link href="/" className="flex items-center gap-2.5 mr-4 shrink-0">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ShieldCheckIcon className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold leading-none">ViolationIQ</div>
          <div className="text-xs text-slate-400 leading-none mt-0.5">
            AI Review System
          </div>
        </div>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge !== null && badge > 0 && (
                <span className="ml-0.5 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Mode badge */}
        <div
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            state.mode === "guided"
              ? "bg-blue-700 text-blue-200"
              : "bg-slate-700 text-slate-300"
          }`}
        >
          {state.mode === "guided" ? "Guided Mode" : "Review Mode"}
        </div>

        {/* Reviewer badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-7 h-7 bg-slate-600 rounded-full flex items-center justify-center text-white font-bold">
            A
          </div>
          <span>Officer A. Williams</span>
        </div>
      </div>
    </nav>
  );
}
