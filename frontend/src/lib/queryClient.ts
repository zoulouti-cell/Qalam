import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { del, get, set } from "idb-keyval";

// Exported so lib/session can wipe it at session boundaries — cached data outlives logout.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 1000 * 60 * 60 * 24 * 30 } },
});

// Local copy of everything the app has loaded, kept in the browser's IndexedDB on this device,
// so the office's data stays readable when the connection drops (and survives app restarts).
export const PERSIST_KEY = "qalam-offline-copy";
export const persister = createAsyncStoragePersister({
  key: PERSIST_KEY,
  storage: { getItem: (k) => get<string>(k).then((v) => v ?? null), setItem: (k, v: string) => set(k, v), removeItem: (k) => del(k) },
  throttleTime: 2000,
});
