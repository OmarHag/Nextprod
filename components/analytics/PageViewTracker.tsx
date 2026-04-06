"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";

export default function PageViewTracker({
  page,
  path,
}: {
  page: string;
  path: string;
}) {
  useEffect(() => {
    void trackEvent("page_view", {
      path,
      metadata: { page },
    });
  }, [page, path]);

  return null;
}
