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
  }, [])

  async function fetchRestaurants() {
    try {
      const response = await fetch('/api/restaurants')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setRestaurants(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch restaurants')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { restaurants, loading, error, refetch: fetchRestaurants }
}
