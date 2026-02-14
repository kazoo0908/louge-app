import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* ヘッダー */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Louge
          </h1>
          <p className="text-2xl text-gray-700 font-medium">
            あなただけの人生に、あなただけのストーリーを
          </p>
          <p className="text-gray-600 max-w-2xl mx-auto">
            AI「Louge」との対話を通じ、日々の感情を「消費される記録」から「人生の資産（物語）」へ昇華させる
          </p>
        </div>

        {/* CTA */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium text-lg shadow-lg"
          >
            今日の物語を始める
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-lg shadow-lg border border-gray-200"
          >
            新規登録
          </Link>
        </div>

        {/* 特徴 */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              対話型ジャーナリング
            </h3>
            <p className="text-gray-600 text-sm">
              Lougeとの自然な対話を通じて、日々の出来事を深く掘り下げます
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              物語の自動生成
            </h3>
            <p className="text-gray-600 text-sm">
              あなたの一日を、美しい物語として再構成します
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              感情ジャーニー
            </h3>
            <p className="text-gray-600 text-sm">
              時間とともに変化する感情や価値観を可視化します
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-gray-500 text-sm mt-16">
          完全無料 • プライバシー保護 • データは全てあなたのもの
        </div>
      </div>
    </div>
  )
}
