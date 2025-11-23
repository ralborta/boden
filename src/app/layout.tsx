import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import HeaderBar from '@/components/HeaderBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Boden CRM',
  description: 'CRM y Panel de Control para Chatbot de IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-background-light">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-y-auto">
            <HeaderBar />
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

