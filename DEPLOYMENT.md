# Vercel 배포 가이드

## 환경 변수 설정

Vercel에 배포하기 전에 다음 환경 변수들을 설정해야 합니다.

### 1. Vercel 대시보드 접속
- https://vercel.com/dashboard 접속
- 프로젝트 선택

### 2. Environment Variables 설정
**Settings → Environment Variables**로 이동하여 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://lsgdxpeqqgugatxjrsdv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZ2R4cGVxcWd1Z2F0eGpyc2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjA5ODUsImV4cCI6MjA4MjAzNjk4NX0.PPDDPS_lKqlnXwqAaxrW7TyLlalhv38agl3WQ5YljYw
KAKAO_REST_API_KEY=999d7d7bbe2e447f471a33dca95eed16
```

### 3. Environment 선택
각 환경 변수마다 적용할 환경을 선택:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. 저장 및 재배포
1. **Save** 버튼 클릭
2. **Deployments** 탭으로 이동
3. 최신 배포의 **...** 메뉴 클릭
4. **Redeploy** 선택

## 배포 확인

재배포가 완료되면:
1. 배포된 URL에 접속
2. `/admin` 페이지에서 레스토랑 검색 및 추가 가능
3. 메인 페이지에서 투표 기능 정상 작동 확인

## 문제 해결

### API 500 에러
- 환경 변수가 제대로 설정되었는지 확인
- 재배포 후에도 계속 에러 발생 시 Vercel 함수 로그 확인

### WebSocket 연결 실패
- Supabase URL이 정확한지 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 빈 페이지 표시
- 정상 동작입니다 (데이터베이스가 비어있음)
- `/admin` 페이지에서 레스토랑 추가 필요
