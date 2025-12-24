"use client"

import { motion } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Heart, Leaf, DollarSign, TrendingUp, Clock } from "lucide-react"

interface PreferenceMatrixProps {
  scores: {
    satisfaction: number
    dietary: number
    price: number
  }
  hasData?: boolean
}

export function PreferenceMatrix({ scores, hasData = true }: PreferenceMatrixProps) {
  const metrics = [
    {
      label: "팀 만족도",
      value: scores.satisfaction,
      icon: Heart,
      color: "text-primary",
      bgColor: "bg-primary",
    },
    {
      label: "식이 호환성",
      value: scores.dietary,
      icon: Leaf,
      color: "text-accent",
      bgColor: "bg-accent",
    },
    {
      label: "가격 점수",
      value: scores.price,
      icon: DollarSign,
      color: "text-chart-4",
      bgColor: "bg-chart-4",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl border border-border p-6 h-full flex flex-col"
    >
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">선호도 분석</h3>
      </div>

      {hasData ? (
        <div className="space-y-5 flex-1">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-sm text-foreground">{metric.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{metric.value}%</span>
              </div>
              <div className="relative">
                <Progress value={metric.value} className="h-2 bg-muted" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                  className={`absolute top-0 left-0 h-2 rounded-full ${metric.bgColor} shimmer`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center flex-1">
          <Clock className="w-10 h-10 text-muted-foreground/30 mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">데이터 수집 중...</p>
          <p className="text-xs text-muted-foreground/70 mt-1">투표가 진행되면 분석이 시작됩니다</p>
        </div>
      )}
    </motion.div>
  )
}
