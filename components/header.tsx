"use client"

import { useRouter } from "next/navigation"
import { Utensils, LogOut, LogIn, UserCog, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
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

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full">
                  <Avatar className="w-9 h-9 border-2 border-primary/50 cursor-pointer hover:border-primary transition-colors">
                    <AvatarImage src={user.avatar || "/professional-smiling-man-headshot.png"} />
                    <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/profile')}
                  className="cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2" />
                  내 프로필
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem
                    onClick={() => router.push('/admin/users')}
                    className="cursor-pointer"
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    사용자 관리
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={onLoginClick}
              className="focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full group"
            >
              <Avatar className="w-9 h-9 border-2 border-border hover:border-primary cursor-pointer transition-all hover:opacity-100 opacity-50 group-hover:scale-105">
                <AvatarFallback className="bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <LogIn className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
