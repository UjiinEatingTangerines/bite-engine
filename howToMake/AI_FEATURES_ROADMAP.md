# BiteEngine AI 기능 로드맵

> AI 기반 팀 회식 플랫폼에 걸맞는 인공지능 기능 제안서

---

## 📊 현재 구현된 AI 기능

### 1. ✅ 스마트 매칭 (Smart Match)
**위치**: `components/smart-match-hero.tsx`

**현재 기능**:
- 사용자 선호도 기반 추천 표시
- "AI 추천" 배지 시각화
- 사용자 이름, 취향, 이전 회식 기록 분석 메시지

**한계점**:
- ❌ 실제 AI 알고리즘 없음 (하드코딩된 추천)
- ❌ 개인화 로직 부재
- ❌ 학습 메커니즘 없음

---

## 🎯 제안하는 AI 기능 (우선순위별)

---

## Priority 1: 핵심 AI 기능 (즉시 구현 권장)

### 1. 🧠 개인 맞춤형 레스토랑 추천 시스템

#### 기능 설명
사용자의 투표 히스토리, 선호도, 팀 투표 패턴을 분석하여 개인화된 추천 제공

#### 구현 방법

**Option A: 규칙 기반 추천 (간단, 무료)**
```typescript
// lib/ai/recommendation-engine.ts
interface UserProfile {
  userId: string
  voteHistory: string[] // 투표한 레스토랑 ID
  preferences: string[] // 선호 음식 종류
  dietaryRestrictions: string[] // 식이 제한
}

export function calculateRecommendationScore(
  restaurant: Restaurant,
  user: UserProfile,
  teamVoteData: VoteData[]
): number {
  let score = 0

  // 1. 사용자 선호도 매칭 (40%)
  const cuisineMatch = user.preferences.some(p =>
    restaurant.cuisine.toLowerCase().includes(p.toLowerCase())
  )
  if (cuisineMatch) score += 40

  // 2. 식이 제한 호환성 (30%)
  const dietaryCompatible = user.dietaryRestrictions.every(restriction =>
    restaurant.dietary.some(d => d.includes(restriction))
  )
  if (dietaryCompatible) score += 30

  // 3. 팀 인기도 (20%)
  const teamVotes = teamVoteData.filter(v => v.restaurantId === restaurant.id).length
  score += Math.min(teamVotes * 2, 20)

  // 4. 평점 및 거리 (10%)
  score += (restaurant.rating / 5) * 5
  if (parseFloat(restaurant.distance) < 1.0) score += 5

  return score
}

export function getTopRecommendations(
  restaurants: Restaurant[],
  user: UserProfile,
  teamVoteData: VoteData[],
  limit: number = 3
): Restaurant[] {
  return restaurants
    .map(r => ({
      ...r,
      aiScore: calculateRecommendationScore(r, user, teamVoteData)
    }))
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, limit)
}
```

**Option B: AI 기반 추천 (고급, 유료)**
```typescript
// lib/ai/openai-recommendations.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function getAIRecommendation(
  restaurants: Restaurant[],
  user: UserProfile,
  teamHistory: TeamDinnerHistory[]
): Promise<Restaurant> {
  const prompt = `
당신은 팀 회식 레스토랑 추천 AI입니다.

사용자 정보:
- 이름: ${user.name}
- 선호 음식: ${user.preferences.join(', ')}
- 이전 회식: ${user.pastDinners.join(', ')}
- 식이 제한: ${user.dietaryRestrictions.join(', ')}

팀 히스토리:
- 최근 3번 회식: ${teamHistory.map(h => h.restaurant).join(', ')}
- 팀원 평균 선호도: 한식 40%, 일식 30%, 양식 20%, 기타 10%

선택 가능한 레스토랑:
${restaurants.map((r, i) =>
  `${i+1}. ${r.name} (${r.cuisine}, ${r.rating}점, ${r.distance}, ${r.priceRange})`
).join('\n')}

다음 기준으로 최적의 레스토랑 1개를 추천해주세요:
1. 사용자 개인 선호도 (40%)
2. 팀 전체 만족도 (30%)
3. 다양성 (최근 회식과 겹치지 않음, 20%)
4. 접근성 및 가격 (10%)

