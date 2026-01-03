import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'جسر الملاك | Jisr Al-Mulak',
  description: 'منصة ذكية تربط رواد الأعمال مع المستثمرين الملاك',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}

