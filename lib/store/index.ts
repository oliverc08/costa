import type { Store } from "./types";
import { createMemoryStore } from "./memory";
import { createNeonStore } from "./neon";

let store: Store | null = null;

export function getStore(): Store {
  if (!store) {
    const url = process.env.DATABASE_URL;
    store = url ? createNeonStore(url) : createMemoryStore();
  }
  return store;
}

export function setStoreForTesting(s: Store) {
  store = s;
}

export * from "./types";
