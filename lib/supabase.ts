import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 빌드 타임에는 placeholder 사용, 런타임에는 실제 값 필요
const isBuildTime = process.env.NODE_ENV === 'production' && !supabaseUrl

if (!isBuildTime && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    'Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
