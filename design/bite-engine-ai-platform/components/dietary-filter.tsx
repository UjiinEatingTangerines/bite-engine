"use client"

import { motion } from "framer-motion"
import { Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface DietaryFilterProps {
  filters: { id: string; label: string; icon: string }[]
  activeFilters: string[]
  onToggle: (id: string) => void
}

export function DietaryFilter({ filters, activeFilters, onToggle }: DietaryFilterProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">식이 AI 필터</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter.id)
          return (
            <motion.button
              key={filter.id}
              onClick={() => onToggle(filter.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              )}
            >
              <span>{filter.icon}</span>
              <span>{filter.label}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
