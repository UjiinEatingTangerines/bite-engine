"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, UserPlus, Shield, User, Mail, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsers, isAdmin, addUser, deleteUser } from "@/lib/allowed-users"
import type { AllowedUser } from "@/lib/allowed-users"

export default function UserManagementPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 사용자 목록 불러오기
  const fetchUsers = async () => {
    setLoading(true)
    const usersList = await getAllUsers()
    setUsers(usersList)
    setLoading(false)
  }

  // 관리자 권한 확인 및 사용자 목록 불러오기
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/")
      return
    }

    const checkAdmin = async () => {
      const adminStatus = await isAdmin(user.email)
      if (!adminStatus) {
        alert("관리자만 접근할 수 있습니다.")
        router.push("/")
        return
      }
      fetchUsers()
    }

    checkAdmin()
  }, [isAuthenticated, user, router])

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // 유효성 검사
    if (!newName.trim()) {
      setError("이름을 입력해주세요")
      return
    }

    if (!newEmail.trim()) {
      setError("이메일을 입력해주세요")
      return
    }

    if (!newEmail.includes("@")) {
      setError("올바른 이메일 형식이 아닙니다")
      return
    }

    // 중복 확인
    if (users.some(u => u.email.toLowerCase() === newEmail.toLowerCase())) {
      setError("이미 등록된 이메일입니다")
      return
    }

    setSubmitting(true)

    // Supabase에 사용자 추가
    const result = await addUser({
      name: newName.trim(),
      email: newEmail.trim(),
      role: 'user',
    })

    if (result.success) {
      setSuccess(`${newName} 사용자가 추가되었습니다!`)
      setNewName("")
      setNewEmail("")
      // 사용자 목록 새로고침
      fetchUsers()
    } else {
      setError(result.error || "사용자 추가에 실패했습니다")
    }

    setSubmitting(false)
  }

  const handleDeleteUser = async (email: string, name: string) => {
    if (!confirm(`${name} 사용자를 삭제하시겠습니까?`)) {
      return
    }

    const result = await deleteUser(email)

    if (result.success) {
      setSuccess(`${name} 사용자가 삭제되었습니다`)
      // 사용자 목록 새로고침
      fetchUsers()
    } else {
      setError(result.error || "사용자 삭제에 실패했습니다")
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
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

          <h1 className="text-3xl font-bold text-foreground mb-2">
            사용자 관리
          </h1>
          <p className="text-muted-foreground">
            BiteEngine 사용자를 추가하고 관리합니다
          </p>
        </div>

        {/* Add User Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              새 사용자 추가
            </CardTitle>
            <CardDescription>
              새로운 팀원을 BiteEngine에 등록합니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="space-y-4">
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

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-500"
                >
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="홍길동"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@skelectlink.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="pl-10"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    추가 중...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    사용자 추가
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-blue-500/80 bg-blue-500/10 border border-blue-500/20 rounded p-2">
                ✓ 사용자는 Supabase 데이터베이스에 영구적으로 저장됩니다
              </p>
            </form>
          </CardContent>
        </Card>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              등록된 사용자 ({users.length}명)
            </CardTitle>
            <CardDescription>
              현재 BiteEngine에 등록된 모든 사용자 목록입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-muted-foreground/30 mb-3 animate-spin" />
                <p className="text-sm text-muted-foreground">사용자 목록 로딩 중...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((u, index) => (
                  <motion.div
                    key={u.email}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        {u.role === 'admin' ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{u.name}</p>
                          {u.role === 'admin' && (
                            <Badge variant="default" className="text-xs">
                              관리자
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>

                    {u.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500"
                        onClick={() => handleDeleteUser(u.email, u.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">Supabase 데이터베이스 연동</p>
                <p className="text-muted-foreground">
                  모든 사용자 정보는 Supabase의 users 테이블에 저장됩니다.
                </p>
                <p className="text-muted-foreground text-xs">
                  추가된 사용자는 즉시 로그인할 수 있으며, 데이터는 영구적으로 보존됩니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
