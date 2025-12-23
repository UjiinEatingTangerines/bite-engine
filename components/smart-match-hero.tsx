"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles, ChevronRight, Star, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Restaurant, currentUser } from "@/lib/mock-data"

interface SmartMatchHeroProps {
  user: typeof currentUser
  recommendation: Restaurant
  onVote: (id: string) => void
}

export function SmartMatchHero({ user, recommendation, onVote }: SmartMatchHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-card to-accent/10 border border-primary/30 p-6"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-primary">스마트 매칭</span>
          <Badge variant="outline" className="ml-auto border-accent/50 text-accent text-xs">
            AI 추천
          </Badge>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2 text-balance">
          {user.name}님, <span className="text-primary">{user.preferences.join(" & ")}</span> 취향과 이전 팀 회식 기록을
          분석한 결과...
        </h2>
        <p className="text-muted-foreground mb-6">오늘의 추천 맛집:</p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
            {recommendation?.image && recommendation.image !== '/placeholder.svg' ? (
              <Image
                src={recommendation.image}
                alt={recommendation?.name || '추천 레스토랑'}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <span className="text-4xl opacity-20">{recommendation?.cuisine?.[0] || '?'}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <Badge className="bg-primary text-primary-foreground">AI 추천</Badge>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-2">{recommendation.name}</h3>
            <p className="text-muted-foreground text-sm mb-3">{recommendation.cuisine} 요리</p>

            <div className="flex flex-wrap gap-3 mb-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Star className="w-4 h-4 text-chart-4 fill-chart-4" />
                <span className="text-foreground font-medium">{recommendation.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{recommendation.distance}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>도보 약 10분</span>
              </div>
              <span className="text-foreground font-medium">{recommendation.priceRange}</span>
            </div>

            <Button
              onClick={() => onVote(recommendation.id)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground group"
            >
              이 맛집에 투표하기
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
