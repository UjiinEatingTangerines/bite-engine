import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Vercel 빌드 시 환경 변수가 없을 경우를 대비한 처리
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다. 더미 클라이언트를 사용합니다.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
