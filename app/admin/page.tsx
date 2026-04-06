import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import PageViewTracker from "@/components/analytics/PageViewTracker";
import { getAnalyticsDashboardData } from "@/lib/analytics";
import { isAdminEmail } from "@/lib/admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const email = cookieStore.get("user")?.value ?? null;

  if (!email) {
    redirect("/api/auth");
  }

  if (!isAdminEmail(email)) {
    redirect("/");
  }

  const data = await getAnalyticsDashboardData();
  const maxDaily = Math.max(
    ...data.dailyActivity.map((item: { total: number }) => item.total),
    1,
  );

  return (
    <main className="theme-shell min-h-screen text-white">
      <SiteHeader currentSection="admin" />
      <PageViewTracker page="admin_analytics" path="/admin" />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-black text-white">
              Analytics Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Real usage data for visitors, feature clicks, logins, todo activity,
              and interview engagement.
            </p>
          </div>
          <Link
            href="/"
            className="theme-button-secondary rounded-full px-5 py-3 text-sm font-semibold transition"
          >
            Back Home
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total Events", value: data.totals.total_events },
            { label: "Last 24 Hours", value: data.totals.events_last_24h },
            { label: "Last 7 Days", value: data.totals.events_last_7d },
            { label: "Unique Actors", value: data.totals.unique_actors },
            { label: "Logged-In Users", value: data.totals.logged_in_users },
          ].map((item) => (
            <div key={item.label} className="theme-panel-soft rounded-3xl p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-4 text-3xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="theme-panel rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-white">Daily Activity</h2>
            <p className="mt-2 text-sm text-slate-400">
              Events recorded over the last 14 days.
            </p>
            <div className="mt-6 space-y-3">
              {data.dailyActivity.length === 0 && (
                <p className="text-slate-400">No analytics events yet.</p>
              )}
              {data.dailyActivity.map((row: { day: string; total: number }) => (
                <div key={row.day}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                    <span>{row.day}</span>
                    <span>{row.total}</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5">
                    <div
                      className="theme-button-primary h-3 rounded-full"
                      style={{
                        width: `${Math.max(
                          8,
                          Math.min(100, (row.total / maxDaily) * 100),
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="theme-panel rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white">Top Events</h2>
              <div className="mt-5 space-y-3">
                {data.eventBreakdown.length === 0 && (
                  <p className="text-slate-400">No event data yet.</p>
                )}
                {data.eventBreakdown.map(
                  (row: { event_name: string; total: number }) => (
                    <div
                      key={row.event_name}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="text-slate-200">{row.event_name}</span>
                      <span className="font-semibold text-white">{row.total}</span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="theme-panel rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-white">Top Paths</h2>
              <div className="mt-5 space-y-3">
                {data.topPaths.length === 0 && (
                  <p className="text-slate-400">No page data yet.</p>
                )}
                {data.topPaths.map((row: { path: string; total: number }) => (
                  <div
                    key={row.path}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="truncate text-slate-200">{row.path}</span>
                    <span className="ml-3 font-semibold text-white">{row.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="theme-panel mt-8 rounded-3xl p-6">
          <h2 className="text-2xl font-bold text-white">Recent Events</h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Event</th>
                  <th className="pb-3 pr-4 font-medium">Path</th>
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEvents.length === 0 && (
                  <tr>
                    <td className="py-4 text-slate-400" colSpan={5}>
                      No recent events yet.
                    </td>
                  </tr>
                )}
                {data.recentEvents.map(
                  (row: {
                    id: number;
                    created_at: string;
                    event_name: string;
                    path: string;
                    user_email: string;
                    session_id: string;
                    metadata: Record<string, unknown>;
                  }) => (
                    <tr key={row.id} className="border-b border-white/6">
                      <td className="py-3 pr-4 text-slate-300">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-white">{row.event_name}</td>
                      <td className="py-3 pr-4 text-slate-300">{row.path || "-"}</td>
                      <td className="py-3 pr-4 text-slate-300">
                        {row.user_email || row.session_id || "-"}
                      </td>
                      <td className="py-3 text-slate-400">
                        <pre className="whitespace-pre-wrap font-mono text-xs">
                          {JSON.stringify(row.metadata ?? {}, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
