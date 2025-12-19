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
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <Sidebar />
          <main className="flex-1 ml-64 flex flex-col overflow-hidden">
            <HeaderBar />
            <div className="flex-1 overflow-y-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}

