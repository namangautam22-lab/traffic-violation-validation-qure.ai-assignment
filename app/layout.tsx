import type { Metadata } from "next";
import "./globals.css";
import { ReviewProvider } from "@/context/ReviewContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "ViolationIQ — AI Traffic Violation Review System",
  description:
    "Human-in-the-loop review system for AI-flagged traffic violations. Guided workflow for supervisors and review officers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 min-h-screen">
        <ReviewProvider>
          <Navigation />
          <main>{children}</main>
        </ReviewProvider>
      </body>
    </html>
  );
}
