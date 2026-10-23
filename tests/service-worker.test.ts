import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const serviceWorkerSource = readFileSync("public/sw.js", "utf8");

async function handlesWithCache(requestUrl: string): Promise<boolean> {
  let fetchHandler: ((event: { request: Request; respondWith: (response: Promise<unknown>) => void }) => void) | undefined;
  const caches = { open: vi.fn(() => Promise.resolve({ match: vi.fn(() => Promise.resolve(undefined)) })) };
  let responsePromise: Promise<unknown> | undefined;
  runInNewContext(serviceWorkerSource, {
    URL,
    Set,
    Promise,
    caches,
    fetch: vi.fn(() => Promise.resolve({ ok: false })),
    self: {
      location: { origin: "https://costa.example" },
      addEventListener: (type: string, handler: typeof fetchHandler) => {
        if (type === "fetch") fetchHandler = handler;
      },
    },
  });

  let intercepted = false;
  fetchHandler?.({
    request: new Request(requestUrl),
    respondWith: (response) => {
      intercepted = true;
      responsePromise = response;
    },
  });
  await responsePromise;
  return intercepted;
}

describe("offline service worker cache routes", () => {
  it("does not intercept private partner pages or query-bearing routes", async () => {
    expect(await handlesWithCache("https://costa.example/partners/hand-off-123")).toBe(false);
    expect(await handlesWithCache("https://costa.example/ask?session=private")).toBe(false);
  });

  it("keeps the explicit public shell available offline", async () => {
    expect(await handlesWithCache("https://costa.example/ask")).toBe(true);
  });
});
