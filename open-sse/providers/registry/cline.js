export default {
  id: "cline",
  priority: 80,
  alias: "cl",
  uiAlias: "cl",
  display: {
    name: "Cline",
    icon: "smart_toy",
    color: "#5B9BD5",
    textIcon: "CL",
    website: "https://cline.bot",
    notice: {
      signupUrl: "https://cline.bot",
    },
  },
  category: "oauth",
  transport: {
    baseUrl: "https://api.cline.bot/api/v1/chat/completions",
    headers: {
      "HTTP-Referer": "https://cline.bot",
      "X-Title": "Cline",
    },
    tokenUrl: "https://api.cline.bot/api/v1/auth/token",
    refreshUrl: "https://api.cline.bot/api/v1/auth/refresh",
    auth: {
      combined: true,
      header: "Authorization",
      scheme: "bearer",
      hooks: [
        "clineHeaders",
      ],
    },
  },
  models: [
    // ── Free tier (daily allowance — bypasses Cline Credits balance check) ──
    // Verified live: cline-free/* + stealth/* route via the free quota on
    // POST /api/v1/chat/completions (no alternate URL/headers required).
    { id: "cline-free/mimo-v2.6-flash", name: "Mimo V2.6 Flash (free)" },
    { id: "cline-free/deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash (free)" },
    { id: "cline-free/gemini-3.8-flash", name: "Gemini 3.8 Flash (free)" },
    { id: "cline-free/muse-spark-1.3-contributor", name: "Muse Spark 1.3 Contributor (free)" },
    { id: "stealth/pixel-canary", name: "Pixel Canary (free)" },
    { id: "stealth/space-bunny-alpha", name: "Space Bunny Alpha (free)" },
    // ── Cline Pass (subscription) ──
    { id: "cline-pass/glm-5.3-flash", name: "GLM-5.3 Flash (Pass)" },
    { id: "cline-pass/glm-5.3", name: "GLM-5.3 (Pass)" },
    { id: "cline-pass/deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash (Pass)" },
    { id: "cline-pass/kimi-k3", name: "Kimi K3 (Pass)" },
    // ── Billable (Cline Credits) ──
    // NOTE: zai/glm-5.3-flash appears in some older "Free" tabs of the Cline
    // extension, but its free promotion has ended server-side — it now bills
    // Cline Credits (402 insufficient_credits). Kept listed but NOT free.
    { id: "zai/glm-5.3-flash", name: "GLM-5.3 Flash (credits)" },
    { id: "anthropic/claude-opus-4.7", name: "Claude Opus 4.7" },
    { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6" },
    { id: "anthropic/claude-opus-4.6", name: "Claude Opus 4.6" },
    { id: "openai/gpt-5.3-codex", name: "GPT-5.3 Codex" },
    { id: "openai/gpt-5.4", name: "GPT-5.4" },
    { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro Preview" },
    { id: "google/gemini-3.1-flash-lite-preview", name: "Gemini 3.1 Flash Lite Preview" },
    { id: "kwaipilot/kat-coder-pro", name: "KAT Coder Pro" },
  ],
  oauth: {
    appBaseUrl: "https://app.cline.bot",
    apiBaseUrl: "https://api.cline.bot",
    authorizeUrl: "https://api.cline.bot/api/v1/auth/authorize",
    tokenExchangeUrl: "https://api.cline.bot/api/v1/auth/token",
    refreshUrl: "https://api.cline.bot/api/v1/auth/refresh",
  },
};
