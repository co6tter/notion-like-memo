import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import QueryProvider from '@/components/query-provider'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Notion Like Memo',
  description: 'A simple Notion-like memo app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <QueryProvider>
           <div className="flex h-screen w-full bg-white text-gray-900">
             <Sidebar />
             <main className="flex-1 h-full overflow-hidden flex flex-col relative">
               {children}
             </main>
           </div>
        </QueryProvider>
      </body>
    </html>
  )
}
