import { NextRequest, NextResponse } from 'next/server'
import {
  searchRestaurants,
  getCuisineFromCategory,
  formatDistance,
  estimatePriceRange,
  generateBadges,
  estimateDietary,
  estimateRating,
} from '@/lib/kakao-local'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { query, companyLat, companyLng, radius } = await request.json()

    // 필수 파라미터 검증
    if (!query || !companyLat || !companyLng) {
      return NextResponse.json(
        { error: 'query, companyLat, companyLng are required' },
        { status: 400 }
      )
    }

    // 카카오 API로 검색
    const places = await searchRestaurants(
      query,
      companyLng,
      companyLat,
      radius || 2000
    )

    if (places.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: '검색 결과가 없습니다.',
      })
    }

    // 기존 레스토랑 이름 조회 (중복 방지)
    const { data: existingRestaurants } = await supabase
      .from('restaurants')
      .select('name')

    const existingNames = new Set(
      existingRestaurants?.map((r) => r.name) || []
    )

    // Supabase에 저장할 데이터 변환
    const restaurantsToInsert = places
      .filter((place) => !existingNames.has(place.place_name)) // 중복 제거
      .map((place, index) => ({
        name: place.place_name,
        cuisine: getCuisineFromCategory(place.category_name),
        image: '/placeholder.svg', // 기본 이미지
        rating: estimateRating(),
        distance: formatDistance(place.distance),
        price_range: estimatePriceRange(place.category_name),
        badges: generateBadges(place.category_name, place.distance, index === 0),
        dietary: estimateDietary(place.category_name),
        location_lat: parseFloat(place.y),
        location_lng: parseFloat(place.x),
      }))

    if (restaurantsToInsert.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: '모든 레스토랑이 이미 등록되어 있습니다.',
      })
    }

    // Supabase에 일괄 저장
    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantsToInsert)
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      totalFound: places.length,
      duplicates: places.length - data.length,
      restaurants: data,
    })
  } catch (error) {
    console.error('Error searching restaurants:', error)
    return NextResponse.json(
      {
        error: 'Failed to search restaurants',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
