"use client";

import { useEffect, useState } from "react";

type Me = { email?: string | null };

export default function RequireInterviewAccess({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/me")
      .then(async (response) =>
        response.ok ? ((await response.json()) as Me) : ({} as Me),
      )
      .then((data) => setUserEmail(data.email ?? null))
      .catch(() => setUserEmail(null));
  }, []);

  if (userEmail === undefined) {
    return (
      <section className="mx-auto flex max-w-4xl justify-center px-4 pb-20">
        <div className="theme-panel w-full rounded-[2rem] p-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Interview Access
          </p>
          <h1 className="mt-4 text-3xl font-black text-white">Loading access…</h1>
        </div>
      </section>
    );
  }

  if (!userEmail) {
    return (
      <section className="mx-auto flex max-w-4xl justify-center px-4 pb-20">
        <div className="theme-panel w-full rounded-[2rem] p-10 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            Private Interview Workspace
          </p>
          <h1 className="mt-4 text-4xl font-black text-white">
            Login required
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            The interview area is part of your personal product workspace. Sign in
            to access voice sessions, prep pages, and future saved interview data.
          </p>
          <a
            href="/api/auth"
            className="theme-button-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm font-semibold transition"
          >
            Login to Continue
          </a>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
