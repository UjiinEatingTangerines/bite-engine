# BiteEngine 실제 데이터 설정 가이드

## 🚀 빠른 시작 (5분이면 완료!)

### 1단계: Supabase 프로젝트 생성

1. https://supabase.com 접속 및 회원가입
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `bite-engine` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 생성 (저장 필수!) -- iR4yDtp!HvdF76J
   - **Region**: Northeast Asia (Seoul) - 한국에서 가장 빠름
4. "Create new project" 클릭 (약 2분 소요)

### 2단계: 데이터베이스 설정

1. Supabase Dashboard → **SQL Editor** 클릭
2. "New Query" 버튼 클릭
3. `database/setup.sql` 파일의 내용을 복사해서 붙여넣기
4. **Run** 버튼 클릭 (또는 Cmd/Ctrl + Enter)
5. "BiteEngine 데이터베이스 셋업 완료!" 메시지 확인

### 3단계: 환경 변수 설정

1. Supabase Dashboard → **Settings** → **API** 이동
2. 다음 값들을 복사:
   - **Project URL** (예: `https://xxxxx.supabase.co`) 
   - **anon public key** (긴 문자열, `eyJhbGc...`로 시작)

3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.example을 복사해서 .env.local 생성
cp .env.example .env.local
```

4. `.env.local` 파일을 열어서 값 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...여기에-anon-key-붙여넣기
```

### 4단계: 개발 서버 재시작

```bash
# 기존 서버 중지 (Ctrl + C)

# 개발 서버 재시작
pnpm dev
```

### 5단계: 확인

1. http://localhost:3000 접속
2. 레스토랑 목록이 표시되는지 확인
3. 투표 버튼 클릭 → 실시간으로 투표 수 증가 확인
4. 활동 피드에 투표 기록 표시 확인

## ✅ 작동 확인

다음 기능들이 작동하면 성공:

- [ ] 레스토랑 목록 로드
- [ ] 투표 버튼 클릭 시 투표 수 증가
- [ ] 활동 피드에 실시간 업데이트
- [ ] 페이지 새로고침 시에도 투표 수 유지
- [ ] 여러 브라우저에서 동시 접속 시 실시간 동기화

## 🔧 문제 해결

### "레스토랑 정보를 불러오는 중..." 무한 로딩

**원인**: 환경 변수 설정 오류 또는 Supabase 연결 실패

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 환경 변수가 올바른지 확인 (복사할 때 공백 없이)
3. 개발 서버 재시작 (`Ctrl+C` 후 `pnpm dev`)
4. 브라우저 콘솔(F12) 확인 → 에러 메시지 확인

### "Failed to fetch restaurants" 에러

**원인**: 데이터베이스 테이블이 없거나 RLS 정책 문제

**해결**:
1. Supabase Dashboard → **Table Editor** 확인
2. `restaurants`, `votes`, `vote_activities` 테이블이 있는지 확인
3. 없다면 `database/setup.sql` 다시 실행

### 투표는 되는데 실시간 업데이트가 안됨

**원인**: Supabase Realtime이 비활성화됨

**해결**:
1. Supabase Dashboard → **Database** → **Replication** 이동
2. `votes` 테이블과 `vote_activities` 테이블의 Realtime 활성화
3. 페이지 새로고침

## 📊 데이터 관리

### Supabase Dashboard에서 데이터 보기

1. Supabase Dashboard → **Table Editor**
2. 테이블 선택 (restaurants, votes, vote_activities)
3. 데이터 직접 편집 가능

### 레스토랑 추가하기

Supabase Dashboard → SQL Editor에서 실행:

```sql
INSERT INTO restaurants (name, cuisine, image, rating, distance, price_range, badges, dietary)
VALUES (
  '새로운 레스토랑',
  '한식',
  '/restaurant-image.jpg',
  4.5,
  '0.7km',
  '$$',
  '["신규"]'::jsonb,
  '["채식 옵션"]'::jsonb
);
```

### 투표 초기화하기

```sql
-- 모든 투표 삭제
DELETE FROM votes;
DELETE FROM vote_activities;
```

## 🚀 다음 단계

실제 데이터가 작동하면:

1. **실제 이미지 추가**: Supabase Storage에 레스토랑 이미지 업로드
2. **사용자 인증**: 회사 이메일로 로그인 구현
3. **Vercel 배포**: 팀원들과 공유
4. **더 많은 레스토랑 추가**: 실제 주변 맛집 데이터 입력

자세한 내용은 `howToMake/IMPLEMENTATION_GUIDE.md` 참조!

## 💡 유용한 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드 (프로덕션)
pnpm build

# 린트 체크
pnpm lint

# 타입 체크
pnpm type-check
```

## 📞 도움이 필요하면?

- Supabase 문서: https://supabase.com/docs
- Next.js 문서: https://nextjs.org/docs
- GitHub Issues: https://github.com/UjiinEatingTangerines/bite-engine/issues
