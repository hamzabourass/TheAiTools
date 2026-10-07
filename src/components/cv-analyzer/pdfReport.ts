import type { jsPDF } from "jspdf"
import type { CVAnalysis } from "@/lib/ai/cv/schema"
import type { Dictionary, Lang } from "@/lib/i18n/dictionaries"

// PDF report drawn directly with jsPDF primitives (no HTML rendering).
// Units are millimetres on an A4 portrait page. The application email is deliberately left out.

type RGB = [number, number, number]

const COLOR = {
  primary: [79, 70, 229] as RGB,
  violet: [124, 58, 237] as RGB,
  text: [15, 23, 42] as RGB,
  muted: [100, 116, 139] as RGB,
  border: [226, 232, 240] as RGB,
  soft: [248, 250, 252] as RGB,
  track: [237, 240, 245] as RGB,
  emerald: [16, 185, 129] as RGB,
  sky: [14, 165, 233] as RGB,
  amber: [245, 158, 11] as RGB,
  rose: [244, 63, 94] as RGB,
  white: [255, 255, 255] as RGB,
}

const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 16
const CONTENT_W = PAGE_W - MARGIN * 2
const BOTTOM_LIMIT = PAGE_H - 20
const PT_TO_MM = 0.3528

const WEIGHTS = { technicalSkills: 0.35, experience: 0.3, keywords: 0.15, education: 0.1, softSkills: 0.1 } as const

const tint = (c: RGB, amount: number): RGB => c.map((v) => Math.round(v + (255 - v) * amount)) as RGB

function scoreColor(score: number): RGB {
  if (score >= 80) return COLOR.emerald
  if (score >= 65) return COLOR.sky
  if (score >= 45) return COLOR.amber
  return COLOR.rose
}

function verdictKey(score: number): keyof Dictionary["results"]["verdicts"] {
  if (score >= 80) return "excellent"
  if (score >= 65) return "good"
  if (score >= 45) return "partial"
  return "low"
}

const PRIORITY_COLOR = { high: COLOR.rose, medium: COLOR.amber, low: COLOR.sky } as const
const STATUS_COLOR = { met: COLOR.emerald, partial: COLOR.amber, missing: COLOR.rose } as const

// The built-in Helvetica font only covers Latin-1 / WinAnsi; map or drop anything else.
const REPLACEMENTS: Record<string, string> = {
  "→": "->", "←": "<-", "≤": "<=", "≥": ">=", "≠": "!=",
  "✓": "", "✔": "", "•": "•", " ": " ", " ": " ", " ": " ",
  "‑": "-", "−": "-",
}
const WINANSI_EXTRAS = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ"

