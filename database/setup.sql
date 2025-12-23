-- BiteEngine 데이터베이스 셋업 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 레스토랑 테이블
CREATE TABLE IF NOT EXISTS restaurants (
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
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 투표 활동 로그 테이블
CREATE TABLE IF NOT EXISTS vote_activities (
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
CREATE TABLE IF NOT EXISTS dinner_sessions (
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
CREATE INDEX IF NOT EXISTS idx_votes_restaurant ON votes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_vote_activities_created ON vote_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating DESC);

-- 업데이트 타임스탬프 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 설정
DROP TRIGGER IF EXISTS update_restaurants_updated_at ON restaurants;
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_dinner_sessions_updated_at ON dinner_sessions;
CREATE TRIGGER update_dinner_sessions_updated_at
  BEFORE UPDATE ON dinner_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinner_sessions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 - 모든 사용자가 읽기 가능
DROP POLICY IF EXISTS "Anyone can read restaurants" ON restaurants;
CREATE POLICY "Anyone can read restaurants"
  ON restaurants FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
CREATE POLICY "Anyone can read votes"
  ON votes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read activities" ON vote_activities;
CREATE POLICY "Anyone can read activities"
  ON vote_activities FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can read sessions" ON dinner_sessions;
CREATE POLICY "Anyone can read sessions"
  ON dinner_sessions FOR SELECT
  USING (true);

-- RLS 정책 - 쓰기 권한 (나중에 인증 추가 시 수정)
DROP POLICY IF EXISTS "Anyone can insert votes" ON votes;
CREATE POLICY "Anyone can insert votes"
  ON votes FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete votes" ON votes;
CREATE POLICY "Anyone can delete votes"
  ON votes FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Anyone can insert activities" ON vote_activities;
CREATE POLICY "Anyone can insert activities"
  ON vote_activities FOR INSERT
  WITH CHECK (true);

-- 완료 메시지
SELECT 'BiteEngine 데이터베이스 셋업 완료!' AS message;
