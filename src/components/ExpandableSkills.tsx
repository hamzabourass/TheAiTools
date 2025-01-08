"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { SkillTag } from "./SkillTag"

interface ExpandableSkillsProps {
  skills: Array<{ name: string; proficiency?: number }>;
  initialCount?: number;
  variant: "technical" | "soft" | "missing";
}

export function ExpandableSkills({ 
  skills, 
  initialCount = 5,
  variant 
}: ExpandableSkillsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasMore = skills.length > initialCount

  const visibleSkills = isExpanded ? skills : skills.slice(0, initialCount)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((skill, index) => (
          <SkillTag key={index} skill={skill} variant={variant} />
        ))}
        <AnimatePresence>
          {isExpanded && hasMore && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2"
            >
              {skills.slice(initialCount).map((skill, index) => (
                <SkillTag 
                  key={index + initialCount} 
                  skill={skill} 
                  variant={variant} 
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          Show {isExpanded ? "Less" : `${skills.length - initialCount} More`}
        </Button>
      )}
    </div>
  )
}