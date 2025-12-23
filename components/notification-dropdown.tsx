"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Clock, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: "success" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationDropdownProps {
  notifications?: Notification[]
}

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}초 전`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  return `${hours}시간 전`
}

export function NotificationDropdown({ notifications = [] }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning":
        return <Info className="w-4 h-4 text-yellow-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">알림</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                {unreadCount}개 안읽음
              </span>
            )}
          </div>
        </div>

        {notifications.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                      notification.read
                        ? "bg-transparent hover:bg-muted/50"
                        : "bg-accent/10 hover:bg-accent/20"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground mb-1">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {timeAgo(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground mb-1">알림이 없습니다</p>
            <p className="text-xs text-muted-foreground/70">
              새로운 활동이 있으면 알려드릴게요
            </p>
          </div>
        )}

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border">
            <Button variant="ghost" className="w-full text-sm" size="sm">
              모두 읽음으로 표시
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
