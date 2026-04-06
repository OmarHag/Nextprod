const SESSION_KEY = "omarh_analytics_session";

function getSessionId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

export async function trackEvent(
  eventName: string,
  options?: {
    path?: string;
    metadata?: Record<string, unknown>;
  },
) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    eventName,
    path: options?.path ?? window.location.pathname,
    sessionId: getSessionId(),
    metadata: options?.metadata ?? {},
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }

    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Never block UI because of analytics.
  }
}
