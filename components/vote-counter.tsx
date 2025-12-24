"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Clock } from "lucide-react"

interface VoteCounterProps {
  totalVotes: number
  hasData?: boolean
}

export function VoteCounter({ totalVotes, hasData = true }: VoteCounterProps) {
  const [displayVotes, setDisplayVotes] = useState(totalVotes)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (totalVotes !== displayVotes) {
      setIsAnimating(true)
      setTimeout(() => {
        setDisplayVotes(totalVotes)
        setIsAnimating(false)
      }, 150)
    }
  }, [totalVotes, displayVotes])

  const digits = String(displayVotes).padStart(3, "0").split("")

  return (
    <div className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">총 투표 수</h3>
      </div>

      {hasData ? (
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-center gap-1">
            <AnimatePresence mode="popLayout">
              {digits.map((digit, index) => (
                <motion.div
                  key={`${index}-${digit}`}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-14 h-20 bg-secondary rounded-xl flex items-center justify-center border border-border"
                  style={{ perspective: 1000 }}
                >
                  <span className="text-4xl font-mono font-bold text-foreground">{digit}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">총 20명의 팀원 중</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Clock className="w-10 h-10 text-muted-foreground/30 mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">투표 대기 중</p>
          <p className="text-xs text-muted-foreground/70 mt-1">첫 투표를 기다리고 있습니다</p>
        </div>
      )}
    </div>
  )
}