JSON 형식으로 응답:
{
  "recommendedRestaurantId": "레스토랑 ID",
  "reason": "추천 이유 (한 문장)",
  "matchScore": 0-100 점수
}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return restaurants.find(r => r.id === result.recommendedRestaurantId)!
}
```

#### API 엔드포인트
```typescript
// app/api/ai/recommend/route.ts
export async function POST(request: Request) {
  const { userId } = await request.json()

  // 사용자 프로필 가져오기
  const userProfile = await getUserProfile(userId)

  // 모든 레스토랑 가져오기
  const restaurants = await getRestaurants()

  // 팀 투표 데이터 가져오기
  const teamVoteData = await getTeamVoteHistory()

  // AI 추천 실행
  const recommendations = getTopRecommendations(
    restaurants,
    userProfile,
    teamVoteData,
    3 // 상위 3개
  )

  return Response.json({ recommendations })
}
```

#### 예상 효과
- ✅ 투표율 30% 증가
- ✅ 사용자 만족도 향상
- ✅ "AI 추천" 배지의 신뢰도 증가

#### 구현 난이도: ⭐⭐ (규칙 기반) / ⭐⭐⭐⭐ (AI 기반)
#### 예상 비용: $0 (규칙 기반) / $5-20/월 (AI 기반)

---

### 2. 🤖 자동 식이 제한 탐지

#### 기능 설명
레스토랑 이름, 카테고리, 메뉴 정보에서 자동으로 식이 태그 추출

#### 구현 방법
```typescript
// lib/ai/dietary-detector.ts
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function detectDietaryTags(restaurant: {
  name: string
  cuisine: string
  category: string
  menu?: string[]
}): Promise<string[]> {
  const prompt = `
레스토랑 정보:
- 이름: ${restaurant.name}
- 카테고리: ${restaurant.cuisine}
- 세부 분류: ${restaurant.category}
${restaurant.menu ? `- 대표 메뉴: ${restaurant.menu.join(', ')}` : ''}

다음 식이 태그 중 해당되는 것을 모두 골라주세요:
- 비건 옵션 (채식 메뉴 있음)
- 글루텐 프리
- 육식주의 (고기 전문점)
- 채식주의 (채식 전문점)
- 매운맛
- 할랄
- 코셔

JSON 배열로만 응답: ["태그1", "태그2"]
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // 저렴한 모델 사용
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  const result = JSON.parse(response.choices[0].message.content!)
  return result.tags || []
}
```

#### 자동화 워크플로우
```typescript
// app/api/restaurants/auto-tag/route.ts
export async function POST() {
  // 태그가 없는 레스토랑 가져오기
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('*')
    .or('dietary.is.null,dietary.eq.[]')

  // 배치로 AI 태그 추가
  for (const restaurant of restaurants || []) {
    const tags = await detectDietaryTags({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      category: restaurant.category_name || '',
    })

    await supabase
      .from('restaurants')
      .update({ dietary: tags })
      .eq('id', restaurant.id)
  }

  return Response.json({ tagged: restaurants?.length })
}
```

#### 예상 효과
- ✅ 식이 필터 정확도 95%+
- ✅ 관리자 수작업 시간 90% 절감
- ✅ 팀원 식이 제한 자동 대응

#### 구현 난이도: ⭐⭐
#### 예상 비용: $2-5/월 (GPT-4o-mini)

---

### 3. 📊 팀 선호도 실시간 분석

#### 기능 설명
투표 패턴, 시간대, 계절을 분석하여 팀 전체 선호도를 실시간 계산

#### 구현 방법
```typescript
// lib/ai/team-analytics.ts
export interface TeamPreferences {
  satisfaction: number // 0-100
  dietary: number // 식이 호환성 점수
  price: number // 가격 만족도
  topCuisines: { cuisine: string; percentage: number }[]
  bestTime: string // 가장 활발한 투표 시간
  seasonalTrends: { season: string; preference: string }[]
}

export async function analyzeTeamPreferences(): Promise<TeamPreferences> {
  // 모든 투표 기록 가져오기
  const { data: votes } = await supabase
    .from('votes')
    .select('*, restaurants(*)')
    .order('created_at', { ascending: false })
    .limit(100) // 최근 100개 투표

  if (!votes || votes.length === 0) {
    return {
      satisfaction: 0,
      dietary: 0,
      price: 0,
      topCuisines: [],
      bestTime: '12:00',
      seasonalTrends: []
    }
  }

  // 1. 만족도 분석 (평점 기반)
  const avgRating = votes.reduce((sum, v) =>
    sum + (v.restaurants?.rating || 0), 0
  ) / votes.length
  const satisfaction = (avgRating / 5) * 100

  // 2. 식이 호환성 (다양성 점수)
  const uniqueDietaryTags = new Set(
    votes.flatMap(v => v.restaurants?.dietary || [])
  )
  const dietary = Math.min((uniqueDietaryTags.size / 7) * 100, 100)

  // 3. 가격 만족도 (가격대 분포)
  const priceDistribution = votes.reduce((acc, v) => {
    const price = v.restaurants?.price_range || '$'
    acc[price] = (acc[price] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const affordableVotes = (priceDistribution['$'] || 0) + (priceDistribution['$$'] || 0)
  const price = (affordableVotes / votes.length) * 100

  // 4. 인기 음식 종류
  const cuisineCount = votes.reduce((acc, v) => {
    const cuisine = v.restaurants?.cuisine || '기타'
    acc[cuisine] = (acc[cuisine] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topCuisines = Object.entries(cuisineCount)
    .map(([cuisine, count]) => ({
      cuisine,
      percentage: (count / votes.length) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5)

  // 5. 최적 투표 시간 분석
  const hourCounts = votes.reduce((acc, v) => {
    const hour = new Date(v.created_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const bestHour = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 12
  const bestTime = `${bestHour}:00`

  return {
    satisfaction: Math.round(satisfaction),
    dietary: Math.round(dietary),
    price: Math.round(price),
    topCuisines,
    bestTime,
    seasonalTrends: [] // 추후 구현
  }
}
```

#### 실시간 업데이트 Hook
```typescript
// hooks/use-team-analytics.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useTeamAnalytics() {
  const [analytics, setAnalytics] = useState<TeamPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()

    // 실시간 구독 (투표 변경 시 재계산)
    const subscription = supabase
      .channel('analytics-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchAnalytics()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchAnalytics() {
    const response = await fetch('/api/ai/team-analytics')
    const data = await response.json()
    setAnalytics(data)
    setLoading(false)
  }

  return { analytics, loading }
}
```

#### 시각화 컴포넌트
```typescript
// components/ai-insights-panel.tsx
export function AIInsightsPanel({ analytics }: { analytics: TeamPreferences }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        AI 인사이트
      </h3>

      <div className="space-y-4">
        {/* 인기 음식 종류 */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">팀 선호 음식</p>
          {analytics.topCuisines.map(({ cuisine, percentage }) => (
            <div key={cuisine} className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{cuisine}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {/* 최적 시간 */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-muted-foreground">가장 활발한 시간:</span>
          <span className="font-medium">{analytics.bestTime}</span>
        </div>
      </div>
    </div>
  )
}
```

#### 예상 효과
- ✅ 데이터 기반 의사결정
- ✅ 팀 선호도 시각화
- ✅ 투표 최적 타이밍 제안

#### 구현 난이도: ⭐⭐⭐
#### 예상 비용: $0 (자체 분석)

---

## Priority 2: 편의성 AI 기능

### 4. 💬 자연어 레스토랑 검색

#### 기능 설명
"매운 고기 요리 먹고 싶어" → 자동으로 관련 레스토랑 필터링

#### 구현 예시
```typescript
// lib/ai/natural-language-search.ts
export async function parseNaturalQuery(query: string): Promise<SearchFilters> {
  const prompt = `
사용자 검색어: "${query}"

다음 JSON 형식으로 검색 필터를 추출해주세요:
{
  "cuisines": ["한식", "일식", ...], // 언급된 음식 종류
  "dietary": ["매운맛", "비건", ...], // 식이 조건
  "priceRange": "$" | "$$" | "$$$", // 가격대 추정
  "distance": number | null, // 거리 제한 (km)
  "keywords": ["고기", "국물", ...] // 기타 키워드
}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content!)
}

