// Client only helpers for the localStorage backed anonymous play key.

const KEY = "onepiece.anonymous_key";

function randomKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

export const getAnonymousKey = () => {
  if (typeof window === "undefined") return "";
  let key = window.localStorage.getItem(KEY);
  if (!key) {
    key = randomKey();
    window.localStorage.setItem(KEY, key);
  }
  return key;
};

export const clearAnonymousKey = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
};
