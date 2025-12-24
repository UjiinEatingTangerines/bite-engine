import { supabase } from '@/lib/supabase'

// 사용자 인터페이스
export interface AllowedUser {
  id?: string
  name: string
  email: string
  role: 'admin' | 'user'
  avatar?: string
}

// Supabase에서 모든 사용자 가져오기
export async function getAllUsers(): Promise<AllowedUser[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch users:', error)
    return []
  }

  return data || []
}

// 이메일로 사용자 확인
export async function isUserAllowed(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    return false
  }

  return !!data
}

// 이메일로 사용자 정보 가져오기
export async function getUserByEmail(email: string): Promise<AllowedUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single()

  if (error) {
    console.error('Failed to fetch user:', error)
    return null
  }

  return data
}

// 관리자 권한 확인
export async function isAdmin(email: string): Promise<boolean> {
  const user = await getUserByEmail(email)
  return user?.role === 'admin'
}

// 사용자 추가
export async function addUser(user: Omit<AllowedUser, 'id'>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('users')
    .insert([{
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role,
      avatar: user.avatar,
    }])

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 사용자 삭제
export async function deleteUser(email: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('email', email.toLowerCase())

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

// 사용자 업데이트
export async function updateUser(email: string, updates: Partial<AllowedUser>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email.toLowerCase())

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}
