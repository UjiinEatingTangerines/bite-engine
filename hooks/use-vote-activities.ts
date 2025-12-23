import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { VoteActivity } from '@/lib/mock-data'

export function useVoteActivities() {
  const [activities, setActivities] = useState<VoteActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivities()

    // 실시간 구독 (새 활동 추가 시 자동 업데이트)
    const channel = supabase
      .channel('activities-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vote_activities' },
        (payload) => {
          const newActivity = {
            id: payload.new.id,
            user: payload.new.user_name,
            avatar: payload.new.user_avatar || '/placeholder.svg',
            action: payload.new.action,
            restaurant: payload.new.restaurant_name,
            timestamp: new Date(payload.new.created_at),
          }
          setActivities((prev) => [newActivity, ...prev.slice(0, 9)])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchActivities() {
    try {
      const response = await fetch('/api/activities')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setActivities(data)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
    } finally {
      setLoading(false)
    }
  }

  return { activities, loading }
}
