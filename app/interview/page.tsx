"use client";

import Link from "next/link";
import { ArrowRight, Brain, Mic, Sparkles, Target, TrendingUp, Users } from "lucide-react";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import SiteHeader from "@/components/SiteHeader";
import InterviewMenu from "@/components/interview/InterviewMenu";
import RequireInterviewAccess from "@/components/interview/RequireInterviewAccess";
import { trackEvent } from "@/lib/analytics-client";

const features = [
  {
    icon: Target,
    title: "Company Context",
    description:
      "Pick a company and role so the prompts feel aligned with the interview you actually want to win.",
  },
  {
    icon: Mic,
    title: "Live Voice Flow",
    description:
      "Record answers naturally, send them through the interview loop, and keep the conversation moving.",
  },
  {
    icon: Brain,
    title: "Resume-Aware Prompts",
    description:
      "Upload your resume and let the system pull project depth into the follow-up questions.",
  },
  {
    icon: TrendingUp,
    title: "Strict Review",
    description:
      "Finish the session with category scores, feedback, and direct next steps instead of vague encouragement.",
  },
  {
    icon: Users,
    title: "Broad Coverage",
    description:
      "Use it for software, cloud, security, finance, consulting, and other role tracks.",
  },
  {
    icon: Sparkles,
    title: "One Theme",
    description:
      "The interview section now matches the rest of the app instead of feeling like a separate product.",
  },
];

export default function InterviewHomePage() {
  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection="interview" />
      <InterviewMenu />
      <RequireInterviewAccess>
        <PageViewTracker page="interview_overview" path="/interview" />
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="theme-panel rounded-[2rem] px-6 py-14 text-center sm:px-10 lg:px-14">
              <div className="theme-pill mb-6 inline-flex rounded-full px-4 py-2 text-sm font-medium">
                Private interview workspace
              </div>

              <h1 className="mx-auto max-w-5xl text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">
                Practice your answers out loud and get sharper feedback every session.
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-300">
                I built this section to feel closer to a real prep lab than a fake
                SaaS landing page. Use it to rehearse, refine delivery, and track
                where your answers still sound weak.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/interview/voice"
                  onClick={() =>
                    void trackEvent("voice_interview_cta_clicked", {
                      path: "/interview",
                    })
                  }
                  className="theme-button-primary inline-flex h-12 items-center rounded-full px-8 text-base font-semibold transition"
                >
                  Start Voice Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/interview/practice"
                  onClick={() =>
                    void trackEvent("practice_page_open_clicked", {
                      path: "/interview",
                    })
                  }
                  className="theme-button-secondary inline-flex h-12 items-center rounded-full px-8 text-base font-semibold transition"
                >
                  Open Prep Notes
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24">
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="theme-panel-soft rounded-3xl p-7"
              >
                <feature.icon className="mb-4 h-10 w-10 text-teal-300" />
                <h2 className="text-xl font-bold text-white">{feature.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </RequireInterviewAccess>
    </main>
  );
}
