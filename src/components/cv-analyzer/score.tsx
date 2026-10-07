import { cn } from "@/lib/utils"

export type Verdict = {
  label: string
  text: string // text color
  bar: string // background color for bars
  stroke: string // svg stroke color
  soft: string // soft badge background
}

export function getVerdict(score: number): Verdict {
  if (score >= 80) {
    return { label: "Excellent match", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500", stroke: "stroke-emerald-500", soft: "bg-emerald-500/10" }
  }
  if (score >= 65) {
    return { label: "Good match", text: "text-sky-600 dark:text-sky-400", bar: "bg-sky-500", stroke: "stroke-sky-500", soft: "bg-sky-500/10" }
  }
  if (score >= 45) {
    return { label: "Partial match", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500", stroke: "stroke-amber-500", soft: "bg-amber-500/10" }
  }
  return { label: "Low match", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500", stroke: "stroke-rose-500", soft: "bg-rose-500/10" }
}

export function ScoreRing({ score, size = 148 }: { score: number; size?: number }) {
  const verdict = getVerdict(score)
  const strokeWidth = 12
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(verdict.stroke, "transition-[stroke-dashoffset] duration-1000 ease-out")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums tracking-tight">{score}</span>
        <span className="text-xs font-medium text-muted-foreground">out of 100</span>
      </div>
    </div>
  )
}

export function ScoreBar({ label, value, weight }: { label: string; value: number; weight?: number }) {
  const verdict = getVerdict(value)
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">
          {label}
          {weight != null && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{Math.round(weight * 100)}%</span>}
        </span>
        <span className={cn("font-semibold tabular-nums", verdict.text)}>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700 ease-out", verdict.bar)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
