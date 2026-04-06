"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Section = "home" | "todo" | "interview" | "admin";
type Me = { email?: string | null; isAdmin?: boolean };

const baseLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium transition-all";

export default function SiteHeader({
  currentSection,
}: {
  currentSection: Section;
}) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then(async (r) => (r.ok ? ((await r.json()) as Me) : ({} as Me)))
      .then((data) => {
        setUserEmail(data.email ?? null);
        setIsAdmin(Boolean(data.isAdmin));
      })
      .catch(() => {
        setUserEmail(null);
        setIsAdmin(false);
      });
  }, []);

  const todoHref = userEmail ? "/?tab=todo" : "/api/auth";
  const interviewHref = userEmail ? "/interview" : "/api/auth";
  const showAdmin = isAdmin;

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(7,13,25,0.9)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <nav className="flex flex-1 flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/4 p-1">
          <Link
            href="/"
            className={`${baseLinkClass} ${
              currentSection === "home"
                ? "theme-button-primary"
                : "text-slate-300 hover:bg-white/6 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            href={interviewHref}
            className={`${baseLinkClass} ${
              currentSection === "interview"
                ? "theme-button-primary"
                : "text-slate-300 hover:bg-white/6 hover:text-white"
            }`}
          >
            Interview
          </Link>
          <Link
            href={todoHref}
            className={`${baseLinkClass} ${
              currentSection === "todo"
                ? "theme-button-primary"
                : "text-slate-300 hover:bg-white/6 hover:text-white"
            }`}
          >
            Todo
          </Link>
          {showAdmin && (
            <Link
              href="/admin"
              className={`${baseLinkClass} ${
                currentSection === "admin"
                  ? "theme-button-primary"
                  : "text-slate-300 hover:bg-white/6 hover:text-white"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {userEmail && (
            <span className="hidden max-w-[220px] truncate text-sm text-slate-400 sm:block">
              {userEmail}
            </span>
          )}
          {userEmail ? (
            <a
              href="/api/logout"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Logout
            </a>
          ) : (
            <a
              href="/api/auth"
              className="rounded-full theme-button-primary px-4 py-2 text-sm font-semibold transition"
            >
              Login
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
