"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/interview", label: "Overview" },
  { href: "/interview/practice", label: "Practice" },
  { href: "/interview/voice", label: "Voice Interview" },
  { href: "/interview/signup", label: "Get Access" },
];

export default function InterviewMenu() {
  const pathname = usePathname();

  return (
    <div className="mx-auto mb-10 flex max-w-6xl flex-wrap gap-3 px-4 pt-8">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== "/interview" && pathname.startsWith(`${tab.href}/`));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              active
                ? "border-teal-300/40 bg-teal-400/12 text-teal-100"
                : "border-white/10 bg-white/4 text-slate-300 hover:border-white/20 hover:bg-white/8 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
