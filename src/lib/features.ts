// Central switchboard for which tools are reachable.
// Only the CV analyzer is currently enabled; the other tools keep their code
// but every page and API route that belongs to them is blocked in middleware.

export const HOME_TOOL_PATH = "/tools/resume-analyzer"

// Pages that redirect to the CV analyzer instead of rendering.
export const DISABLED_PAGE_PREFIXES = [
  "/tools/chat-converter",
  "/tools/generate-data",
  "/tools/guide",
  "/dashboard",
  "/test",
]

// API routes that answer 404.
export const DISABLED_API_PREFIXES = [
  "/api/chat-extract",
  "/api/generate",
  "/api/generate-pdf",
  "/api/test",
]

function matchesPrefix(path: string, prefix: string) {
  return path === prefix || path.startsWith(`${prefix}/`)
}

export function isDisabledPage(path: string) {
  return DISABLED_PAGE_PREFIXES.some((prefix) => matchesPrefix(path, prefix))
}

export function isDisabledApi(path: string) {
  return DISABLED_API_PREFIXES.some((prefix) => matchesPrefix(path, prefix))
}
