import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Louge - あなただけの人生に、あなただけのストーリーを',
  description: 'AI「Louge」との対話を通じ、日々の感情を人生の資産へ昇華させる',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
