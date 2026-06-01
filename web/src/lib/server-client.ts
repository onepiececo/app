// Thin client for the Go server.
// Mints a Bearer JWT via Better Auth's /api/auth/token endpoint and forwards it.

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:8080";

type RequestOptions = RequestInit & {
  bearer?: string;
};

async function getBrowserToken(): Promise<string | null> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return null;
  const body = (await res.json()) as { token?: string };
  return body.token ?? null;
}

export const serverFetch = async (path: string, opts: RequestOptions = {}) => {
  const headers = new Headers(opts.headers);
  if (!headers.has("content-type") && opts.body) {
    headers.set("content-type", "application/json");
  }

  const token = opts.bearer ?? (typeof window === "undefined" ? null : await getBrowserToken());
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${SERVER_URL}${path}`, {
    ...opts,
    headers,
  });
  return res;
};

export const serverJSON = async <T>(path: string, opts: RequestOptions = {}): Promise<T> => {
  const res = await serverFetch(path, opts);
  if (!res.ok) {
    throw new Error(`server ${path} returned ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const serverURL = SERVER_URL;
