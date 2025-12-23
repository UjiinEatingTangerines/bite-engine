# 레스토랑 정보 실시간 수집 가이드

## 🎯 추천 방법 요약

| 방법 | 난이도 | 비용 | 데이터 품질 | 실시간성 | 추천도 |
|------|--------|------|------------|----------|---------|
| **카카오 로컬 API** | ⭐⭐ | 무료 | ⭐⭐⭐⭐⭐ | 실시간 | ✅ **최고 추천** |
| 네이버 검색 API | ⭐⭐ | 무료 | ⭐⭐⭐⭐ | 실시간 | ✅ 추천 |
| Google Places API | ⭐⭐⭐ | 유료 | ⭐⭐⭐⭐⭐ | 실시간 | 글로벌용 |
| 크롤링 (네이버/카카오) | ⭐⭐⭐⭐ | 무료 | ⭐⭐⭐ | 느림 | ⚠️ 법적 리스크 |
| 수동 입력 | ⭐ | 무료 | ⭐⭐⭐⭐⭐ | 수동 | 소규모용 |

---

## 🥇 방법 1: 카카오 로컬 API (최고 추천)

### 장점
- ✅ **무료** (하루 30만건 호출 가능)
- ✅ **한국 맛집 정보 최강** (카카오맵 데이터)
- ✅ **풍부한 정보**: 평점, 리뷰 수, 카테고리, 영업시간, 사진
- ✅ **법적으로 안전** (공식 API)
- ✅ **간단한 구현**

### 구현 방법

#### 1단계: 카카오 개발자 계정 생성

1. https://developers.kakao.com 접속
2. "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름: "BiteEngine"
4. REST API 키 복사

#### 2단계: 환경 변수 설정

```bash
# .env.local에 추가
KAKAO_REST_API_KEY=your_kakao_api_key
```

#### 3단계: API 유틸리티 생성

```typescript
// lib/kakao-local.ts
interface KakaoPlace {
  place_name: string
  category_name: string
  phone: string
  address_name: string
  road_address_name: string
  x: string // 경도
  y: string // 위도
  place_url: string
  distance: string
}

export async function searchRestaurants(
  query: string,
  x: number, // 회사 경도
  y: number, // 회사 위도
  radius: number = 2000 // 2km
) {
  const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
  url.searchParams.append('query', query)
  url.searchParams.append('category_group_code', 'FD6') // 음식점 카테고리
  url.searchParams.append('x', x.toString())
  url.searchParams.append('y', y.toString())
  url.searchParams.append('radius', radius.toString())
  url.searchParams.append('sort', 'distance') // 거리순 정렬

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    },
  })

  const data = await response.json()
  return data.documents as KakaoPlace[]
}

// 카테고리별 태그 매핑
export function getCuisineFromCategory(category: string): string {
  if (category.includes('일식')) return '일식'
  if (category.includes('중식')) return '중식'
  if (category.includes('한식')) return '한식'
  if (category.includes('양식')) return '양식'
  if (category.includes('카페')) return '카페'
  if (category.includes('치킨')) return '치킨'
  if (category.includes('피자')) return '피자'
  return '기타'
}

// 거리 계산 (미터 → km)
export function formatDistance(meters: string): string {
  const m = parseInt(meters)
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

// 가격대 추정 (카테고리 기반)
export function estimatePriceRange(category: string): string {
  if (category.includes('고급') || category.includes('일식') || category.includes('양식')) {
    return '$$$'
  }
  if (category.includes('뷔페') || category.includes('중식')) {
    return '$$'
  }
  return '$'
}
```

#### 4단계: API 라우트 생성

```typescript
// app/api/search-restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { searchRestaurants, getCuisineFromCategory, formatDistance, estimatePriceRange } from '@/lib/kakao-local'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { query, companyLat, companyLng } = await request.json()

    // 카카오 API로 검색
    const places = await searchRestaurants(query, companyLng, companyLat)

    // Supabase에 저장
    const restaurantsToInsert = places.map(place => ({
      name: place.place_name,
      cuisine: getCuisineFromCategory(place.category_name),
      image: '/placeholder.svg', // 기본 이미지
      rating: 4.0 + Math.random(), // 실제로는 리뷰 API 호출
      distance: formatDistance(place.distance),
      price_range: estimatePriceRange(place.category_name),
      badges: ['신규'],
      dietary: [],
      location_lat: parseFloat(place.y),
      location_lng: parseFloat(place.x),
    }))

    const { data, error } = await supabase
      .from('restaurants')
      .insert(restaurantsToInsert)
      .select()

    if (error) throw error

    return NextResponse.json({ success: true, count: data.length, restaurants: data })
  } catch (error) {
    console.error('Error searching restaurants:', error)
    return NextResponse.json({ error: 'Failed to search restaurants' }, { status: 500 })
  }
}
```

