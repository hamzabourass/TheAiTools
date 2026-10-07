import type { RequirementMatch } from "./schema"

// How much each dimension contributes to the overall match score.
export const SCORE_WEIGHTS = {
  technicalSkills: 0.35,
  experience: 0.3,
  keywords: 0.15,
  education: 0.1,
  softSkills: 0.1,
} as const

export type ScoreBreakdown = Record<keyof typeof SCORE_WEIGHTS, number>

const IMPORTANCE_WEIGHT = { must: 2, nice: 1 } as const
const STATUS_CREDIT = { met: 1, partial: 0.5, missing: 0 } as const

export const clampScore = (value: number) =>
  Math.max(0, Math.min(100, Math.round(Number.isFinite(value) ? value : 0)))

// Lowercase, strip accents and punctuation (keeping + and # for C++, C#), collapse spaces.
export function normalizeText(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .trim()
}

// Whole-word keyword check against already-normalized CV text.
// Also accepts joined spellings ("node.js" vs "NodeJS") and simple plurals ("API" vs "APIs").
export function cvContainsKeyword(normalizedCv: string, keyword: string) {
  const normalizedKeyword = normalizeText(keyword)
  if (!normalizedKeyword) return false

  const haystack = ` ${normalizedCv} `
  const variants = new Set([normalizedKeyword, `${normalizedKeyword}s`])
  if (normalizedKeyword.includes(" ")) {
    variants.add(normalizedKeyword.replace(/ /g, ""))
  }
  return [...variants].some((variant) => haystack.includes(` ${variant} `))
}

export function checkKeywords(cvText: string, keywords: string[]) {
  const normalizedCv = normalizeText(cvText)
  const unique = [...new Map(keywords.map((k) => [normalizeText(k), k.trim()])).entries()]
    .filter(([normalized]) => normalized)
    .map(([, original]) => original)

  const present: string[] = []
  const missing: string[] = []
  for (const keyword of unique) {
    ;(cvContainsKeyword(normalizedCv, keyword) ? present : missing).push(keyword)
  }
  return { present, missing }
}

// Weighted coverage of the job's requirements: must-haves count double, partial matches count half.
export function requirementCoverage(matches: RequirementMatch[]): number | null {
  let possible = 0
  let earned = 0
  for (const match of matches) {
    const weight = IMPORTANCE_WEIGHT[match.importance]
    possible += weight
    earned += weight * STATUS_CREDIT[match.status]
  }
  return possible === 0 ? null : clampScore((earned / possible) * 100)
}

// Experience can't score far above what the years support when the job states a minimum.
export function groundExperienceScore(modelScore: number, relevantYears: number, requiredYears: number | null) {
  const score = clampScore(modelScore)
  if (!requiredYears || requiredYears <= 0) return score
  const ceiling = clampScore((Math.max(0, relevantYears) / requiredYears) * 100 + 20)
  return Math.min(score, ceiling)
}

// Missing hard requirements limit how high the overall score can go.
export function matchScoreCap(matches: RequirementMatch[]) {
  const mustHaves = matches.filter((m) => m.importance === "must")
  const missingMust = mustHaves.filter((m) => m.status === "missing").length
  if (mustHaves.length > 0 && missingMust / mustHaves.length >= 0.5) return 55
  if (missingMust > 0) return 79
  return 100
}

export function overallScore(breakdown: ScoreBreakdown, cap: number) {
  const weighted = (Object.keys(SCORE_WEIGHTS) as (keyof ScoreBreakdown)[]).reduce(
    (sum, key) => sum + breakdown[key] * SCORE_WEIGHTS[key],
    0
  )
  return Math.min(clampScore(weighted), cap)
}
