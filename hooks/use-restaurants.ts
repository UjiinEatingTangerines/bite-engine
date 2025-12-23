import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Restaurant } from '@/lib/mock-data'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurants()

    // 실시간 구독 (투표 변경 시 자동 업데이트)
    try {
      const channel = supabase
        .channel('votes-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'votes' },
          () => {
            fetchRestaurants()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (err) {
      console.error('Error setting up realtime subscription:', err)
      return () => {} // 에러 시 빈 cleanup 함수 반환
    }
  }, [])

  async function fetchRestaurants() {
    try {
      const response = await fetch('/api/restaurants')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setRestaurants(data || [])
      setError(null)
    } catch (err) {
      // 에러가 발생해도 빈 배열로 설정하여 UI가 깨지지 않도록 함
      setRestaurants([])
      setError('Failed to fetch restaurants')
      console.error('Error fetching restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  return { restaurants, loading, error, refetch: fetchRestaurants }
}
