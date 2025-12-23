# BiteEngine 실제 데이터 및 호스팅 구현 가이드

## 📋 목차

1. [개발 환경 준비](#1-개발-환경-준비)
2. [Supabase 데이터베이스 설정](#2-supabase-데이터베이스-설정)
3. [프로젝트에 Supabase 통합](#3-프로젝트에-supabase-통합)
4. [Mock 데이터를 실제 DB로 마이그레이션](#4-mock-데이터를-실제-db로-마이그레이션)
5. [컴포넌트 수정 (실시간 데이터)](#5-컴포넌트-수정-실시간-데이터)
6. [사내 인증 구현](#6-사내-인증-구현)
7. [Vercel 배포](#7-vercel-배포)
8. [테스트 및 최적화](#8-테스트-및-최적화)

---

## 1. 개발 환경 준비

### 1.1 필수 도구 설치 확인

```bash
# Node.js 버전 확인 (20.x 이상)
node --version

# pnpm 확인
pnpm --version

# Git 설정 확인
git config --global user.name
git config --global user.email
```

### 1.2 Git 저장소 초기화

```bash
cd /Users/gimhyeon-u/biteEngine

# Git 저장소 초기화 (아직 안 했다면)
git init

# .gitignore 확인
cat .gitignore

# 첫 커밋
git add .
git commit -m "Initial commit: BiteEngine v1.0"

# GitHub/GitLab 저장소 생성 후 연결
git remote add origin https://github.com/yourcompany/bite-engine.git
git push -u origin main
```

---

## 2. Supabase 데이터베이스 설정

### 2.1 Supabase 프로젝트 생성

1. https://supabase.com 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트 설정:
   - **Name**: `bite-engine-production`
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!)
   - **Region**: Northeast Asia (Seoul) - 한국에서 가장 빠름
   - **Pricing Plan**: Free tier

### 2.2 데이터베이스 스키마 생성

Supabase Dashboard → SQL Editor → "New Query"에서 실행:

```sql
-- 1. 레스토랑 테이블
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  image TEXT,
  rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
  distance TEXT,
  price_range TEXT,
  badges JSONB DEFAULT '[]'::jsonb,
  dietary JSONB DEFAULT '[]'::jsonb,
  location_lat NUMERIC,
  location_lng NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 투표 테이블
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 투표 활동 로그 테이블
CREATE TABLE vote_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  action TEXT NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 회식 세션 테이블 (투표 마감 관리)
CREATE TABLE dinner_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'finalized', 'cancelled')),
  winner_restaurant_id UUID REFERENCES restaurants(id),
  finalized_at TIMESTAMPTZ,
  booking_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_votes_restaurant ON votes(restaurant_id);
CREATE INDEX idx_votes_user ON votes(user_id);
CREATE INDEX idx_vote_activities_created ON vote_activities(created_at DESC);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);

-- 업데이트 타임스탬프 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dinner_sessions_updated_at
  BEFORE UPDATE ON dinner_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2.3 Row Level Security (RLS) 설정

```sql
-- RLS 활성화
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_sessions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 레스토랑 읽기 가능
CREATE POLICY "Anyone can read restaurants"
  ON restaurants FOR SELECT
  USING (true);

-- 인증된 사용자만 투표 가능
CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 자기 투표만 삭제 가능 (투표 변경용)
CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE
  USING (auth.uid()::text = user_id);

-- 모든 사용자가 투표 현황 읽기 가능
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  USING (true);

-- 활동 로그 읽기 가능
CREATE POLICY "Anyone can read activities"
  ON vote_activities FOR SELECT
  USING (true);

-- 인증된 사용자만 활동 생성 가능
CREATE POLICY "Authenticated users can create activities"
  ON vote_activities FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
```

### 2.4 초기 데이터 입력

```sql
-- 샘플 레스토랑 데이터 입력
INSERT INTO restaurants (name, cuisine, image, rating, distance, price_range, badges, dietary) VALUES
('사쿠라 스시 하우스', '일식', '/elegant-sushi-restaurant.png', 4.8, '0.5km', '$$',
  '["AI 추천", "사무실 근처"]'::jsonb, '["비건 옵션", "글루텐 프리"]'::jsonb),
('서울 키친 BBQ', '한식', '/korean-bbq-restaurant-grilling.jpg', 4.6, '1.3km', '$$$',
  '["백엔드팀 인기"]'::jsonb, '["육식주의"]'::jsonb),
('스파이스 루트', '인도식', '/indian-restaurant-colorful-interior.jpg', 4.5, '0.8km', '$$',
  '["가성비 최고"]'::jsonb, '["비건 옵션", "매운맛"]'::jsonb),
('타코 피에스타', '멕시코', '/vibrant-mexican-restaurant-tacos.jpg', 4.3, '0.3km', '$',
  '["가성비 최고", "사무실 근처"]'::jsonb, '["비건 옵션"]'::jsonb),
('지중해 오아시스', '지중해식', '/mediterranean-restaurant-hummus-falafel.jpg', 4.4, '1.6km', '$$',
  '[]'::jsonb, '["비건 옵션", "채식주의"]'::jsonb),
('파스타 팰리스', '이탈리안', '/italian-restaurant-pasta-wine.jpg', 4.7, '1.9km', '$$$',
  '[]'::jsonb, '["채식주의"]'::jsonb);

-- 현재 활성 세션 생성
INSERT INTO dinner_sessions (title, status) VALUES
('12월 팀 회식', 'active');
```

### 2.5 API 키 확인

Supabase Dashboard → Settings → API:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGc...` (복사)
- **service_role key**: `eyJhbGc...` (복사, 비공개 보관)

---

## 3. 프로젝트에 Supabase 통합

### 3.1 Supabase 클라이언트 설치

```bash
cd /Users/gimhyeon-u/biteEngine
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### 3.2 환경 변수 설정

```bash
# .env.local 파일 생성
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key...
EOF

# .env.local을 .gitignore에 추가 (이미 되어있는지 확인)
grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore
```

### 3.3 Supabase 클라이언트 생성

```bash
# lib/supabase.ts 파일 생성
```

파일 내용:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### 3.4 TypeScript 타입 생성

Supabase CLI 설치 및 타입 생성:

```bash
# Supabase CLI 설치
pnpm add -D supabase

# Supabase 로그인
npx supabase login

# 타입 생성
npx supabase gen types typescript \
  --project-id "xxxxx" \
  --schema public > types/database.types.ts
```

---

## 4. Mock 데이터를 실제 DB로 마이그레이션

### 4.1 API 라우트 생성

#### 4.1.1 레스토랑 목록 API

```bash
# app/api/restaurants/route.ts 생성
mkdir -p app/api/restaurants
```

파일 내용:
```typescript
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('rating', { ascending: false })

    if (error) throw error

    // 각 레스토랑의 투표 수 계산
    const restaurantsWithVotes = await Promise.all(
      restaurants.map(async (restaurant) => {
        const { count } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('restaurant_id', restaurant.id)

        return {
          ...restaurant,
          votes: count || 0,
          totalVoters: 20, // 팀 총 인원수
          activeViewers: [] // 실시간 구현 시 추가
        }
      })
    )

    return NextResponse.json(restaurantsWithVotes)
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 })
  }
}
```

#### 4.1.2 투표 API

```bash
# app/api/vote/route.ts 생성
mkdir -p app/api/vote
```

파일 내용:
```typescript
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userAvatar, restaurantId, restaurantName } = await request.json()

    // 기존 투표 삭제 (투표 변경)
    await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)

    // 새 투표 추가
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        restaurant_id: restaurantId
      })
      .select()
      .single()

    if (voteError) throw voteError

    // 활동 로그 추가
    const { error: activityError } = await supabase
      .from('vote_activities')
      .insert({
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        action: '에 투표했습니다',
        restaurant_id: restaurantId,
        restaurant_name: restaurantName
      })

    if (activityError) throw activityError

    return NextResponse.json({ success: true, vote })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vote:', error)
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 })
  }
}
```

#### 4.1.3 활동 피드 API

```bash
# app/api/activities/route.ts 생성
mkdir -p app/api/activities
```

파일 내용:
```typescript
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from('vote_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}
```

---

## 5. 컴포넌트 수정 (실시간 데이터)

### 5.1 Custom Hooks 생성

```bash
# hooks/use-restaurants.ts 생성
```

파일 내용:
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type Restaurant = {
  id: string
  name: string
  cuisine: string
  image: string
  votes: number
  totalVoters: number
  priceRange: string
  rating: number
  distance: string
  badges: string[]
  dietary: string[]
  activeViewers: any[]
}

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRestaurants()

    // 실시간 구독 (투표 변경 시 자동 업데이트)
    const subscription = supabase
      .channel('votes-channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => {
          fetchRestaurants()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchRestaurants() {
    try {
      const response = await fetch('/api/restaurants')
      const data = await response.json()
      setRestaurants(data)
    } catch (err) {
      setError('Failed to fetch restaurants')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return { restaurants, loading, error, refetch: fetchRestaurants }
}
```

```bash
# hooks/use-vote-activities.ts 생성
```

파일 내용:
```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export type VoteActivity = {
  id: string
  user_name: string
  user_avatar: string
  action: string
  restaurant_name: string
  created_at: string
}

export function useVoteActivities() {
  const [activities, setActivities] = useState<VoteActivity[]>([])

  useEffect(() => {
    fetchActivities()

    // 실시간 구독
    const subscription = supabase
      .channel('activities-channel')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vote_activities' },
        (payload) => {
          setActivities(prev => [payload.new as VoteActivity, ...prev.slice(0, 9)])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function fetchActivities() {
    const response = await fetch('/api/activities')
    const data = await response.json()
    setActivities(data)
  }

  return { activities }
}
```

### 5.2 메인 페이지 수정

`app/page.tsx` 파일을 다음과 같이 수정:

```typescript
"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { Trophy, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { LiveFeed } from "@/components/live-feed"
import { SmartMatchHero } from "@/components/smart-match-hero"
import { PreferenceMatrix } from "@/components/preference-matrix"
import { VoteCounter } from "@/components/vote-counter"
import { DietaryFilter } from "@/components/dietary-filter"
import { RestaurantCard } from "@/components/restaurant-card"
import { MiniMap } from "@/components/mini-map"
import { Confetti } from "@/components/confetti"
import { Button } from "@/components/ui/button"
import { useRestaurants } from "@/hooks/use-restaurants"
import { useVoteActivities } from "@/hooks/use-vote-activities"
import { dietaryFilters, currentUser, teamScores } from "@/lib/mock-data"

export default function BiteEnginePage() {
  const { restaurants: initialRestaurants, loading } = useRestaurants()
  const { activities } = useVoteActivities()
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [votedRestaurant, setVotedRestaurant] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)

  const sortedRestaurants = useMemo(() => {
    let filtered = [...initialRestaurants]

    if (activeFilters.length > 0) {
      filtered = filtered.filter((r) => {
        return activeFilters.some((filter) => {
          if (filter === "vegan") return r.dietary.some((d) => d.toLowerCase().includes("비건"))
          if (filter === "meat-lover") return r.dietary.includes("육식주의")
          if (filter === "spicy") return r.dietary.includes("매운맛")
          if (filter === "gluten-free") return r.dietary.some((d) => d.toLowerCase().includes("글루텐"))
          if (filter === "no-seafood") return !r.cuisine.toLowerCase().includes("일식")
          return true
        })
      })
    }

    return filtered.sort((a, b) => b.votes - a.votes)
  }, [initialRestaurants, activeFilters])

  const totalVotes = initialRestaurants.reduce((sum, r) => sum + r.votes, 0)
  const leadingRestaurant = sortedRestaurants[0]?.name || ""
  const aiRecommendation = initialRestaurants.find((r) => r.badges.includes("AI 추천")) || initialRestaurants[0]

  const handleVote = async (id: string) => {
    if (votedRestaurant === id) return

    const restaurant = initialRestaurants.find((r) => r.id === id)
    if (!restaurant) return

    try {
      await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.name,
          userName: currentUser.name,
          userAvatar: '/professional-smiling-man-headshot.png',
          restaurantId: id,
          restaurantName: restaurant.name
        })
      })

      setVotedRestaurant(id)
    } catch (error) {
      console.error('Failed to vote:', error)
    }
  }

  const handleFilterToggle = (id: string) => {
    setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const handleFinalize = () => {
    setIsFinalized(true)
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Confetti isActive={showConfetti} />
      <Header />

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-3 space-y-6">
            <SmartMatchHero user={currentUser} recommendation={aiRecommendation} onVote={handleVote} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreferenceMatrix scores={teamScores} />
              <VoteCounter totalVotes={totalVotes} />
              <MiniMap topRestaurants={sortedRestaurants.slice(0, 3)} />
            </div>

            <DietaryFilter filters={dietaryFilters} activeFilters={activeFilters} onToggle={handleFilterToggle} />

            {!isFinalized && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <Button
                  onClick={handleFinalize}
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  투표 마감하기
                </Button>
              </motion.div>
            )}

            <AnimatePresence>
              {isFinalized && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl border border-primary/30 p-6 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="w-8 h-8 text-chart-4" />
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">오늘의 회식 맛집</h2>
                  <p className="text-3xl font-bold text-primary">{leadingRestaurant}</p>
                  <p className="text-muted-foreground mt-2">오후 7시 예약 완료</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">전체 맛집 목록</h3>
              <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {sortedRestaurants.map((restaurant, index) => (
                      <RestaurantCard
                        key={restaurant.id}
                        restaurant={restaurant}
                        onVote={handleVote}
                        hasVoted={votedRestaurant === restaurant.id}
                        rank={index + 1}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>

              {sortedRestaurants.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">선택한 식이 필터에 맞는 맛집이 없습니다</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LiveFeed activities={activities} leadingRestaurant={leadingRestaurant} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
```

---

## 6. 사내 인증 구현

### 6.1 Supabase Auth 설정

Supabase Dashboard → Authentication → Providers:
- Email 활성화
- Google OAuth 추가 (선택사항)

### 6.2 로그인 페이지 생성

```bash
# app/login/page.tsx 생성
mkdir -p app/login
```

파일 내용:
```typescript
"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 회사 이메일 검증
    if (!email.endsWith('@yourcompany.com')) {
      alert('회사 이메일만 사용 가능합니다')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    })

    if (error) {
      alert(error.message)
    } else {
      alert('이메일을 확인해주세요!')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-card rounded-2xl border border-border">
        <h1 className="text-2xl font-bold text-foreground mb-6 text-center">
          BiteEngine 로그인
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="email@yourcompany.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? '전송 중...' : '로그인 링크 받기'}
          </Button>
        </form>
      </div>
    </div>
  )
}
```

### 6.3 미들웨어 추가 (인증 보호)

```bash
# middleware.ts 생성 (프로젝트 루트)
```

파일 내용:
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 로그인 페이지는 제외
  if (req.nextUrl.pathname === '/login') {
    return res
  }

  // 인증되지 않은 경우 로그인 페이지로
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 회사 이메일 검증
  if (!session.user.email?.endsWith('@yourcompany.com')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```

---

## 7. Vercel 배포

### 7.1 Vercel CLI 설치 및 로그인

```bash
pnpm add -g vercel

# Vercel 로그인
vercel login
```

### 7.2 프로젝트 배포

```bash
# 프로젝트 디렉토리에서
cd /Users/gimhyeon-u/biteEngine

# 배포 시작
vercel

# 질문 답변:
# ? Set up and deploy "~/biteEngine"? [Y/n] y
# ? Which scope do you want to deploy to? [your-team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? bite-engine
# ? In which directory is your code located? ./
# ? Want to override the settings? [y/N] n
```

### 7.3 환경 변수 설정

Vercel Dashboard 또는 CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 값 입력: https://xxxxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 값 입력: eyJhbGc...

vercel env add SUPABASE_SERVICE_ROLE_KEY
# 값 입력: eyJhbGc...
```

### 7.4 프로덕션 배포

```bash
vercel --prod
```

배포 완료 후 URL 확인: `https://bite-engine.vercel.app`

### 7.5 커스텀 도메인 설정 (선택사항)

Vercel Dashboard → bite-engine → Settings → Domains:
- `dinner.yourcompany.com` 추가
- DNS 설정 (A 레코드 또는 CNAME)

---

## 8. 테스트 및 최적화

### 8.1 기능 테스트 체크리스트

```bash
# 테스트 시나리오
# ☐ 1. 회원가입/로그인 (회사 이메일)
# ☐ 2. 레스토랑 목록 로드
# ☐ 3. AI 추천 표시
# ☐ 4. 투표 추가
# ☐ 5. 투표 변경
# ☐ 6. 실시간 활동 피드 업데이트
# ☐ 7. 식이 필터 적용
# ☐ 8. 투표 마감 및 우승자 발표
# ☐ 9. 모바일 반응형 확인
# ☐ 10. 다크모드 확인
```

### 8.2 성능 최적화

```typescript
// next.config.mjs에 추가
const nextConfig = {
  images: {
    domains: ['xxxxx.supabase.co'], // Supabase Storage 도메인
    unoptimized: false, // 이미지 최적화 활성화
  },

  // 번들 크기 분석
  webpack(config) {
    config.optimization.minimize = true
    return config
  }
}
```

### 8.3 모니터링 설정

```bash
# Vercel Analytics 확인 (이미 설치됨)
# Vercel Dashboard → Analytics 섹션에서 확인

# Supabase Dashboard → Database → Logs
# 쿼리 성능 모니터링
```

---

## 📊 완료 후 확인사항

### ✅ 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 데이터베이스 스키마 생성 완료
- [ ] 초기 데이터 입력 완료
- [ ] RLS 정책 설정 완료
- [ ] 프로젝트에 Supabase 통합 완료
- [ ] API 라우트 생성 완료
- [ ] Custom Hooks 구현 완료
- [ ] 컴포넌트 실시간 데이터 연동 완료
- [ ] 사내 인증 구현 완료
- [ ] Vercel 배포 완료
- [ ] 환경 변수 설정 완료
- [ ] 커스텀 도메인 연결 완료 (선택)
- [ ] 기능 테스트 완료
- [ ] 모바일 반응형 테스트 완료

---

## 🚀 다음 단계 (고급 기능)

1. **AI 추천 알고리즘 개선**
   - OpenAI API 통합
   - 사용자 선호도 학습

2. **슬랙/디스코드 알림**
   - 투표 마감 알림
   - 우승자 발표 자동 메시지

3. **예약 자동화**
   - 카카오맵 API 연동
   - 전화번호 자동 다이얼

4. **통계 대시보드**
   - 월별 회식 통계
   - 인기 음식 카테고리 분석

5. **모바일 앱**
   - React Native로 포팅
   - 푸시 알림

---

## 📞 문제 해결

### 자주 발생하는 문제

1. **CORS 에러**
   - Supabase Dashboard → Settings → API → CORS
   - Vercel 도메인 추가

2. **RLS 정책으로 인한 권한 오류**
   - Supabase Dashboard → Authentication → Policies 확인
   - `anon` key 사용 시 제한 확인

3. **실시간 구독 안됨**
   - Supabase Dashboard → Database → Replication
   - 테이블 replication 활성화

4. **환경 변수 인식 안됨**
   - `NEXT_PUBLIC_` 접두사 확인
   - 서버 재시작: `vercel --prod`

---

## 📝 유지보수 가이드

### 정기 작업

**주간**:
- 투표 활동 로그 정리 (30일 이상 삭제)
- 사용자 피드백 확인

**월간**:
- Supabase 데이터베이스 백업
- 성능 지표 리뷰

**분기별**:
- 의존성 업데이트: `pnpm update`
- 보안 취약점 점검: `pnpm audit`

---

이 가이드를 따라 단계별로 진행하면 BiteEngine을 완전히 실제 데이터와 호스팅으로 전환할 수 있습니다!
