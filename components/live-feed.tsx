"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Activity, TrendingUp, Clock } from "lucide-react"
import type { VoteActivity } from "@/lib/mock-data"

interface LiveFeedProps {
  activities: VoteActivity[]
  leadingRestaurant: string
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}초 전`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  return `${hours}시간 전`
}

export function LiveFeed({ activities, leadingRestaurant }: LiveFeedProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Activity className="w-5 h-5 text-accent" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full pulse-glow" />
        </div>
        <h3 className="font-semibold text-foreground">실시간 피드</h3>
      </div>

      {leadingRestaurant && leadingRestaurant !== "아직 없음" ? (
        <div className="bg-accent/10 rounded-xl p-3 mb-4 border border-accent/20">
          <div className="flex items-center gap-2 text-accent">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{leadingRestaurant}이(가) 1위입니다!</span>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-xl p-3 mb-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">투표 대기 중...</span>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 -mx-2 px-2">
        <AnimatePresence mode="popLayout">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
              >
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activity.avatar && activity.avatar !== '/placeholder.svg' ? activity.avatar : undefined} />
                    <AvatarFallback>{activity.user[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-muted-foreground">님이 </span>
                    <span className="text-primary font-medium">{activity.restaurant}</span>
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {timeAgo(activity.timestamp)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">아직 활동이 없습니다</p>
              <p className="text-xs text-muted-foreground/70 mt-1">첫 투표를 해보세요!</p>
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  )
}
