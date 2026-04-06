"use client";

import SiteHeader from "@/components/SiteHeader";
import InterviewMenu from "@/components/interview/InterviewMenu";
import RequireInterviewAccess from "@/components/interview/RequireInterviewAccess";

export default function SignupPage() {
  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection="interview" />
      <InterviewMenu />
      <RequireInterviewAccess>
        <section className="mx-auto flex max-w-4xl justify-center px-4 pb-20">
          <div className="theme-panel w-full max-w-2xl rounded-3xl p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
              Access Notes
            </p>
            <h1 className="mt-3 text-3xl font-black text-white">
              You’re already inside the private interview area.
            </h1>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              This section doesn’t need a fake signup form anymore. The real gate
              is your existing login, so once you’re authenticated you can move
              straight into prep or voice practice.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/interview/voice"
                className="theme-button-primary inline-flex rounded-full px-6 py-3 text-sm font-semibold transition"
              >
                Go to Voice Interview
              </a>
              <a
                href="/interview/practice"
                className="theme-button-secondary inline-flex rounded-full px-6 py-3 text-sm font-semibold transition"
              >
                Open Prep Notes
              </a>
            </div>
          </div>
        </section>
      </RequireInterviewAccess>
    </main>
  );
}
