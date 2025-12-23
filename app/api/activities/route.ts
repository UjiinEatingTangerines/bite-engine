import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from('vote_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    // 데이터 형식을 프론트엔드에 맞게 변환
    const formattedActivities = (activities || []).map((activity) => ({
      id: activity.id,
      user: activity.user_name,
      avatar: activity.user_avatar || '/placeholder.svg',
      action: activity.action,
      restaurant: activity.restaurant_name,
      timestamp: new Date(activity.created_at),
    }))

    return NextResponse.json(formattedActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
