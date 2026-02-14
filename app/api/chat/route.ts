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

  const { messages, context } = await request.json()

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
        system: `あなたは「Louge」という名の人生記録AIです。ユーザーとの対話を通じて、日々の出来事を深く掘り下げます。

【あなたの役割】
- 共感的で温かいトーンで対話する
- ユーザーの感情や価値観を引き出す質問をする
- 3〜5往復で今日の核心的な出来事を理解する
- 過度に励まさず、傾聴に徹する

【過去の物語コンテキスト】
${context || 'まだ物語は記録されていません'}

【対話のガイドライン】
- 1回の返答は2-3文程度に抑える
- オープンエンドな質問を使う
- ユーザーの言葉を繰り返して共感を示す
- 日本語で自然に対話する`,
        messages: messages,
      }),
    })

    const data = await response.json()
    return NextResponse.json({ message: data.content[0].text })
  } catch (error) {
    console.error('Claude API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
