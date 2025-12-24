"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, Upload, Save, History, Trophy, TrendingUp, Mail, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState("")

  // 로그인 확인
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  // 투표 히스토리 (실제로는 API에서 가져와야 함)
  const [voteHistory] = useState([
    {
      id: "1",
      restaurantName: "사쿠라 스시 하우스",
      cuisine: "일식",
      votedAt: new Date(Date.now() - 86400000 * 2),
      isWinner: true,
    },
    {
      id: "2",
      restaurantName: "서울 키친 BBQ",
      cuisine: "한식",
      votedAt: new Date(Date.now() - 86400000 * 5),
      isWinner: false,
    },
    {
      id: "3",
      restaurantName: "스파이스 루트",
      cuisine: "인도식",
      votedAt: new Date(Date.now() - 86400000 * 7),
      isWinner: true,
    },
  ])

  // 통계 (실제로는 API에서 가져와야 함)
  const stats = {
    totalVotes: voteHistory.length,
    winRate: (voteHistory.filter(v => v.isWinner).length / voteHistory.length * 100).toFixed(0),
    favoriteCuisine: "일식",
    streak: 3,
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarPreview) return

    setUploading(true)
    try {
      // 실제로는 여기서 서버에 업로드해야 함
      // const formData = new FormData()
      // formData.append('avatar', file)
      // await fetch('/api/upload-avatar', { method: 'POST', body: formData })

      // 임시로 로컬스토리지 업데이트
      const updatedUser = { ...user, avatar: avatarPreview }
      localStorage.setItem('biteengine_auth', JSON.stringify(updatedUser))

      setSuccess("프로필 사진이 업데이트되었습니다!")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 0) return "오늘"
    if (diff === 1) return "어제"
    if (diff < 7) return `${diff}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인으로 돌아가기
          </Button>

          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-4 border-primary/50">
              <AvatarImage src={avatarPreview || user.avatar} />
              <AvatarFallback className="text-2xl">{user.name[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                {user.role === 'admin' && (
                  <Badge variant="default" className="gap-1">
                    <Shield className="w-3 h-3" />
                    관리자
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">프로필 설정</TabsTrigger>
            <TabsTrigger value="history">투표 히스토리</TabsTrigger>
            <TabsTrigger value="stats">통계</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  프로필 사진 변경
                </CardTitle>
                <CardDescription>
                  새로운 프로필 사진을 업로드하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-500"
                  >
                    {success}
                  </motion.div>
                )}

                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={avatarPreview || user.avatar} />
                    <AvatarFallback className="text-4xl">{user.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col gap-2 w-full max-w-md">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {avatarPreview ? "다른 이미지 선택" : "이미지 선택"}
                        </span>
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </Label>

                    {avatarPreview && (
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={uploading}
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            업로드 중...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            저장하기
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-center text-muted-foreground max-w-md">
                    JPG, PNG 형식의 이미지를 업로드할 수 있습니다.
                    권장 크기: 400x400px 이상
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  계정 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">이름</Label>
                    <p className="text-foreground font-medium">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">이메일</Label>
                    <p className="text-foreground font-medium">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">역할</Label>
                    <p className="text-foreground font-medium">
                      {user.role === 'admin' ? '관리자' : '일반 사용자'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">가입일</Label>
                    <p className="text-foreground font-medium">2024년 12월</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  투표 히스토리
                </CardTitle>
                <CardDescription>
                  내가 투표한 레스토랑 목록입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {voteHistory.length > 0 ? (
                  <div className="space-y-3">
                    {voteHistory.map((vote, index) => (
                      <motion.div
                        key={vote.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            vote.isWinner ? 'bg-accent/20' : 'bg-muted'
                          }`}>
                            {vote.isWinner ? (
                              <Trophy className="w-6 h-6 text-accent" />
                            ) : (
                              <span className="text-2xl">{vote.cuisine[0]}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{vote.restaurantName}</p>
                              {vote.isWinner && (
                                <Badge variant="default" className="text-xs bg-accent">
                                  선정됨
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{vote.cuisine}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(vote.votedAt)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">아직 투표 기록이 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    투표 통계
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <p className="text-3xl font-bold text-primary">{stats.totalVotes}</p>
                      <p className="text-sm text-muted-foreground mt-1">총 투표 수</p>
                    </div>
                    <div className="text-center p-4 bg-accent/10 rounded-lg">
                      <p className="text-3xl font-bold text-accent">{stats.winRate}%</p>
                      <p className="text-sm text-muted-foreground mt-1">승률</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">가장 좋아하는 음식</p>
                      <p className="font-medium text-foreground">{stats.favoriteCuisine}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">연속 투표 기록</p>
                      <p className="font-medium text-foreground">{stats.streak}회</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    달성 업적
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
                      <Trophy className="w-8 h-8 text-accent" />
                      <div>
                        <p className="font-medium text-foreground">첫 투표</p>
                        <p className="text-xs text-muted-foreground">첫 번째 투표를 완료했습니다</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                      <Trophy className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">승리의 맛</p>
                        <p className="text-xs text-muted-foreground">투표한 레스토랑이 선정되었습니다</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-50">
                      <Trophy className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">열정적인 투표자</p>
                        <p className="text-xs text-muted-foreground">10회 투표 달성 (진행 중: {stats.totalVotes}/10)</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
