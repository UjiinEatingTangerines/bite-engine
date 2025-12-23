"use client"

import { motion } from "framer-motion"
import { Star, MapPin, ThumbsUp, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Restaurant } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface RestaurantCardProps {
  restaurant: Restaurant
  onVote: (id: string) => void
  hasVoted: boolean
  rank: number
}

const badgeStyles: Record<string, string> = {
  "AI 추천": "bg-primary/20 text-primary border-primary/30",
  "가성비 최고": "bg-chart-4/20 text-chart-4 border-chart-4/30",
  "사무실 근처": "bg-accent/20 text-accent border-accent/30",
  "백엔드팀 인기": "bg-chart-5/20 text-chart-5 border-chart-5/30",
}

export function RestaurantCard({ restaurant, onVote, hasVoted, rank }: RestaurantCardProps) {
  const votePercentage = (restaurant.votes / restaurant.totalVoters) * 100

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "bg-card rounded-2xl border overflow-hidden group",
        rank === 1 ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border",
      )}
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={restaurant.image || "/placeholder.svg"}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

        {rank <= 3 && (
          <div
            className={cn(
              "absolute top-3 left-3 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
              rank === 1
                ? "bg-chart-4 text-chart-4-foreground"
                : rank === 2
                  ? "bg-muted text-muted-foreground"
                  : "bg-chart-4/50 text-foreground",
            )}
          >
            #{rank}
          </div>
        )}

        {restaurant.activeViewers.length > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <div className="flex -space-x-2">
              <TooltipProvider>
                {restaurant.activeViewers.slice(0, 3).map((viewer) => (
                  <Tooltip key={viewer.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="w-6 h-6 border-2 border-card">
                        <AvatarImage src={viewer.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">{viewer.name[0]}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{viewer.name}님이 보는 중</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
            <span className="text-xs text-foreground bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
              보는 중
            </span>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {restaurant.badges.map((badge) => (
            <Badge
              key={badge}
              variant="outline"
              className={cn("text-xs border", badgeStyles[badge] || "bg-secondary text-secondary-foreground")}
            >
              {badge}
            </Badge>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-foreground">{restaurant.name}</h4>
            <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
          </div>
          <span className="text-lg font-bold text-foreground">{restaurant.priceRange}</span>
        </div>

        <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-chart-4 fill-chart-4" />
            <span className="text-foreground font-medium">{restaurant.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{restaurant.distance}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{restaurant.votes}표</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">투표 현황</span>
            <span className="text-xs font-medium text-foreground">{Math.round(votePercentage)}%</span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${votePercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn("absolute top-0 left-0 h-full rounded-full", rank === 1 ? "bg-primary" : "bg-accent")}
            />
            <div className="absolute inset-0 shimmer" />
          </div>
        </div>

        <Button
          onClick={() => onVote(restaurant.id)}
          variant={hasVoted ? "secondary" : "default"}
          className={cn("w-full", hasVoted && "bg-accent/20 text-accent hover:bg-accent/30")}
        >
          <ThumbsUp className={cn("w-4 h-4 mr-2", hasVoted && "fill-current")} />
          {hasVoted ? "투표 완료" : "투표하기"}
        </Button>
      </div>
    </motion.div>
  )
}
