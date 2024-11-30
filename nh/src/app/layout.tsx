import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WheatChain Airdrop | Participate and Earn SWHIT Tokens',
  description: 'Join the WheatChain (Wheat-Sol) airdrop event. Participate in tasks, earn SWHIT tokens, and be part of a sustainable blockchain revolution.',
  openGraph: {
    title: 'WheatChain Airdrop | Earn SWHIT Tokens',
    description: 'Participate in the WheatChain airdrop. Complete tasks, earn SWHIT tokens, and join a community focused on sustainable blockchain innovation.',
    url: 'https://swhit-g.vercel.app',
    siteName: 'WheatChain Airdrop',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WheatChain Airdrop - Earn SWHIT Tokens'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join WheatChain Airdrop: Earn SWHIT Tokens',
    description: 'Participate in tasks, earn SWHIT tokens, and be part of WheatChain's sustainable blockchain ecosystem. Join the airdrop now!',
    images: ['/og-image.png'],
  },
  keywords: ['WheatChain', 'Wheat-Sol', 'SWHIT token', 'airdrop', 'blockchain', 'sustainability', 'token distribution', 'community participation'],
  authors: [{ name: 'WheatChain Team' }],
  category: 'Cryptocurrency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