#### 5단계: 관리자 페이지 생성

```typescript
// app/admin/page.tsx
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function AdminPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // 회사 위치 (예: 강남역)
  const COMPANY_LAT = 37.4979
  const COMPANY_LNG = 127.0276

  const handleSearch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/search-restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          companyLat: COMPANY_LAT,
          companyLng: COMPANY_LNG,
        }),
      })

      const data = await response.json()
      alert(`${data.count}개 레스토랑 추가 완료!`)
      setQuery('')
    } catch (error) {
      alert('검색 실패')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">레스토랑 자동 추가</h1>

      <div className="flex gap-4">
        <Input
          placeholder="검색어 (예: 강남역 맛집, 일식)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '검색 중...' : '검색 및 추가'}
        </Button>
      </div>

      <div className="mt-8 text-sm text-muted-foreground">
        <p>💡 팁:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>"강남역 일식" - 강남역 근처 일식당</li>
          <li>"삼성역 맛집" - 삼성역 근처 전체</li>
          <li>"회식 추천" - 회식하기 좋은 곳</li>
        </ul>
      </div>
    </div>
  )
}
```

---

## 🥈 방법 2: 네이버 검색 API

### 장점
- ✅ 무료 (하루 25,000건)
- ✅ 네이버 플레이스 데이터
- ✅ 리뷰, 블로그 정보 풍부

### 구현

```typescript
// lib/naver-search.ts
export async function searchNaverPlaces(query: string) {
  const CLIENT_ID = process.env.NAVER_CLIENT_ID
  const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET

  const url = new URL('https://openapi.naver.com/v1/search/local.json')
  url.searchParams.append('query', query)
  url.searchParams.append('display', '20')
  url.searchParams.append('sort', 'random')

  const response = await fetch(url.toString(), {
    headers: {
      'X-Naver-Client-Id': CLIENT_ID!,
      'X-Naver-Client-Secret': CLIENT_SECRET!,
    },
  })

  const data = await response.json()
  return data.items
}
```

---

## 🥉 방법 3: Google Places API

### 장점
- ✅ 전 세계 데이터
- ✅ 사진, 리뷰 품질 최고
- ✅ 영업시간, 혼잡도 등 상세 정보

### 단점
- ❌ 유료 (월 200달러 크레딧 후 과금)
- ❌ 한국 데이터는 카카오/네이버가 더 정확

### 구현

```typescript
// lib/google-places.ts
export async function searchGooglePlaces(
  location: { lat: number; lng: number },
  radius: number = 2000
) {
  const API_KEY = process.env.GOOGLE_PLACES_API_KEY

  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  url.searchParams.append('location', `${location.lat},${location.lng}`)
  url.searchParams.append('radius', radius.toString())
  url.searchParams.append('type', 'restaurant')
  url.searchParams.append('key', API_KEY!)

  const response = await fetch(url.toString())
  const data = await response.json()
  return data.results
}
```

---

## ⚠️ 방법 4: 웹 크롤링 (비추천)

### 문제점
- ❌ **법적 리스크**: robots.txt 위반, 이용약관 위반
- ❌ **유지보수 어려움**: 사이트 구조 변경 시 코드 수정 필요
- ❌ **느린 속도**: API보다 10배 이상 느림
- ❌ **차단 위험**: IP 차단, CAPTCHA

### 크롤링이 필요한 경우

공식 API가 없는 정보만 크롤링:
- 메뉴판 이미지
- 상세한 리뷰 텍스트
- 특정 태그 (예: "데이트하기 좋은", "단체석 있는")

