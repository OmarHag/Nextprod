"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageSquare, Timer, WandSparkles } from "lucide-react";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import SiteHeader from "@/components/SiteHeader";
import InterviewMenu from "@/components/interview/InterviewMenu";
import RequireInterviewAccess from "@/components/interview/RequireInterviewAccess";
import { trackEvent } from "@/lib/analytics-client";

export default function PracticePage() {
  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection="interview" />
      <InterviewMenu />
      <RequireInterviewAccess>
        <PageViewTracker page="interview_practice" path="/interview/practice" />
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="theme-panel rounded-[2rem] p-10">
            <div className="theme-pill inline-flex rounded-full px-4 py-2 text-sm font-medium">
              Prep Notes
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              A clean interview prep page you can actually use.
            </h1>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: MessageSquare,
                  title: "Lead with a clear opening",
                  copy: "Start answers with the direct point first, then back it up with context, decisions, and outcome.",
                },
                {
                  icon: Timer,
                  title: "Keep answers tight",
                  copy: "Aim for answers that are specific and complete without turning into a five-minute ramble.",
                },
                {
                  icon: CheckCircle2,
                  title: "Use evidence",
                  copy: "Mention what you built, what changed, and how you measured the result whenever possible.",
                },
                {
                  icon: WandSparkles,
                  title: "Fix weak phrasing",
                  copy: "Replace vague filler like “I helped with” or “I was involved in” with direct ownership language.",
                },
              ].map((item) => (
                <div key={item.title} className="theme-panel-soft rounded-3xl p-6">
                  <item.icon className="mb-4 h-8 w-8 text-teal-300" />
                  <h2 className="text-xl font-bold text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/interview/voice"
                onClick={() =>
                  void trackEvent("voice_interview_cta_clicked", {
                    path: "/interview/practice",
                  })
                }
                className="theme-button-primary inline-flex h-12 items-center rounded-full px-8 text-lg font-semibold transition"
              >
                Start Voice Interview
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/interview"
                className="theme-button-secondary inline-flex h-12 items-center rounded-full px-8 text-lg font-semibold transition"
              >
                Back to Overview
              </Link>
            </div>
          </div>
        </section>
      </RequireInterviewAccess>
    </main>
  );
}
