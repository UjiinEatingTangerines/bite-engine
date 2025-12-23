"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Search, CheckCircle2, XCircle, Info } from "lucide-react"

export default function AdminPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    count: number
    totalFound?: number
    duplicates?: number
    message?: string
  } | null>(null)

  // 회사 위치 (예: 강남역 - 실제 회사 위치로 변경)
  const COMPANY_LAT = 37.4979
  const COMPANY_LNG = 127.0276
  const COMPANY_NAME = "강남역"

  const handleSearch = async () => {
    if (!query.trim()) {
      alert("검색어를 입력해주세요!")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/search-restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          companyLat: COMPANY_LAT,
          companyLng: COMPANY_LNG,
          radius: 2000, // 2km 반경
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "검색 실패")
      }

      setResult(data)

      // 성공 시 검색어 초기화
      if (data.count > 0) {
        setQuery("")
      }
    } catch (error) {
      console.error("Search error:", error)
      setResult({
        success: false,
        count: 0,
        message: error instanceof Error ? error.message : "검색 중 오류가 발생했습니다",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSearch()
    }
  }

  const exampleQueries = [
    { query: `${COMPANY_NAME} 일식`, description: "일식당" },
    { query: `${COMPANY_NAME} 한식`, description: "한식당" },
    { query: `${COMPANY_NAME} 맛집`, description: "전체 맛집" },
    { query: `${COMPANY_NAME} 회식`, description: "회식 장소" },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            레스토랑 자동 추가
          </h1>
          <p className="text-muted-foreground">
            카카오 로컬 API를 사용해서 주변 맛집을 자동으로 추가합니다
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              레스토랑 검색
            </CardTitle>
            <CardDescription>
              현재 위치: {COMPANY_NAME} (반경 2km 이내)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="search">검색어</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="예: 강남역 일식, 삼성역 맛집"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading || !query.trim()}>
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      검색 중...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      검색
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Example Queries */}
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                빠른 검색
              </Label>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example) => (
                  <Button
                    key={example.query}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(example.query)}
                    disabled={loading}
                  >
                    {example.description}
                  </Button>
                ))}
              </div>
            </div>

            {/* Result Alert */}
            {result && (
              <Alert
                className={
                  result.success && result.count > 0
                    ? "border-green-500 bg-green-500/10"
                    : result.success && result.count === 0
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-red-500 bg-red-500/10"
                }
              >
                {result.success && result.count > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : result.success ? (
                  <Info className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription>
                  {result.success && result.count > 0 ? (
                    <>
                      <strong>{result.count}개</strong> 레스토랑이 추가되었습니다!
                      {result.totalFound && result.duplicates ? (
                        <span className="text-sm text-muted-foreground ml-2">
                          (총 {result.totalFound}개 검색, {result.duplicates}개 중복 제외)
                        </span>
                      ) : null}
                    </>
                  ) : (
                    result.message || "알 수 없는 오류"
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 사용 팁</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <ul className="list-disc ml-4 space-y-1">
                <li>구체적인 검색어 사용 (예: "강남역 초밥")</li>
                <li>한 번에 최대 15개 레스토랑 검색</li>
                <li>중복된 레스토랑은 자동으로 제외됩니다</li>
                <li>반경 2km 이내 레스토랑만 검색됩니다</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📍 위치 정보</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>기준 위치: {COMPANY_NAME}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                위도: {COMPANY_LAT.toFixed(4)} / 경도: {COMPANY_LNG.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground">
                위치 변경: 코드에서 COMPANY_LAT, COMPANY_LNG 수정
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <a href="/">← 메인 페이지로 돌아가기</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
