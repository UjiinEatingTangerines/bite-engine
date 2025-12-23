"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiProps {
  isActive: boolean
}

const colors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"]

export function Confetti({ isActive }: ConfettiProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; color: string; delay: number }[]>([])

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => setParticles([]), 3000)
      return () => clearTimeout(timer)
    }
  }, [isActive])

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ y: -20, x: `${particle.x}vw`, opacity: 1, rotate: 0 }}
          animate={{
            y: "100vh",
            rotate: 720,
            opacity: 0,
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.5,
            delay: particle.delay,
            ease: "easeOut",
          }}
          className="fixed top-0 w-3 h-3 rounded-sm z-50 pointer-events-none"
          style={{ backgroundColor: particle.color }}
        />
      ))}
    </AnimatePresence>
  )
}
