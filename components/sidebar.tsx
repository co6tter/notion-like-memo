'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Plus, Search, FileText, LogOut } from 'lucide-react'
import { usePages, useCreatePage } from '@/hooks/use-pages'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
// import { formatDistanceToNow } from 'date-fns'
// I didn't install date-fns. I'll use simple JS Date for now.

export function Sidebar() {
  const [search, setSearch] = useState('')
  const { data: pages, isLoading } = usePages(search)

  // Deduplicate pages by ID to prevent "duplicate key" errors
  const uniquePages = pages?.filter((page, index, self) => 
    index === self.findIndex((t) => (
      t.id === page.id
    ))
  ) || []

  const createPage = useCreatePage()
  // const deletePage = useDeletePage() // For sidebar delete option (optional)
  const router = useRouter()
  const params = useParams()
  const activeId = params.id as string

  const handleCreate = () => {
    createPage.mutate('Untitled', {
      onSuccess: (page) => {
        router.push(`/pages/${page.id}`)
      }
    })
  }

  return (
    <aside className="w-64 border-r border-gray-200 h-screen flex flex-col bg-gray-50 flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
           {/* Logo / Brand */}
           <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center text-white font-bold text-xs">M</div>
           <span className="font-semibold text-sm">Memo App</span>
        </div>
        <button
          onClick={handleCreate}
          disabled={createPage.isPending}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-100 text-sm py-1.5 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>
      
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1.5 text-sm bg-gray-100 border-none rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
           <div className="text-xs text-gray-400 text-center py-4">Loading...</div>
        ) : uniquePages.length === 0 ? (
           <div className="text-xs text-gray-400 text-center py-4">No pages</div>
        ) : (
          <div className="space-y-0.5">
            {uniquePages.map((page) => (
              <Link
                key={page.id}
                href={`/pages/${page.id}`}
                className={cn(
                  "block px-3 py-2 rounded-md text-sm group relative hover:bg-gray-200 transition-colors",
                  activeId === page.id ? "bg-gray-200 font-medium text-black" : "text-gray-600"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 flex-shrink-0 text-gray-400" />
                  <span className="truncate flex-1">{page.title || 'Untitled'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.refresh()
            router.replace('/login')
          }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
