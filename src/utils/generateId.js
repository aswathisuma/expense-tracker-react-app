// crypto.randomUUID() only works on https or localhost.
// The fallback keeps the app working if you open it from a phone via your LAN IP.
export function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
