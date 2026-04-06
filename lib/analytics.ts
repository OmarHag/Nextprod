import { pool } from "@/lib/db";

export type AnalyticsEventInput = {
  eventName: string;
  path?: string | null;
  userEmail?: string | null;
  sessionId?: string | null;
  metadata?: Record<string, unknown> | null;
};

let analyticsReady: Promise<void> | null = null;

export async function ensureAnalyticsTable() {
  if (!analyticsReady) {
    analyticsReady = (async () => {
      await pool.query(`
        create table if not exists analytics_events (
          id bigserial primary key,
          event_name text not null,
          path text,
          user_email text,
          session_id text,
          metadata jsonb not null default '{}'::jsonb,
          created_at timestamptz not null default now()
        )
      `);

      await pool.query(`
        create index if not exists analytics_events_created_at_idx
        on analytics_events (created_at desc)
      `);

      await pool.query(`
        create index if not exists analytics_events_event_name_idx
        on analytics_events (event_name)
      `);

      await pool.query(`
        create index if not exists analytics_events_user_email_idx
        on analytics_events (user_email)
      `);
    })();
  }

  await analyticsReady;
}

export async function trackServerEvent(input: AnalyticsEventInput) {
  await ensureAnalyticsTable();

  const eventName = input.eventName.trim();
  if (!eventName) return;

  await pool.query(
    `insert into analytics_events (event_name, path, user_email, session_id, metadata)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [
      eventName,
      input.path ?? null,
      input.userEmail ?? null,
      input.sessionId ?? null,
      JSON.stringify(input.metadata ?? {}),
    ],
  );
}

export async function trackServerEventSafely(input: AnalyticsEventInput) {
  try {
    await trackServerEvent(input);
  } catch (error) {
    console.error("[analytics] non-blocking event write failed", error);
  }
}

export async function getAnalyticsDashboardData() {
  await ensureAnalyticsTable();

  const [totals, eventBreakdown, topPaths, recentEvents, dailyActivity] =
    await Promise.all([
      pool.query(`
        select
          count(*)::int as total_events,
          count(*) filter (where created_at >= now() - interval '24 hours')::int as events_last_24h,
          count(*) filter (where created_at >= now() - interval '7 days')::int as events_last_7d,
          count(distinct coalesce(user_email, session_id))::int as unique_actors,
          count(distinct user_email) filter (where user_email is not null)::int as logged_in_users
        from analytics_events
      `),
      pool.query(`
        select event_name, count(*)::int as total
        from analytics_events
        where created_at >= now() - interval '7 days'
        group by event_name
        order by total desc, event_name asc
        limit 12
      `),
      pool.query(`
        select coalesce(path, '[no path]') as path, count(*)::int as total
        from analytics_events
        where created_at >= now() - interval '7 days'
        group by coalesce(path, '[no path]')
        order by total desc, path asc
        limit 10
      `),
      pool.query(`
        select
          id,
          event_name,
          coalesce(path, '') as path,
          coalesce(user_email, '') as user_email,
          coalesce(session_id, '') as session_id,
          metadata,
          created_at
        from analytics_events
        order by created_at desc
        limit 25
      `),
      pool.query(`
        select
          to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as day,
          count(*)::int as total
        from analytics_events
        where created_at >= now() - interval '14 days'
        group by date_trunc('day', created_at)
        order by day asc
      `),
    ]);

  return {
    totals: totals.rows[0] ?? {
      total_events: 0,
      events_last_24h: 0,
      events_last_7d: 0,
      unique_actors: 0,
      logged_in_users: 0,
    },
    eventBreakdown: eventBreakdown.rows,
    topPaths: topPaths.rows,
    recentEvents: recentEvents.rows,
    dailyActivity: dailyActivity.rows,
  };
}