export function cleanText(value: string) {
  return Array.from(value ?? "")
    .map((ch) => {
      if (ch in REPLACEMENTS) return REPLACEMENTS[ch]
      const code = ch.codePointAt(0) ?? 0
      if (ch === "\n" || (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WINANSI_EXTRAS.includes(ch)) {
        return ch
      }
      return ""
    })
    .join("")
    .replace(/[ \t]+/g, " ")
    .trim()
}

export function buildPdfReport(JsPDF: typeof jsPDF, analysis: CVAnalysis, dict: Dictionary, lang: Lang) {
  const doc = new JsPDF({ unit: "mm", format: "a4" })
  const t = dict.pdf
  // French typography puts a space before a colon.
  const colon = lang === "fr" ? " : " : ": "
  let y = 0

  /* ---------- low-level helpers ---------- */

  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2])
  const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2])
  const color = (c: RGB) => doc.setTextColor(c[0], c[1], c[2])
  const font = (size: number, style: "normal" | "bold" | "italic" = "normal") => {
    doc.setFont("helvetica", style)
    doc.setFontSize(size)
  }
  const lineHeight = (size: number) => size * PT_TO_MM * 1.35

  const wrap = (text: string, width: number, size: number, style: "normal" | "bold" | "italic" = "normal"): string[] => {
    font(size, style)
    return doc.splitTextToSize(cleanText(text), width) as string[]
  }

  // Draws text with its top at `top`; returns the height used.
  const writeLines = (lines: string[], x: number, top: number, size: number, c: RGB, style: "normal" | "bold" | "italic" = "normal") => {
    font(size, style)
    color(c)
    lines.forEach((line, i) => doc.text(line, x, top + i * lineHeight(size), { baseline: "top" }))
    return lines.length * lineHeight(size)
  }

  const label = (text: string, x: number, top: number, size: number, c: RGB, style: "normal" | "bold" = "normal", align: "left" | "right" | "center" = "left") => {
    font(size, style)
    color(c)
    doc.text(cleanText(text), x, top, { baseline: "top", align })
  }

  const polygon = (points: [number, number][], c: RGB) => {
    if (points.length < 3) return
    fill(c)
    const deltas = points.slice(1).map((p, i) => [p[0] - points[i][0], p[1] - points[i][1]])
    doc.lines(deltas, points[0][0], points[0][1], [1, 1], "F", true)
  }

  // Filled ring segment, angles in degrees, 0 = top, clockwise.
  const ringSegment = (cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number, c: RGB) => {
    if (endDeg - startDeg < 0.2) return
    const steps = Math.max(2, Math.ceil((endDeg - startDeg) / 4))
    const point = (r: number, deg: number): [number, number] => {
      const rad = ((deg - 90) * Math.PI) / 180
      return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
    }
    const outer: [number, number][] = []
    const inner: [number, number][] = []
    for (let i = 0; i <= steps; i++) {
      const deg = startDeg + ((endDeg - startDeg) * i) / steps
      outer.push(point(rOuter, deg))
      inner.push(point(rInner, deg))
    }
    polygon([...outer, ...inner.reverse()], c)
  }

  const pill = (text: string, x: number, top: number, c: RGB, size = 7.5) => {
    font(size, "bold")
    const clean = cleanText(text)
    const w = doc.getTextWidth(clean) + 4
    const h = size * PT_TO_MM + 2.4
    fill(tint(c, 0.85))
    doc.roundedRect(x, top, w, h, h / 2, h / 2, "F")
    color(c)
    doc.text(clean, x + 2, top + 1.2, { baseline: "top" })
    return w
  }

  const bar = (x: number, top: number, w: number, h: number, value: number, c: RGB) => {
    fill(COLOR.track)
    doc.roundedRect(x, top, w, h, h / 2, h / 2, "F")
    const filled = Math.max(0, Math.min(1, value / 100)) * w
    if (filled > 0.5) {
      fill(c)
      doc.roundedRect(x, top, Math.max(filled, h), h, h / 2, h / 2, "F")
    }
  }

  /* ---------- page structure ---------- */

  const drawRunningHeader = () => {
    label("Hire", MARGIN, 9, 10, COLOR.text, "bold")
    font(10, "bold")
    label("Lens", MARGIN + doc.getTextWidth("Hire"), 9, 10, COLOR.primary, "bold")
    label(t.title, PAGE_W - MARGIN, 9.4, 8, COLOR.muted, "normal", "right")
    stroke(COLOR.border)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 15, PAGE_W - MARGIN, 15)
  }

  const newPage = () => {
    doc.addPage()
    drawRunningHeader()
    y = 22
  }

  const ensure = (height: number) => {
    if (y + height > BOTTOM_LIMIT) newPage()
  }

  const section = (title: string, spaceNeeded = 30) => {
    ensure(spaceNeeded)
    y += 4
    label(title, MARGIN, y, 13, COLOR.text, "bold")
    fill(COLOR.primary)
    doc.rect(MARGIN, y + 6.6, 10, 0.9, "F")
    y += 11
  }

  const chips = (items: string[], c: RGB, emptyText: string) => {
    if (!items.length) {
      label(emptyText, MARGIN, y, 9, COLOR.muted)
      y += 6
      return
    }
    const size = 8.5
    const h = 6.2
    let x = MARGIN
    ensure(h + 2)
    for (const item of items) {
      font(size, "bold")
      let text = cleanText(item)
      // Shorten the rare chip that would not fit on a line
      while (doc.getTextWidth(text) + 5 > CONTENT_W && text.length > 4) text = `${text.slice(0, -2)}…`
      const w = doc.getTextWidth(text) + 5
      if (x + w > PAGE_W - MARGIN) {
        x = MARGIN
        y += h + 2
        ensure(h + 2)
      }
      fill(tint(c, 0.86))
      doc.roundedRect(x, y, w, h, 1.6, 1.6, "F")
      color(c)
      doc.text(text, x + 2.5, y + 1.55, { baseline: "top" })
      x += w + 2
    }
    y += h + 4
  }

  /* ---------- cover header ---------- */

  fill(COLOR.primary)
  doc.rect(0, 0, PAGE_W, 34, "F")
  fill(COLOR.violet)
  doc.rect(0, 32, PAGE_W, 2, "F")
  label("HireLens", MARGIN, 10, 20, COLOR.white, "bold")
  label(t.title, MARGIN, 20.5, 10.5, tint(COLOR.primary, 0.75))
  const date = new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" })
  label(t.generatedOn(date), PAGE_W - MARGIN, 12, 8.5, tint(COLOR.primary, 0.75), "normal", "right")

  y = 44
  const roleLines = wrap(analysis.targetRole || t.title, CONTENT_W, 17, "bold")
  y += writeLines(roleLines, MARGIN, y, 17, COLOR.text, "bold") + 1
  const meta = [analysis.seniority, analysis.candidateName ? `${t.candidate}${colon}${analysis.candidateName}` : ""]
    .filter(Boolean)
    .join("  ·  ")
  if (meta) {
    label(meta, MARGIN, y, 9.5, COLOR.muted)
    y += 6
  }
  y += 3

  /* ---------- score card ---------- */

  const score = analysis.matchScore
  const sColor = scoreColor(score)
  const summaryX = MARGIN + 52
  const summaryW = CONTENT_W - 58
  const summaryLines = wrap(analysis.summary, summaryW, 9.5)
  const cardH = Math.max(48, 17 + summaryLines.length * lineHeight(9.5) + 6)

  fill(COLOR.soft)
  stroke(COLOR.border)
  doc.setLineWidth(0.3)
  doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 3, 3, "FD")

  const gx = MARGIN + 25
  const gy = y + cardH / 2
  ringSegment(gx, gy, 18, 13, 0, 360, COLOR.track)
  ringSegment(gx, gy, 18, 13, 0, (360 * score) / 100, sColor)
  label(String(score), gx, gy - 5.2, 22, COLOR.text, "bold", "center")
  label("/ 100", gx, gy + 3.6, 7.5, COLOR.muted, "normal", "center")

  label(t.matchScore.toUpperCase(), summaryX, y + 6, 7.5, COLOR.muted, "bold")
  pill(dict.results.verdicts[verdictKey(score)], summaryX, y + 10.5, sColor, 8)
  writeLines(summaryLines, summaryX, y + 18.5, 9.5, COLOR.text)
  y += cardH + 4

  /* ---------- score breakdown ---------- */

  section(t.breakdown, 60)
  const breakdownRows = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).map((key) => ({
    name: dict.results.breakdown[key],
    weight: WEIGHTS[key],
    value: analysis.scoreBreakdown[key],
  }))
  for (const row of breakdownRows) {
    label(row.name, MARGIN, y, 9.5, COLOR.text, "bold")
    font(9.5, "bold")
    const nameW = doc.getTextWidth(cleanText(row.name))
    label(`${Math.round(row.weight * 100)}% ${t.weight}`, MARGIN + nameW + 2, y + 0.4, 7.5, COLOR.muted)
    bar(MARGIN + 70, y + 0.6, CONTENT_W - 84, 3.6, row.value, scoreColor(row.value))
    label(String(row.value), PAGE_W - MARGIN, y, 9.5, scoreColor(row.value), "bold", "right")
    y += 8
  }
  y += 2

  /* ---------- three mini charts ---------- */

  ensure(50)
  const gap = 5
  const panelW = (CONTENT_W - gap * 2) / 3
  const panelH = 44
  const panelTop = y

  const panel = (index: number, title: string) => {
    const x = MARGIN + index * (panelW + gap)
    fill(COLOR.white)
    stroke(COLOR.border)
    doc.setLineWidth(0.3)
    doc.roundedRect(x, panelTop, panelW, panelH, 2.5, 2.5, "FD")
    label(title, x + 4, panelTop + 4, 8.5, COLOR.text, "bold")
    return x
  }

  const donutWithLegend = (x: number, parts: { name: string; value: number; c: RGB }[]) => {
    const total = parts.reduce((sum, p) => sum + p.value, 0)
    const cx = x + 13
    const cy = panelTop + 26
    ringSegment(cx, cy, 9.5, 6, 0, 360, COLOR.track)
    let start = 0
    for (const part of parts) {
      const sweep = total ? (360 * part.value) / total : 0
      ringSegment(cx, cy, 9.5, 6, start, start + sweep, part.c)
      start += sweep
    }
    const pct = total ? Math.round((parts[0].value / total) * 100) : 0
    label(`${pct}%`, cx, cy - 1.8, 8, COLOR.text, "bold", "center")
    let ly = panelTop + 17
    for (const part of parts) {
      fill(part.c)
      doc.roundedRect(x + 26, ly + 0.5, 2.6, 2.6, 0.6, 0.6, "F")
      label(`${part.name}`, x + 30.5, ly, 7.5, COLOR.muted)
      label(String(part.value), x + panelW - 4, ly, 7.5, COLOR.text, "bold", "right")
      ly += 6
    }
  }

  const reqs = analysis.requirementMatches
  const count = (status: "met" | "partial" | "missing") => reqs.filter((r) => r.status === status).length
  donutWithLegend(panel(0, t.coverage), [
    { name: t.met, value: count("met"), c: COLOR.emerald },
    { name: t.partial, value: count("partial"), c: COLOR.amber },
    { name: t.missing, value: count("missing"), c: COLOR.rose },
  ])

  donutWithLegend(panel(1, t.keywords), [
    { name: t.found, value: analysis.keywords.present.length, c: COLOR.emerald },
    { name: t.missing, value: analysis.keywords.missing.length, c: COLOR.rose },
  ])

  {
    const x = panel(2, t.experience)
    const { relevantYears, requiredYears } = analysis.experience
    const max = Math.max(relevantYears, requiredYears ?? 0, 1) * 1.15
    const barW = panelW - 8
    const rows: { name: string; value: number | null; c: RGB }[] = [
      { name: t.relevant, value: relevantYears, c: COLOR.primary },
      { name: t.required, value: requiredYears, c: COLOR.muted },
    ]
    let ry = panelTop + 13
    for (const row of rows) {
      label(row.name, x + 4, ry, 7.5, COLOR.muted)
      label(row.value != null ? t.years(row.value) : t.notStated, x + panelW - 4, ry, 7.5, COLOR.text, "bold", "right")
      bar(x + 4, ry + 4.5, barW, 3.4, row.value != null ? (row.value / max) * 100 : 0, row.c)
      ry += 13
    }
  }
  y = panelTop + panelH + 4

  /* ---------- strengths ---------- */

  if (analysis.strengths.length) {
    section(t.strengths, 24)
    for (const strength of analysis.strengths) {
      const lines = wrap(strength, CONTENT_W - 6, 9.5)
      ensure(lines.length * lineHeight(9.5) + 2)
      fill(COLOR.emerald)
      doc.circle(MARGIN + 1.3, y + 1.9, 0.9, "F")
      y += writeLines(lines, MARGIN + 5, y, 9.5, COLOR.text) + 2
    }
  }

  /* ---------- requirements table ---------- */

  if (reqs.length) {
    section(t.requirementsAnalysis, 40)
    const cols = [
      { title: t.colRequirement, w: 48 },
      { title: t.colType, w: 25 },
      { title: t.colStatus, w: 24 },
      { title: t.colEvidence, w: CONTENT_W - 97 },
    ]
    const tableHeader = () => {
      fill(COLOR.track)
      doc.rect(MARGIN, y, CONTENT_W, 7, "F")
      let x = MARGIN
      for (const col of cols) {
        label(col.title.toUpperCase(), x + 2.5, y + 2.2, 7, COLOR.muted, "bold")
        x += col.w
      }
      y += 7
    }
    tableHeader()

    const ordered = [...reqs].sort((a, b) => Number(a.importance === "nice") - Number(b.importance === "nice"))
    ordered.forEach((req, index) => {
      const nameLines = wrap(req.requirement, cols[0].w - 5, 8.8, "bold")
      const evidenceLines = req.evidence ? wrap(`"${req.evidence}"`, cols[3].w - 5, 8.3, "italic") : wrap(t.noEvidence, cols[3].w - 5, 8.3, "italic")
      const rowH = Math.max(nameLines.length * lineHeight(8.8), evidenceLines.length * lineHeight(8.3), 5) + 5

      if (y + rowH > BOTTOM_LIMIT) {
        newPage()
        tableHeader()
      }
      if (index % 2 === 1) {
        fill(COLOR.soft)
        doc.rect(MARGIN, y, CONTENT_W, rowH, "F")
      }
      let x = MARGIN
      writeLines(nameLines, x + 2.5, y + 2.5, 8.8, COLOR.text, "bold")
      x += cols[0].w
      label(req.importance === "must" ? t.must : t.nice, x + 2.5, y + 2.7, 8, req.importance === "must" ? COLOR.primary : COLOR.muted, req.importance === "must" ? "bold" : "normal")
      x += cols[1].w
      pill(req.status === "met" ? t.met : req.status === "partial" ? t.partial : t.missing, x + 2.5, y + 2.2, STATUS_COLOR[req.status])
      x += cols[2].w
      writeLines(evidenceLines, x + 2.5, y + 2.5, 8.3, req.evidence ? COLOR.text : COLOR.muted, "italic")
      y += rowH
      stroke(COLOR.border)
      doc.setLineWidth(0.2)
      doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    })
    y += 4
  }

  /* ---------- keywords & skills ---------- */

  section(t.keywords, 30)
  label(t.keywordsMissing, MARGIN, y, 9, COLOR.text, "bold")
  y += 6
  chips(analysis.keywords.missing, COLOR.rose, t.none)
  label(t.keywordsFound, MARGIN, y, 9, COLOR.text, "bold")
  y += 6
  chips(analysis.keywords.present, COLOR.emerald, t.none)

  if (analysis.technicalSkills.length || analysis.softSkills.length) {
    section(t.skillsProfile, 30)
    label(t.technical, MARGIN, y, 9, COLOR.text, "bold")
    y += 6
    chips(analysis.technicalSkills, COLOR.primary, t.none)
    label(t.soft, MARGIN, y, 9, COLOR.text, "bold")
    y += 6
    chips(analysis.softSkills, COLOR.violet, t.none)
  }

  /* ---------- improvement plan ---------- */

  const improvements = [...analysis.improvements].sort(
    (a, b) => ["high", "medium", "low"].indexOf(a.priority) - ["high", "medium", "low"].indexOf(b.priority)
  )
  if (improvements.length) {
    section(t.improvementPlan, 70)

    // Priority distribution chart
    const priorities = ["high", "medium", "low"] as const
    const maxCount = Math.max(1, ...priorities.map((p) => improvements.filter((i) => i.priority === p).length))
    label(t.improvementsByPriority, MARGIN, y, 9, COLOR.text, "bold")
    y += 6
    for (const p of priorities) {
      const n = improvements.filter((i) => i.priority === p).length
      label(t.priority[p], MARGIN, y, 8.5, COLOR.muted)
      bar(MARGIN + 40, y + 0.6, CONTENT_W - 52, 3.4, (n / maxCount) * 100, PRIORITY_COLOR[p])
      label(String(n), PAGE_W - MARGIN, y, 8.5, COLOR.text, "bold", "right")
      y += 6.5
    }
    y += 4

    improvements.forEach((item, index) => {
      const textX = MARGIN + 13
      const textW = CONTENT_W - 17
      const titleLines = wrap(item.title, textW, 10, "bold")
      const detailLines = wrap(item.detail, textW, 9)
      const cardH = 5 + titleLines.length * lineHeight(10) + 6.5 + detailLines.length * lineHeight(9) + 4
      ensure(cardH + 3)

      const c = PRIORITY_COLOR[item.priority]
      fill(COLOR.white)
      stroke(COLOR.border)
      doc.setLineWidth(0.3)
      doc.roundedRect(MARGIN, y, CONTENT_W, cardH, 2.5, 2.5, "FD")
      fill(c)
      doc.rect(MARGIN, y + 2, 1.4, cardH - 4, "F")

      fill(tint(c, 0.85))
      doc.circle(MARGIN + 7.5, y + 7.2, 3.2, "F")
      label(String(index + 1), MARGIN + 7.5, y + 5.6, 9, c, "bold", "center")

      let top = y + 4.5
      top += writeLines(titleLines, textX, top, 10, COLOR.text, "bold") + 1
      const tagW = pill(t.priority[item.priority], textX, top, c, 7)
      if (item.section) label(item.section.toUpperCase(), textX + tagW + 2.5, top + 1.1, 7, COLOR.muted, "bold")
      top += 5.5
      writeLines(detailLines, textX, top, 9, COLOR.text)
      y += cardH + 3
    })
  }

  /* ---------- interview preparation ---------- */

  if (analysis.interviewQuestions.length) {
    section(t.interviewPrep, 30)
    analysis.interviewQuestions.forEach((item, index) => {
      const qLines = wrap(item.question, CONTENT_W - 12, 9.5, "bold")
      const tipLines = wrap(`${t.tip}${colon}${item.tip}`, CONTENT_W - 12, 9)
      const h = qLines.length * lineHeight(9.5) + tipLines.length * lineHeight(9) + 5
      ensure(h)
      pill(`Q${index + 1}`, MARGIN, y - 0.4, COLOR.primary, 7.5)
      y += writeLines(qLines, MARGIN + 12, y, 9.5, COLOR.text, "bold") + 1
      y += writeLines(tipLines, MARGIN + 12, y, 9, COLOR.muted) + 4
    })
  }

  /* ---------- footer on every page ---------- */

  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page)
    stroke(COLOR.border)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, PAGE_H - 13, PAGE_W - MARGIN, PAGE_H - 13)
    label(t.footer, MARGIN, PAGE_H - 10.5, 7.5, COLOR.muted)
    label(t.page(page, pages), PAGE_W - MARGIN, PAGE_H - 10.5, 7.5, COLOR.muted, "normal", "right")
  }

  return doc
}

export function reportFileName(analysis: CVAnalysis) {
  const slug = (analysis.targetRole || "cv")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  return `hirelens-${slug || "report"}.pdf`
}
