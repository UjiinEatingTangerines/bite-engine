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
import { useRestaurants } from "@/hooks/use-restaurants"
import { useVoteActivities } from "@/hooks/use-vote-activities"
import {
  teamScores,
  dietaryFilters,
  currentUser,
} from "@/lib/mock-data"

export default function BiteEnginePage() {
  // 실제 데이터 사용
  const { restaurants, loading } = useRestaurants()
  const { activities } = useVoteActivities()

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
  const leadingRestaurant = sortedRestaurants[0]?.name || "아직 없음"
  const aiRecommendation = restaurants.find((r) => r.badges.includes("AI 추천")) || restaurants[0] || null

  const handleVote = async (id: string) => {
    if (votedRestaurant === id) return

    const restaurant = restaurants.find((r) => r.id === id)
    if (!restaurant) return

    try {
      // API를 통해 투표 전송
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.name,
          userName: currentUser.name,
          userAvatar: '/professional-smiling-man-headshot.png',
          restaurantId: id,
          restaurantName: restaurant.name,
        }),
      })

      if (!response.ok) throw new Error('Failed to vote')

      setVotedRestaurant(id)
      // 실시간 구독이 자동으로 데이터를 업데이트합니다
    } catch (error) {
      console.error('Failed to vote:', error)
      alert('투표에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleFilterToggle = (id: string) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleFinalize = () => {
    setIsFinalized(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground">레스토랑 정보를 불러오는 중...</p>
        </div>
      </div>
    )
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
            {aiRecommendation && (
              <SmartMatchHero user={currentUser} recommendation={aiRecommendation} onVote={handleVote} />
            )}

            {/* Bento Grid - Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreferenceMatrix scores={teamScores} hasData={restaurants.length > 0 && totalVotes > 0} />
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
                <div className="text-center py-12">
                  <p className="text-lg text-muted-foreground mb-2">
                    {activeFilters.length > 0
                      ? "선택한 식이 필터에 맞는 맛집이 없습니다"
                      : "등록된 레스토랑이 비어 있습니다"}
                  </p>
                  {restaurants.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      <a href="/admin" className="text-primary hover:underline">/admin</a> 페이지에서 레스토랑을 추가해주세요
                    </p>
                  )}
                </div>
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
