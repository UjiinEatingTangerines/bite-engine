"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Map, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Restaurant } from "@/lib/mock-data"

interface MiniMapProps {
  topRestaurants: Restaurant[]
}

export function MiniMap({ topRestaurants }: MiniMapProps) {
  const [isOpen, setIsOpen] = useState(false)
  const hasData = topRestaurants.length > 0

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">TOP 3 위치</h3>
        </div>
        {hasData && (
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-xs">
            지도 {isOpen ? "숨기기" : "보기"}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative w-full h-48 bg-secondary rounded-xl overflow-hidden mb-3">
              <div className="absolute inset-0 bg-[url('/minimal-street-map-dark-theme.jpg')] bg-cover bg-center opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/50" />

              {/* Office marker */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-foreground rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-card rounded-full" />
                </div>
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-foreground whitespace-nowrap">
                  사무실
                </span>
              </div>

              {/* Restaurant markers */}
              {topRestaurants.map((restaurant, index) => {
                const positions = [
                  { top: "30%", left: "70%" },
                  { top: "60%", left: "25%" },
                  { top: "75%", left: "65%" },
                ]
                return (
                  <motion.div
                    key={restaurant.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="absolute"
                    style={positions[index]}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === 1
                            ? "bg-accent text-accent-foreground"
                            : "bg-chart-4 text-background"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="space-y-2">
              {topRestaurants.map((restaurant, index) => (
                <div key={restaurant.id} className="flex items-center gap-2 text-sm">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                      index === 0
                        ? "bg-primary/20 text-primary"
                        : index === 1
                          ? "bg-accent/20 text-accent"
                          : "bg-chart-4/20 text-chart-4"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-foreground">{restaurant.name}</span>
                  <span className="text-muted-foreground ml-auto flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {restaurant.distance}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && hasData && (
        <div className="flex items-center gap-2">
          {topRestaurants.slice(0, 3).map((restaurant, index) => (
            <div
              key={restaurant.id}
              className={`flex-1 px-2 py-1.5 rounded-lg text-center text-xs truncate ${
                index === 0
                  ? "bg-primary/20 text-primary"
                  : index === 1
                    ? "bg-accent/20 text-accent"
                    : "bg-chart-4/20 text-chart-4"
              }`}
            >
              {restaurant.name.split(" ")[0]}
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="w-10 h-10 text-muted-foreground/30 mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">위치 정보 준비 중</p>
          <p className="text-xs text-muted-foreground/70 mt-1">레스토랑이 추가되면 표시됩니다</p>
        </div>
      )}
    </div>
  )
}
