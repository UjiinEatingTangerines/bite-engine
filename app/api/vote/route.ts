import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, userAvatar, restaurantId, restaurantName } =
      await request.json()

    // 기존 투표 삭제 (투표 변경)
    await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)

    // 새 투표 추가
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        restaurant_id: restaurantId,
      })
      .select()
      .single()

    if (voteError) throw voteError

    // 활동 로그 추가
    const { error: activityError } = await supabase
      .from('vote_activities')
      .insert({
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        action: '에 투표했습니다',
        restaurant_id: restaurantId,
        restaurant_name: restaurantName,
      })

    if (activityError) throw activityError

    return NextResponse.json({ success: true, vote })
  } catch (error) {
    console.error('Error voting:', error)
    return NextResponse.json(
      { error: 'Failed to vote' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json()

    await supabase
      .from('votes')
      .delete()
      .eq('user_id', userId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vote:', error)
    return NextResponse.json(
      { error: 'Failed to delete vote' },
      { status: 500 }
    )
  }
}
