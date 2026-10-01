"use client";

import { useEffect } from "react";

/** Registers a tiny service worker that caches the app shell for offline FAQ chips / navigation. */
export function RegisterSw() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => null);
  }, []);
  return null;
}