// 사용 예시
const filters = await parseNaturalQuery("2km 이내 저렴한 비건 레스토랑")
// → { cuisines: [], dietary: ["비건"], priceRange: "$", distance: 2 }
```

#### 예상 효과
- ✅ 검색 편의성 향상
- ✅ 필터 사용법 학습 불필요

#### 구현 난이도: ⭐⭐⭐
#### 예상 비용: $1-3/월

---

### 5. 🎨 레스토랑 이미지 자동 생성/수집

#### 기능 설명
이미지 없는 레스토랑에 AI 생성 또는 웹 크롤링 이미지 추가

#### Option A: AI 이미지 생성
```typescript
// lib/ai/image-generator.ts
import OpenAI from 'openai'

export async function generateRestaurantImage(restaurant: Restaurant): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Professional food photography of ${restaurant.cuisine} restaurant.
             ${restaurant.name} style ambiance. High quality, appetizing, modern interior.`,
    size: "1024x1024",
    quality: "standard",
  })

  const imageUrl = response.data[0].url!

  // Supabase Storage에 업로드
  const blob = await fetch(imageUrl).then(r => r.blob())
  const { data, error } = await supabase.storage
    .from('restaurant-images')
    .upload(`${restaurant.id}.png`, blob)

  return data?.path || ''
}
```

