"use client"

import { Utensils, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/notification-dropdown"

export function Header() {
  // 샘플 알림 데이터 (실제로는 API에서 가져올 데이터)
  const sampleNotifications = [
    // {
    //   id: "1",
    //   type: "success" as const,
    //   title: "투표가 완료되었습니다",
    //   message: "사쿠라 스시 하우스에 투표하셨습니다",
    //   timestamp: new Date(Date.now() - 300000),
    //   read: false,
    // },
    // {
    //   id: "2",
    //   type: "info" as const,
    //   title: "새로운 레스토랑이 추가되었습니다",
    //   message: "관리자가 3개의 레스토랑을 추가했습니다",
    //   timestamp: new Date(Date.now() - 3600000),
    //   read: true,
    // },
  ]

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Utensils className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full pulse-glow" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BiteEngine</h1>
            <p className="text-xs text-muted-foreground">AI 기반 팀 회식 플랫폼</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationDropdown notifications={sampleNotifications} />
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Avatar className="w-9 h-9 border-2 border-primary/50">
            <AvatarImage src="/professional-smiling-man-headshot.png" />
            <AvatarFallback>H</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
