import type { CVAnalysis } from "@/lib/ai/cv/schema"

const STATUS_LABEL = { met: "✅ Met", partial: "🟡 Partial", missing: "❌ Missing" } as const

const list = (items: string[]) => (items.length ? items.map((item) => `- ${item}`).join("\n") : "- None")

// Plain Markdown version of the analysis, for download.
export function buildMarkdownReport(analysis: CVAnalysis) {
  const b = analysis.scoreBreakdown
  const sections = [
    `# CV Analysis${analysis.targetRole ? `: ${analysis.targetRole}` : ""}`,
    analysis.candidateName ? `**Candidate:** ${analysis.candidateName}` : "",
    `**Match score:** ${analysis.matchScore}/100`,
    analysis.summary,
    `## Score breakdown
| Area | Score |
| --- | --- |
| Requirements coverage | ${b.technicalSkills} |
| Experience | ${b.experience} |
| ATS keywords | ${b.keywords} |
| Education | ${b.education} |
| Soft skills | ${b.softSkills} |`,
    `## Strengths\n${list(analysis.strengths)}`,
    `## Requirements\n${analysis.requirementMatches
      .map((r) => `- ${STATUS_LABEL[r.status]} **${r.requirement}** (${r.importance === "must" ? "must-have" : "nice-to-have"})${r.evidence ? ` — ${r.evidence}` : ""}`)
      .join("\n") || "- None"}`,
    `## Experience\n${analysis.experience.summary}`,
    `## ATS keywords\n**Found:** ${analysis.keywords.present.join(", ") || "none"}\n\n**Missing:** ${analysis.keywords.missing.join(", ") || "none"}`,
    `## Improvements\n${analysis.improvements
      .map((i, n) => `${n + 1}. **${i.title}** (${i.priority} priority, ${i.section}) — ${i.detail}`)
      .join("\n")}`,
    analysis.interviewQuestions.length
      ? `## Interview preparation\n${analysis.interviewQuestions.map((q, n) => `${n + 1}. **${q.question}**\n   ${q.tip}`).join("\n")}`
      : "",
    analysis.generatedEmail.body
      ? `## Application email\n**Subject:** ${analysis.generatedEmail.subject}\n\n${analysis.generatedEmail.body}`
      : "",
  ]
  return sections.filter(Boolean).join("\n\n") + "\n"
}

export function downloadTextFile(filename: string, content: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