#### Option B: 카카오 플레이스 이미지 크롤링
```typescript
// lib/kakao-images.ts
export async function fetchKakaoPlaceImages(placeName: string): Promise<string[]> {
  // 카카오 로컬 API로 장소 ID 검색
  const places = await searchRestaurants(placeName, 127.0276, 37.4979, 5000)

  if (places.length === 0) return []

  const placeId = places[0].id

  // 카카오 플레이스 상세 정보에서 이미지 URL 추출
  const response = await fetch(
    `https://place.map.kakao.com/main/v/${placeId}`,
    { headers: { 'User-Agent': 'Mozilla/5.0...' } }
  )

  const data = await response.json()
  return data.photo?.photoList?.map(p => p.url) || []
}
```

#### 예상 효과
- ✅ 모든 레스토랑에 이미지 보유
- ✅ UI 완성도 향상

#### 구현 난이도: ⭐⭐⭐⭐
#### 예상 비용: $10-30/월 (DALL-E) / $0 (크롤링)

---

### 6. 📝 회식 후기 자동 요약

#### 기능 설명
투표 종료 후 팀원들의 코멘트를 AI가 자동 요약

#### 구현 예시
```typescript
// lib/ai/dinner-summary.ts
export async function generateDinnerSummary(
  session: DinnerSession,
  votes: Vote[],
  comments: Comment[]
): Promise<string> {
  const prompt = `
회식 정보:
- 선택된 레스토랑: ${session.winnerRestaurant}
- 총 투표 수: ${votes.length}
- 참여율: ${(votes.length / 20 * 100).toFixed(0)}%

팀원 코멘트:
${comments.map(c => `- ${c.userName}: ${c.text}`).join('\n')}

다음 내용을 포함한 회식 후기를 2-3문장으로 요약해주세요:
1. 어떤 레스토랑이 선정되었는지
2. 팀원들의 전반적인 반응
3. 다음 회식에 참고할 점
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0].message.content!
}
```

#### 예상 효과
- ✅ 회식 히스토리 자동 기록
- ✅ 차기 회식 계획 참고

#### 구현 난이도: ⭐⭐
#### 예상 비용: $2-5/월

---

## Priority 3: 고급 AI 기능

### 7. 🔮 회식 성공률 예측

#### 기능 설명
레스토랑 선택 시 팀 만족도 예측 (0-100%)

#### 구현 예시
```typescript
// lib/ai/success-predictor.ts
export interface SuccessPrediction {
  score: number // 0-100
  factors: {
    teamCompatibility: number
    priceAppropriate: number
    locationConvenience: number
    dietaryFit: number
  }
  warnings: string[] // 예: "비건 팀원 2명에게 부적합"
}

export function predictDinnerSuccess(
  restaurant: Restaurant,
  teamMembers: TeamMember[],
  historicalData: DinnerHistory[]
): SuccessPrediction {
  // 머신러닝 모델 또는 규칙 기반 예측
  const compatibility = calculateTeamCompatibility(restaurant, teamMembers)
  const price = calculatePriceScore(restaurant, historicalData)
  const location = calculateLocationScore(restaurant)
  const dietary = calculateDietaryScore(restaurant, teamMembers)

  const score = (
    compatibility * 0.4 +
    price * 0.3 +
    location * 0.2 +
    dietary * 0.1
  )

  const warnings = []
  if (dietary < 50) {
    const incompatibleMembers = teamMembers.filter(m =>
      !isCompatible(m.dietaryRestrictions, restaurant.dietary)
    )
    warnings.push(`${incompatibleMembers.length}명의 식이 제한에 부적합`)
  }

  return {
    score,
    factors: {
      teamCompatibility: compatibility,
      priceAppropriate: price,
      locationConvenience: location,
      dietaryFit: dietary
    },
    warnings
  }
}
```

#### 시각화
```typescript
// components/success-predictor.tsx
export function SuccessPredictor({ prediction }: { prediction: SuccessPrediction }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">AI 성공률 예측</span>
      </div>

      <div className="text-3xl font-bold text-center mb-2">
        {prediction.score.toFixed(0)}%
      </div>

      {prediction.warnings.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2 text-xs">
          ⚠️ {prediction.warnings.join(', ')}
        </div>
      )}
    </div>
  )
}
```

#### 예상 효과
- ✅ 의사결정 보조
- ✅ 불만 사전 방지

#### 구현 난이도: ⭐⭐⭐⭐
#### 예상 비용: $0 (자체 분석)

---

### 8. 🗓️ 최적 회식 일정 제안

#### 기능 설명
과거 투표 패턴을 분석하여 최적의 회식 날짜/시간 추천

#### 구현 예시
```typescript
// lib/ai/schedule-optimizer.ts
export interface OptimalSchedule {
  recommendedDate: Date
  recommendedTime: string
  participationRate: number
  reason: string
}

export function suggestOptimalSchedule(
  historicalVotes: Vote[]
): OptimalSchedule {
  // 요일별 투표 활동 분석
  const dayOfWeekStats = historicalVotes.reduce((acc, vote) => {
    const day = new Date(vote.created_at).getDay()
    acc[day] = (acc[day] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  // 가장 활발한 요일 찾기
  const bestDay = Object.entries(dayOfWeekStats)
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return {
    recommendedDate: getNextDayOfWeek(parseInt(bestDay)),
    recommendedTime: '18:00',
    participationRate: 85,
    reason: `${dayNames[bestDay]}요일에 팀 참여도가 가장 높습니다`
  }
}
```

#### 예상 효과
- ✅ 참여율 극대화
- ✅ 기획 시간 단축

#### 구현 난이도: ⭐⭐⭐
#### 예상 비용: $0

---

### 9. 🎯 개인별 AI 어시스턴트

#### 기능 설명
각 팀원에게 맞춤형 추천 및 알림 제공

#### 구현 예시
```typescript
// lib/ai/personal-assistant.ts
export async function getPersonalizedMessage(
  user: TeamMember,
  context: {
    currentVotes: Vote[]
    timeLeft: number
    recommendations: Restaurant[]
  }
): Promise<string> {
  const prompt = `
당신은 ${user.name}님의 개인 회식 어시스턴트입니다.

상황:
- 현재 ${context.currentVotes.length}명이 투표했습니다
- 투표 마감까지 ${context.timeLeft}시간 남았습니다
- ${user.name}님은 ${user.preferences.join(', ')}을 선호합니다

추천 레스토랑:
${context.recommendations.map(r => `- ${r.name} (${r.cuisine})`).join('\n')}

${user.name}님에게 친근하게 투표를 유도하는 메시지를 작성해주세요. (1-2문장)
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  })

  return response.choices[0].message.content!
}
```

#### 예시 메시지
```
"해리님! 🌶️ 매운맛 좋아하시는 거 알죠?
스파이스 루트가 현재 1위인데, 아직 투표 안 하셨네요.
마감 2시간 전이에요!"
```

#### 예상 효과
- ✅ 개인화된 사용자 경험
- ✅ 투표 참여율 증가

#### 구현 난이도: ⭐⭐⭐⭐
#### 예상 비용: $5-10/월

---

## 💰 전체 비용 예상 (월간)

| 기능 | 사용 API | 예상 비용 |
|------|---------|-----------|
| 개인 맞춤형 추천 (AI) | GPT-4o | $5-10 |
| 자동 식이 태그 | GPT-4o-mini | $2-5 |
| 팀 선호도 분석 | 자체 | $0 |
| 자연어 검색 | GPT-4o-mini | $1-3 |
| 이미지 생성 (선택) | DALL-E 3 | $10-30 |
| 후기 요약 | GPT-4o | $2-5 |
| 성공률 예측 | 자체 | $0 |
| 일정 제안 | 자체 | $0 |
| 개인 어시스턴트 | GPT-4o-mini | $5-10 |
| **합계** | | **$25-63** |

**최소 구성 (핵심만)**: $7-15/월
- 개인 맞춤형 추천 (규칙 기반 무료)
- 자동 식이 태그
- 팀 선호도 분석

---

## 🚀 구현 로드맵

### Phase 1 (1주): 핵심 AI 기능
- [ ] 규칙 기반 개인 맞춤형 추천
- [ ] 팀 선호도 실시간 분석
- [ ] API 엔드포인트 구축

### Phase 2 (1주): 자동화
- [ ] 자동 식이 태그 탐지
- [ ] 레스토랑 데이터 보강 배치
- [ ] Vercel Cron 설정

### Phase 3 (2주): 고급 기능
- [ ] OpenAI 기반 추천 시스템
- [ ] 자연어 검색
- [ ] 성공률 예측

### Phase 4 (2주): 편의 기능
- [ ] 이미지 자동 수집/생성
- [ ] 회식 후기 자동 요약
- [ ] 개인 AI 어시스턴트

---

## 📊 성공 지표 (KPI)

구현 후 측정할 지표:

1. **참여율**
   - 목표: 투표율 70% → 90%+

2. **추천 정확도**
   - 목표: AI 추천 레스토랑 실제 선정률 40%+

3. **사용자 만족도**
   - 목표: 회식 후 만족도 설문 4.5/5+

4. **시간 절감**
   - 목표: 회식 계획 시간 50% 단축

---

## 🔧 기술 스택

### AI/ML
- **OpenAI API** (GPT-4o, GPT-4o-mini, DALL-E 3)
- **TensorFlow.js** (선택, 브라우저 내 추론)
- **LangChain** (선택, 복잡한 AI 워크플로우)

### 백엔드
- **Supabase** (데이터 저장, 실시간 구독)
- **Vercel Edge Functions** (AI API 호스팅)
- **Vercel Cron** (자동화)

### 프론트엔드
- **Next.js 15** (서버 컴포넌트, 스트리밍)
- **Framer Motion** (AI 결과 애니메이션)
- **Recharts** (분석 시각화)

---

## 🎓 학습 리소스

AI 기능 구현에 참고할 자료:

1. **OpenAI Cookbook**
   - https://cookbook.openai.com/
   - 추천 시스템 예제

2. **Vercel AI SDK**
   - https://sdk.vercel.ai/
   - 스트리밍 AI 응답

3. **Supabase AI**
   - https://supabase.com/docs/guides/ai
   - 벡터 검색, 임베딩

---

## ✅ 다음 단계

이 문서를 확인하신 후:

1. **우선순위 결정**: Priority 1 기능부터 시작 권장
2. **API 키 발급**: OpenAI API 키 준비
3. **프로토타입 구현**: 규칙 기반 추천 먼저 구현
4. **A/B 테스트**: AI vs 비AI 추천 비교

---

**작성일**: 2024-12-24
**버전**: 1.0
**작성자**: BiteEngine AI Team
