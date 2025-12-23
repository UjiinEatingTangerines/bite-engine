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

interface KakaoSearchResponse {
  documents: KakaoPlace[]
  meta: {
    total_count: number
    pageable_count: number
    is_end: boolean
  }
}

/**
 * 카카오 로컬 API로 레스토랑 검색
 * @param query 검색어 (예: "강남역 맛집", "일식")
 * @param x 회사 경도
 * @param y 회사 위도
 * @param radius 검색 반경 (미터, 기본 2000m)
 */
export async function searchRestaurants(
  query: string,
  x: number,
  y: number,
  radius: number = 2000
): Promise<KakaoPlace[]> {
  const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY

  if (!KAKAO_API_KEY) {
    throw new Error('KAKAO_REST_API_KEY is not set')
  }

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json')
  url.searchParams.append('query', query)
  url.searchParams.append('category_group_code', 'FD6') // 음식점 카테고리
  url.searchParams.append('x', x.toString())
  url.searchParams.append('y', y.toString())
  url.searchParams.append('radius', radius.toString())
  url.searchParams.append('sort', 'distance') // 거리순 정렬
  url.searchParams.append('size', '15') // 최대 15개 결과

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `KakaoAK ${KAKAO_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Kakao API error: ${response.status}`)
  }

  const data: KakaoSearchResponse = await response.json()
  return data.documents
}

/**
 * 카테고리에서 음식 종류 추출
 */
export function getCuisineFromCategory(category: string): string {
  if (category.includes('일식') || category.includes('초밥') || category.includes('라멘')) {
    return '일식'
  }
  if (category.includes('중식') || category.includes('중국집')) {
    return '중식'
  }
  if (category.includes('한식') || category.includes('한정식') || category.includes('고깃집')) {
    return '한식'
  }
  if (category.includes('양식') || category.includes('이탈리안') || category.includes('스테이크')) {
    return '양식'
  }
  if (category.includes('카페') || category.includes('디저트')) {
    return '카페/디저트'
  }
  if (category.includes('치킨') || category.includes('닭')) {
    return '치킨'
  }
  if (category.includes('피자')) {
    return '피자'
  }
  if (category.includes('인도') || category.includes('커리')) {
    return '인도식'
  }
  if (category.includes('멕시칸') || category.includes('타코')) {
    return '멕시코'
  }
  if (category.includes('베트남') || category.includes('쌀국수')) {
    return '베트남'
  }
  if (category.includes('태국')) {
    return '태국식'
  }
  return '기타'
}

/**
 * 거리 포맷팅 (미터 → km)
 */
export function formatDistance(meters: string): string {
  const m = parseInt(meters)
  if (isNaN(m)) return '알 수 없음'
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

/**
 * 가격대 추정 (카테고리 기반)
 */
export function estimatePriceRange(category: string): string {
  // 고급 레스토랑
  if (
    category.includes('고급') ||
    category.includes('한정식') ||
    category.includes('스테이크') ||
    category.includes('오마카세')
  ) {
    return '$$$'
  }

  // 중간 가격대
  if (
    category.includes('일식') ||
    category.includes('양식') ||
    category.includes('이탈리안') ||
    category.includes('중식') ||
    category.includes('뷔페')
  ) {
    return '$$'
  }

  // 저렴한 가격대
  return '$'
}

/**
 * 카테고리 기반 배지 생성
 */
export function generateBadges(
  category: string,
  distance: string,
  isFirst: boolean = false
): string[] {
  const badges: string[] = []

  // 첫 번째 결과는 AI 추천
  if (isFirst) {
    badges.push('AI 추천')
  }

  // 거리 기반
  const distanceNum = parseInt(distance)
  if (distanceNum <= 300) {
    badges.push('사무실 근처')
  }

  // 카테고리 기반
  if (
    category.includes('고급') ||
    category.includes('한정식') ||
    category.includes('오마카세')
  ) {
    badges.push('특별한 날')
  }

  if (
    category.includes('치킨') ||
    category.includes('피자') ||
    category.includes('중국집')
  ) {
    badges.push('가성비 최고')
  }

  return badges
}

/**
 * 카테고리 기반 식이 정보 추정
 */
export function estimateDietary(category: string): string[] {
  const dietary: string[] = []

  if (category.includes('채식') || category.includes('샐러드')) {
    dietary.push('채식주의')
    dietary.push('비건 옵션')
  }

  if (
    category.includes('일식') ||
    category.includes('양식') ||
    category.includes('샐러드')
  ) {
    dietary.push('글루텐 프리')
  }

  if (
    category.includes('고깃집') ||
    category.includes('삼겹살') ||
    category.includes('스테이크')
  ) {
    dietary.push('육식주의')
  }

  if (
    category.includes('인도') ||
    category.includes('태국') ||
    category.includes('매운')
  ) {
    dietary.push('매운맛')
  }

  // 기본값
  if (dietary.length === 0) {
    dietary.push('일반식')
  }

  return dietary
}

/**
 * 평점 추정 (실제로는 리뷰 API 필요)
 */
export function estimateRating(): number {
  // 4.0 ~ 4.9 사이의 랜덤 값
  return parseFloat((4.0 + Math.random() * 0.9).toFixed(1))
}
