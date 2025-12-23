import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // 레스토랑 데이터 가져오기
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false })

    if (error) throw error

    // 각 레스토랑의 투표 수 계산
    const restaurantsWithVotes = await Promise.all(
      (restaurants || []).map(async (restaurant) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant.id)

        return {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          image: restaurant.image || '/placeholder.svg',
          rating: restaurant.rating,
          distance: restaurant.distance,
          priceRange: restaurant.price_range,
          votes: count || 0,
          totalVoters: 20, // 팀 총 인원수 (나중에 동적으로 계산 가능)
          badges: restaurant.badges as string[],
          dietary: restaurant.dietary as string[],
          activeViewers: [], // 실시간 구현 시 추가
        }
      })
    )

    return NextResponse.json(restaurantsWithVotes)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch restaurants' },
      { status: 500 }
    )
  }
}
