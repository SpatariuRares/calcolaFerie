"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

function redactAnalyticsUrl(event: BeforeSendEvent): BeforeSendEvent {
  const url = new URL(event.url);
  url.search = "";

  return {
    ...event,
    url: url.toString(),
  };
}

export function VercelAnalytics() {
  return <Analytics beforeSend={redactAnalyticsUrl} />;
}
