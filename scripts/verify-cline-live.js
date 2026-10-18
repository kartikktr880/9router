// Live E2E verification: read stored cline credentials from data.sqlite, refresh via the
// NEW JSON-camelCase handler, then forward a minimal chat completion to api.cline.bot.
// Secrets are redacted in all output.
import Database from "better-sqlite3";
import path from "path";

const dbPath = process.env.DATA_DIR ? path.join(process.env.DATA_DIR, "db/data.sqlite") : path.resolve("data/db/data.sqlite");
const db = new Database(dbPath, { readonly: true });
const row = db.prepare("SELECT * FROM providerConnections WHERE provider = 'cline' AND isActive = 1").get();
db.close();
if (!row) { console.error("No active cline connection found"); process.exit(1); }

const creds = JSON.parse(row.data);
const redact = (t) => !t ? "<empty>" : `${String(t).slice(0, 12)}...${String(t).slice(-6)} (len=${String(t).length})`;

console.log("=== 1. STORED CREDENTIALS (providerConnections id=" + row.id + ") ===");
console.log("accessToken:", redact(creds.accessToken));
console.log("refreshToken:", redact(creds.refreshToken));
console.log("expiresAt:", creds.expiresAt, "| now:", new Date().toISOString());
console.log("expired:", creds.expiresAt ? new Date(creds.expiresAt) < new Date() : "unknown");
console.log("stored lastError:", creds.lastError || "<none>", "| errorCode:", creds.errorCode || "<none>");

console.log("\n=== 2. REFRESH via new handler (JSON camelCase) ===");
const { refreshClineToken } = await import("../open-sse/services/tokenRefresh.js");
const log = {
  info: (tag, msg, d) => console.log(`[INFO ${tag}] ${msg}`, d ? JSON.stringify(d) : ""),
  warn: (tag, msg) => console.log(`[WARN ${tag}] ${msg}`),
  error: (tag, msg, d) => console.log(`[ERROR ${tag}] ${msg}`, d ? JSON.stringify(d) : ""),
};
const refreshed = await refreshClineToken(creds.refreshToken, log);
if (!refreshed?.accessToken) {
  console.error("REFRESH FAILED — stored refresh token may be revoked; re-authenticate Cline in the dashboard.");
  process.exit(2);
}
console.log("NEW accessToken:", redact(refreshed.accessToken));
console.log("NEW refreshToken:", redact(refreshed.refreshToken));
console.log("expiresIn:", refreshed.expiresIn, "s");

console.log("\n=== 3. UPSTREAM experiments (free-tier routing) ===");
const { buildClineHeaders } = await import("../open-sse/shared/clineAuth.js");
const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ACCESS = refreshed.accessToken;

const tryCall = async (label, url, headers, body) => {
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const text = await res.text();
  console.log(`[${label}] HTTP ${res.status} :: ${text.slice(0, 220).replace(/eyJ[\w.-]+/g, "<jwt>")}`);
  return res.ok;
};

// Variant A: exact cline-usage-billing style headers (source=vscode), zai free model
const hA = {
  ...buildClineHeaders(ACCESS, { "Content-Type": "application/json", Accept: "application/json" }),
  "X-CLIENT-TYPE": "cline-vscode",
  "X-PLATFORM": "vscode",
  "X-Task-ID": uuid(),
};
await tryCall("A zai/glm-5.3-flash cline-vscode", "https://api.cline.bot/api/v1/chat/completions", hA, {
  model: "zai/glm-5.3-flash", messages: [{ role: "user", content: "Say OK" }], max_tokens: 8, stream: false,
});

// Variant B: recommended-models catalog — dump fully
{
  const res = await fetch("https://api.cline.bot/api/v1/ai/cline/recommended-models", { headers: hA });
  const text = await res.text();
  console.log(`[B recommended-models] HTTP ${res.status}`);
  console.log(text.replace(/eyJ[\w.-]+/g, "<jwt>"));
}

// Variant D: definitive live matrix — is zai/glm-5.3-flash free-eligible in ANY form?
const uuidV = uuid();
const extHeaders = (modelId) => ({
  ...buildClineHeaders(ACCESS, { "Content-Type": "application/json", Accept: "application/json" }),
  "X-CLIENT-TYPE": "cline-vscode",
  "X-PLATFORM": "vscode",
  "X-Task-ID": uuidV,
});
const extBody = (model, extra = {}) => ({
  model,
  messages: [
    { role: "system", content: "You are a helpful coding assistant." },
    { role: "user", content: "Reply with exactly: OK" },
  ],
  stream: true,
  reasoning_effort: "high",
  max_completion_tokens: 2048,
  ...extra,
});
const matrix = [
  ["zai/glm-5.3-flash (authentic ext payload)", "zai/glm-5.3-flash"],
  ["z-ai/glm-5.3-flash (alias rule)", "z-ai/glm-5.3-flash"],
  ["kwaipilot/kat-coder-pro (static fallback FREE)", "kwaipilot/kat-coder-pro"],
  ["cline-free/glm-5.3-flash (probe)", "cline-free/glm-5.3-flash"],
  ["cline-free/mimo-v2.6-flash (control)", "cline-free/mimo-v2.6-flash"],
];
for (const [label, model] of matrix) {
  const res = await fetch("https://api.cline.bot/api/v1/chat/completions", {
    method: "POST", headers: extHeaders(model), body: JSON.stringify(extBody(model)),
  });
  const text = await res.text();
  const summary = text.slice(0, 150).replace(/eyJ[\w.-]+/g, "<jwt>").replace(/\n/g, " ");
  console.log(`[${label}] HTTP ${res.status} :: ${summary}`);
  if (res.ok) { console.log(`\n✅ HTTP 200 via ${model}`); process.exit(0); }
}
console.error("\n❌ None of the variants returned 200");
process.exit(3);


