import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    Tooltip
  } from "recharts"
  import { AnalysisResult } from "@/types/types"
  
  type AnalysisChartProps = {
    analysis: AnalysisResult;
  }
  
  export function AnalysisChart({ analysis }: AnalysisChartProps) {
    // Calculate percentages for different aspects
    const technicalSkillsScore = analysis.technicalSkills.length / (analysis.technicalSkills.length + analysis.missingSkills.length) * 100
    const softSkillsMatch = analysis.softSkills.length / (analysis.softSkills.length + analysis.missingSkills.filter(skill => !skill.includes('.')).length) * 100
    const overallMatch = analysis.matchScore
    const improvementNeeded = analysis.improvements.length > 0 ? 100 - (100 / (analysis.improvements.length + 1)) : 100
  
    const data = [
      { aspect: 'Technical Skills', score: Math.round(technicalSkillsScore) },
      { aspect: 'Soft Skills', score: Math.round(softSkillsMatch) },
      { aspect: 'Overall Match', score: Math.round(overallMatch) },
      { aspect: 'Profile Completeness', score: Math.round(improvementNeeded) },
    ]
  
    return (
      <div className="mb-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid className="text-gray-300 dark:text-gray-600" />
              <PolarAngleAxis
                dataKey="aspect"
                className="text-sm fill-gray-600 dark:fill-gray-300"
                tick={{ fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="text-sm fill-gray-600 dark:fill-gray-300"
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.4}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload) return null
                  return (
                    <div className="rounded-lg border bg-white dark:bg-gray-800 p-2 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {payload[0].payload.aspect}
                        </span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {payload[0].value}%
                        </span>
                      </div>
                    </div>
                  )
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }