import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../global.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Chatbot Solutions - Automate Customer Communication | Save $43K+ Daily',
  description: 'Join 9,500+ SMBs automating customer communication with HIPAA-compliant AI chatbots. Start your free trial today.',
  openGraph: {
    title: 'AI Chatbot Solutions - Save $43K+ Daily',
    description: 'Join 9,500+ SMBs automating customer communication with HIPAA-compliant AI chatbots.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}