```typescript
// lib/scraper.ts (참고용 - 실제 사용 비추천)
import * as cheerio from 'cheerio'

export async function scrapeNaverPlace(placeId: string) {
  // ⚠️ 법적 검토 필수!
  const url = `https://m.place.naver.com/restaurant/${placeId}/home`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0...',
    },
  })

  const html = await response.text()
  const $ = cheerio.load(html)

  // 메뉴 정보 추출
  const menus = $('.menu_item').map((i, el) => ({
    name: $(el).find('.name').text(),
    price: $(el).find('.price').text(),
  })).get()

  return { menus }
}
```

---

## 🤖 방법 5: AI 태그 자동 생성

카카오/네이버 API로 기본 정보를 가져온 후, **OpenAI API**로 태그 생성:

```typescript
// lib/ai-tagging.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateRestaurantTags(restaurant: {
  name: string
  category: string
  description?: string
}) {
  const prompt = `
다음 레스토랑의 특징을 분석해서 태그를 생성해줘.

레스토랑 이름: ${restaurant.name}
카테고리: ${restaurant.category}
설명: ${restaurant.description || '없음'}

다음 형식으로 JSON 응답:
{
  "badges": ["AI 추천", "가성비 최고", "사무실 근처", "백엔드팀 인기"] 중 적절한 것들,
  "dietary": ["비건 옵션", "글루텐 프리", "육식주의", "채식주의", "매운맛"] 중 적절한 것들,
  "tags": ["데이트하기 좋은", "단체석 있는", "조용한", "활기찬"] 등 추가 태그
}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content!)
}
```

---

## 📋 최종 추천 아키텍처

### 하이브리드 접근법 (최고 효율)

```
1. 카카오 로컬 API
   ↓ (기본 정보: 이름, 위치, 카테고리, 거리)

2. 네이버 검색 API (선택사항)
   ↓ (리뷰 수, 블로그 리뷰 수)

3. OpenAI API
   ↓ (태그, 식이 정보 자동 생성)

4. Supabase 저장
   ↓ (실시간 데이터)

5. 주기적 업데이트 (Vercel Cron)
   ↓ (하루 1회 평점, 리뷰 수 갱신)
```

### 구현 예시

```typescript
// app/api/auto-import/route.ts
import { searchRestaurants } from '@/lib/kakao-local'
import { generateRestaurantTags } from '@/lib/ai-tagging'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { area, keywords } = await request.json()

  // 1. 카카오 API로 레스토랑 검색
  const places = await searchRestaurants(keywords, area.lng, area.lat)

  // 2. 각 레스토랑에 AI 태그 추가
  const enrichedRestaurants = await Promise.all(
    places.map(async (place) => {
      const tags = await generateRestaurantTags({
        name: place.place_name,
        category: place.category_name,
      })

      return {
        name: place.place_name,
        cuisine: getCuisineFromCategory(place.category_name),
        rating: 4.0 + Math.random(),
        distance: formatDistance(place.distance),
        price_range: estimatePriceRange(place.category_name),
        badges: tags.badges,
        dietary: tags.dietary,
        location_lat: parseFloat(place.y),
        location_lng: parseFloat(place.x),
      }
    })
  )

  // 3. Supabase에 일괄 저장
  const { data, error } = await supabase
    .from('restaurants')
    .insert(enrichedRestaurants)
    .select()

  return Response.json({ count: data?.length })
}
```

---

## ⚡ 실시간 업데이트 자동화

### Vercel Cron Job (매일 자동 업데이트)

```typescript
// app/api/cron/update-restaurants/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Vercel Cron Secret 검증
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 모든 레스토랑의 최신 정보 갱신
    const { data: restaurants } = await supabase
      .from('restaurants')
      .select('id, name, location_lat, location_lng')

    for (const restaurant of restaurants || []) {
      // 카카오 API로 최신 정보 조회
      const updated = await searchRestaurants(
        restaurant.name,
        restaurant.location_lng,
        restaurant.location_lat,
        100 // 100m 반경
      )

      if (updated.length > 0) {
        await supabase
          .from('restaurants')
          .update({
            // 업데이트할 필드들
            updated_at: new Date().toISOString(),
          })
          .eq('id', restaurant.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/update-restaurants",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 💰 비용 비교 (월간 예상)

| 방법 | 무료 한도 | 초과 시 비용 | 50명 팀 예상 비용 |
|------|-----------|-------------|------------------|
| 카카오 로컬 API | 30만건/일 | - | **$0** |
| 네이버 검색 API | 25,000건/일 | - | **$0** |
| Google Places API | $200 크레딧 | $17/1000건 | $0-50 |
| OpenAI API (태그) | - | $0.15/1M 토큰 | $5-10 |
| **합계** | - | - | **$5-10** |

---

## 🎯 단계별 구현 계획

### Phase 1: 기본 구현 (1-2시간)
1. ✅ 카카오 개발자 계정 생성
2. ✅ 카카오 로컬 API 연동
3. ✅ 관리자 페이지에서 수동 검색

### Phase 2: 자동화 (2-3시간)
1. ✅ OpenAI API 연동 (태그 자동 생성)
2. ✅ 배치 import 기능
3. ✅ 중복 제거 로직

### Phase 3: 고도화 (4-5시간)
1. ✅ Vercel Cron으로 자동 업데이트
2. ✅ 이미지 자동 크롤링 (Supabase Storage)
3. ✅ 리뷰 분석 (감성 분석)

---

제가 추천하는 방법은 **카카오 로컬 API + OpenAI 태그 생성** 조합입니다. 구현해드릴까요?
