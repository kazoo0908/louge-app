'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const [turnCount, setTurnCount] = useState(0)
  const [view, setView] = useState<'chat' | 'archive'>('chat')
  const [narratives, setNarratives] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [currentNarrative, setCurrentNarrative] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadNarratives()
    initChat()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth/login')
    }
  }

  const loadNarratives = async () => {
    const { data, error } = await supabase
      .from('narratives')
      .select('*')
      .order('date', { ascending: false })

    if (!error && data) {
      setNarratives(data)
    }
  }

  const initChat = async () => {
    const { data, error } = await supabase.from('narratives').select('*').limit(1)
    
    const greeting = data && data.length > 0
      ? "おかえりなさい。今日もあなたの物語を一緒に紡いでいきましょう。\n\n今日はどんな一日でしたか?"
      : "こんにちは。私はLouge、あなたの人生の物語を一緒に紡ぐパートナーです。\n\n今日という日を、後から振り返った時に思い出したくなるような物語にしていきましょう。\n\n今日を象徴する出来事や感じたことを教えていただけますか?"

    setMessages([{ role: 'assistant', content: greeting }])
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setTurnCount(prev => prev + 1)
    setTyping(true)

    // コンテキスト取得
    const recentNarratives = narratives.slice(0, 3)
    const context = recentNarratives
      .map(n => `${n.date}: ${n.title} - ${n.story_text.substring(0, 100)}...`)
      .join('\n')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          context,
        }),
      })

      const data = await response.json()
      setTyping(false)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Chat error:', error)
      setTyping(false)
    }
  }

  const handleFinish = async () => {
    if (turnCount === 0) {
      alert('まずはLougeと対話を始めてください。')
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation: messages }),
      })

      const data = await response.json()
      setCurrentNarrative(data.narrative)
      setGenerating(false)
      loadNarratives()
    } catch (error) {
      console.error('Narrative generation error:', error)
      setGenerating(false)
    }
  }

  const startNewStory = () => {
    setMessages([])
    setTurnCount(0)
    setCurrentNarrative(null)
    initChat()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (generating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium text-lg">
            あなたの今日の物語を紡いでいます...
          </p>
        </div>
      </div>
    )
  }

  if (currentNarrative) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentNarrative.title}
            </h2>
            <p className="text-sm text-gray-500">{currentNarrative.date}</p>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 leading-relaxed text-lg">
              {currentNarrative.story}
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-4">感情スコア</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(currentNarrative.emotions).map(([emotion, score]: [string, any]) => (
                <div key={emotion} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-16">{emotion}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full"
                      style={{ width: `${score * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-8">{score}</span>
                </div>
              ))}
            </div>
          </div>

          {currentNarrative.value_tags && currentNarrative.value_tags.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-600 mb-3">価値観タグ</h3>
              <div className="flex flex-wrap gap-2">
                {currentNarrative.value_tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={startNewStory}
            className="w-full mt-8 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            新しいストーリーを記録する
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ヘッダー */}
      <header className="text-center py-6 flex justify-between items-center">
        <div></div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Louge
          </h1>
          <p className="text-gray-600">あなただけの人生に、あなただけのストーリーを</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ログアウト
        </button>
      </header>

      {/* ナビゲーション */}
      <nav className="flex gap-4 mb-6 bg-white rounded-lg p-2 shadow-sm">
        <button
          onClick={() => setView('chat')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
            view === 'chat'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          今日の対話
        </button>
        <button
          onClick={() => setView('archive')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition ${
            view === 'archive'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          物語のアーカイブ
        </button>
      </nav>

      {/* チャットビュー */}
      {view === 'chat' && (
        <div className="space-y-4">
          {/* メッセージエリア */}
          <div className="bg-white rounded-lg shadow-lg p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg">
                    <div className="flex gap-1">
                      <span className="animate-pulse-dot">.</span>
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-pulse-dot" style={{ animationDelay: '0.4s' }}>.</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 入力エリア */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Lougeに話しかける..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:opacity-50"
              >
                送信
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm font-medium"
              >
                今日の対話を終える
              </button>
              <span className="text-xs text-gray-500 self-center">
                対話回数: {turnCount}/5
              </span>
            </div>
          </div>
        </div>
      )}

      {/* アーカイブビュー */}
      {view === 'archive' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">あなたの物語</h2>
            {narratives.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                まだ物語が記録されていません。
                <br />
                Lougeとの対話を始めましょう。
              </div>
            ) : (
              <div className="space-y-4">
                {narratives.map((narrative) => (
                  <div
                    key={narrative.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {narrative.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(narrative.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed line-clamp-3">
                      {narrative.story_text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
