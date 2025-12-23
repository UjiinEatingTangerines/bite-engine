"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Trophy, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { LiveFeed } from "@/components/live-feed"
import { SmartMatchHero } from "@/components/smart-match-hero"
import { PreferenceMatrix } from "@/components/preference-matrix"
import { VoteCounter } from "@/components/vote-counter"
import { DietaryFilter } from "@/components/dietary-filter"
import { RestaurantCard } from "@/components/restaurant-card"
import { MiniMap } from "@/components/mini-map"
import { Confetti } from "@/components/confetti"
import { Button } from "@/components/ui/button"
import {
  restaurants as initialRestaurants,
  voteActivities,
  teamScores,
  dietaryFilters,
  currentUser,
  type Restaurant,
  type VoteActivity,
} from "@/lib/mock-data"

export default function BiteEnginePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [activities, setActivities] = useState<VoteActivity[]>(voteActivities)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [votedRestaurant, setVotedRestaurant] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)

  const sortedRestaurants = useMemo(() => {
    let filtered = [...restaurants]

    if (activeFilters.length > 0) {
      filtered = filtered.filter((r) => {
        return activeFilters.some((filter) => {
          if (filter === "vegan") return r.dietary.some((d) => d.toLowerCase().includes("비건"))
          if (filter === "meat-lover") return r.dietary.includes("육식주의")
          if (filter === "spicy") return r.dietary.includes("매운맛")
          if (filter === "gluten-free") return r.dietary.some((d) => d.toLowerCase().includes("글루텐"))
          if (filter === "no-seafood") return !r.cuisine.toLowerCase().includes("일식")
          return true
        })
      })
    }

    return filtered.sort((a, b) => b.votes - a.votes)
  }, [restaurants, activeFilters])

  const totalVotes = restaurants.reduce((sum, r) => sum + r.votes, 0)
  const leadingRestaurant = sortedRestaurants[0]?.name || ""
  const aiRecommendation = restaurants.find((r) => r.badges.includes("AI 추천")) || restaurants[0]

  const handleVote = (id: string) => {
    if (votedRestaurant === id) return

    setRestaurants((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, votes: r.votes + 1 }
        }
        if (r.id === votedRestaurant) {
          return { ...r, votes: Math.max(0, r.votes - 1) }
        }
        return r
      }),
    )

    const restaurant = restaurants.find((r) => r.id === id)
    if (restaurant) {
      const newActivity: VoteActivity = {
        id: String(Date.now()),
        user: currentUser.name,
        avatar: "/professional-smiling-man-headshot.png",
        action: votedRestaurant ? "로 투표를 변경했습니다" : "에 투표했습니다",
        restaurant: restaurant.name,
        timestamp: new Date(),
      }
      setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
    }

    setVotedRestaurant(id)
  }

  const handleFilterToggle = (id: string) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleFinalize = () => {
    setIsFinalized(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Confetti isActive={showConfetti} />
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Smart Match Hero */}
            <SmartMatchHero user={currentUser} recommendation={aiRecommendation} onVote={handleVote} />

            {/* Bento Grid - Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreferenceMatrix scores={teamScores} />
              <VoteCounter totalVotes={totalVotes} />
              <MiniMap topRestaurants={sortedRestaurants.slice(0, 3)} />
            </div>

            {/* Dietary Filter */}
            <DietaryFilter filters={dietaryFilters} activeFilters={activeFilters} onToggle={handleFilterToggle} />

            {/* Finalize Button */}
            {!isFinalized && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <Button
                  onClick={handleFinalize}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  투표 마감하기
                </Button>
              </motion.div>
            )}

            {/* Winner Announcement */}
            <AnimatePresence>
              {isFinalized && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl border border-primary/30 p-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-8 h-8 text-chart-4" />
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">오늘의 회식 맛집</h2>
                  <p className="text-3xl font-bold text-primary">{leadingRestaurant}</p>
                  <p className="text-muted-foreground mt-2">오후 7시 예약 완료</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Restaurant Grid */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">전체 맛집 목록</h3>
              <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {sortedRestaurants.map((restaurant, index) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onVote={handleVote}
                        hasVoted={votedRestaurant === restaurant.id}
                        rank={index + 1}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>

              {sortedRestaurants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">선택한 식이 필터에 맞는 맛집이 없습니다</div>
              )}
            </div>
          </div>

          {/* Sidebar - Live Feed */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LiveFeed activities={activities} leadingRestaurant={leadingRestaurant} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
