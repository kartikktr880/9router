import pkg from "../../package.json" with { type: "json" };

const APP_VERSION = pkg.version || "0.0.0";

// Cline's upstream API checks client identity (User-Agent / X-Cline-Version) and rejects
// requests that don't look like a recent Cline client. Override with CLINE_CLIENT_VERSION.
const CLINE_CLIENT_VERSION = process.env.CLINE_CLIENT_VERSION || "3.32.2";

export function getClineAccessToken(token) {
  if (typeof token !== "string") return "";
  const trimmed = token.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("workos:") ? trimmed : `workos:${trimmed}`;
}

export function getClineAuthorizationHeader(token) {
  const accessToken = getClineAccessToken(token);
  return accessToken ? `Bearer ${accessToken}` : "";
}

export function buildClineHeaders(token, extraHeaders = {}) {
  const authorization = getClineAuthorizationHeader(token);
  const headers = {
    "HTTP-Referer": "https://cline.bot",
    "X-Title": "Cline",
    "User-Agent": `Cline/${CLINE_CLIENT_VERSION}`,
    "X-Cline-Version": CLINE_CLIENT_VERSION,
    "X-PLATFORM": process.platform || "unknown",
    "X-PLATFORM-VERSION": process.version || "unknown",
    "X-CLIENT-TYPE": "extension",
    "X-CLIENT-VERSION": CLINE_CLIENT_VERSION,
    "X-CORE-VERSION": APP_VERSION,
    "X-IS-MULTIROOT": "false",
    ...extraHeaders,
  };

  if (authorization) {
    headers.Authorization = authorization;
  }

  return headers;
}
