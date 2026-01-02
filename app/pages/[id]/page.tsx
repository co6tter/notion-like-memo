'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePage, useUpdatePage, useDeletePage } from '@/hooks/use-pages'
import { TiptapEditor } from '@/components/editor/tiptap-editor'
import { useState, useRef } from 'react'
// import { useDebounce } from '@/hooks/use-debounce'
import { Trash2, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import { Page } from '@/lib/types'
import { JSONContent } from '@tiptap/react'

// Simple debounce hook implementation inline if not verified existing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return (...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

export default function PageDetail() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { data: page, isLoading, error } = usePage(id)
  const updatePage = useUpdatePage()
  const deletePage = useDeletePage()

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved')

  const debouncedUpdate = useDebouncedCallback((updates: Partial<Page>) => {
    setSaveStatus('saving')
    updatePage.mutate({ id, ...updates }, {
      onSuccess: () => {
        setSaveStatus('saved')
      },
      onError: () => {
        setSaveStatus('error')
      }
    })
  }, 1000)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    // Immediate feedback
    setSaveStatus('saving')
    debouncedUpdate({ title: newTitle })
  }

  const handleContentChange = (newContent: JSONContent) => {
    debouncedUpdate({ content: newContent })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this page?')) {
      deletePage.mutate(id, {
        onSuccess: () => router.push('/')
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-red-500">Failed to load page or not found.</div>
        <Link href="/" className="text-blue-500 hover:underline">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-3 border-b border-gray-100 flex-shrink-0 bg-white z-10">
         <div className="flex items-center gap-2 text-xs text-gray-500">
            {saveStatus === 'saving' && <span className="text-gray-400">Saving...</span>}
            {saveStatus === 'saved' && <span className="text-green-500 flex items-center gap-1"><Check className="w-3 h-3"/> Saved</span>}
            {saveStatus === 'error' && <span className="text-red-500">Save Failed</span>}
         </div>
         <button 
           onClick={handleDelete}
           className="text-gray-400 hover:text-red-500 transition-colors p-1"
           title="Delete Page"
         >
           <Trash2 className="w-4 h-4" />
         </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 pt-12 pb-24">
           {/* Title Input */}
           <input
             key={`title-${page.id}`}
             type="text"
             defaultValue={page.title || ''}
             onChange={handleTitleChange}
             placeholder="Untitled"
             className="w-full text-4xl font-bold placeholder:text-gray-300 border-none outline-none bg-transparent mb-4"
           />
           
           {/* Editor */}
             <TiptapEditor 
               content={page.content as unknown as JSONContent} 
               onChange={handleContentChange}
               key={`editor-${page.id}`} // Re-mount editor on page ID change to reset content
             />
        </div>
      </div>
    </div>
  )
}
