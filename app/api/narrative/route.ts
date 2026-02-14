import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // 認証チェック
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { conversation } = await request.json()

  const conversationText = conversation
    .map((m: any) => `${m.role === 'user' ? 'ユーザー' : 'Louge'}: ${m.content}`)
    .join('\n')

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: `あなたは人生の物語を紡ぐストーリーテラーです。
今日の対話から、美しい物語を生成してください。

出力はJSON形式で以下の構造にしてください:
{
  "title": "物語のタイトル(15文字以内、詩的に)",
  "story": "200文字程度の物語。三人称または詩的表現で。その日の核心的な感情や出来事を捉える。",
  "emotions": {
    "喜び": 0-10の数値,
    "不安": 0-10の数値,
    "達成感": 0-10の数値,
    "葛藤": 0-10の数値,
    "感謝": 0-10の数値
  },
  "value_tags": ["価値観タグ1", "価値観タグ2"] (例: "挑戦", "家族愛", "成長")
}`,
        messages: [
          {
            role: 'user',
            content: `以下の対話から、今日の物語を生成してください:\n\n${conversationText}`,
          },
        ],
      }),
    })

    const data = await response.json()
    const narrativeText = data.content[0].text

    // JSONを抽出
    const jsonMatch = narrativeText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from narrative')
    }

    const narrative = JSON.parse(jsonMatch[0])

    // データベースに保存
    const today = new Date().toISOString().split('T')[0]

    // 会話を保存
    const { data: conversationData, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: session.user.id,
        date: today,
        messages: conversation,
      })
      .select()
      .single()

    if (convError) throw convError

    // ナラティブを保存
    const { data: narrativeData, error: narrativeError } = await supabase
      .from('narratives')
      .insert({
        user_id: session.user.id,
        conversation_id: conversationData.id,
        date: today,
        title: narrative.title,
        story_text: narrative.story,
        emotion_scores: narrative.emotions,
      })
      .select()
      .single()

    if (narrativeError) throw narrativeError

    // 価値観タグを保存・更新
    if (narrative.value_tags && narrative.value_tags.length > 0) {
      for (const tagName of narrative.value_tags) {
        // タグが存在するか確認
        const { data: existingTag } = await supabase
          .from('value_tags')
          .select()
          .eq('user_id', session.user.id)
          .eq('tag_name', tagName)
          .single()

        if (existingTag) {
          // 頻度を更新
          await supabase
            .from('value_tags')
            .update({ frequency: existingTag.frequency + 1 })
            .eq('id', existingTag.id)

          // ナラティブとタグを関連付け
          await supabase.from('narrative_tags').insert({
            narrative_id: narrativeData.id,
            tag_id: existingTag.id,
          })
        } else {
          // 新しいタグを作成
          const { data: newTag } = await supabase
            .from('value_tags')
            .insert({
              user_id: session.user.id,
              tag_name: tagName,
              first_appeared: today,
            })
            .select()
            .single()

          if (newTag) {
            await supabase.from('narrative_tags').insert({
              narrative_id: narrativeData.id,
              tag_id: newTag.id,
            })
          }
        }
      }
    }

    return NextResponse.json({
      narrative: {
        ...narrative,
        date: today,
        id: narrativeData.id,
      },
    })
  } catch (error) {
    console.error('Narrative Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    )
  }
}
