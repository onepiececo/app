import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

// getToken is cached per request so multiple actions in the same render share one mint.
const getToken = cache(async (): Promise<string | null> => {
  try {
    const h = await headers();
    const result = await auth.api.getToken({ headers: h });
    return result?.token ?? null;
  } catch {
    return null;
  }
});

type FetchOptions = RequestInit & {
  anonKey?: string;
};

// serverFetch is the Go API client used from server components and server actions.
// Bearer comes from Better Auth's jwt plugin. Pass anonKey for unauthenticated callers.
export const serverFetch = async (path: string, opts: FetchOptions = {}) => {
  const headersOut = new Headers(opts.headers);
  if (!headersOut.has("content-type") && opts.body) {
    headersOut.set("content-type", "application/json");
  }
  if (opts.anonKey) {
    headersOut.set("x-anonymous-key", opts.anonKey);
  } else {
    const token = await getToken();
    if (token) headersOut.set("authorization", `Bearer ${token}`);
  }
  return fetch(`${SERVER_URL}${path}`, { ...opts, headers: headersOut });
};

export const serverJSON = async <T>(path: string, opts: FetchOptions = {}): Promise<T> => {
  const res = await serverFetch(path, opts);
  if (!res.ok) throw new Error(`server ${path} returned ${res.status}`);
  return res.json() as Promise<T>;
};
