'use client'

import { useCreatePage } from '@/hooks/use-pages'
import { EmptyState } from '@/components/empty-state'
import { useRouter } from 'next/navigation'

export default function Home() {
  const createPage = useCreatePage()
  const router = useRouter()

  // Optional: Redirect to most recent page if exists?
  // Notion usually remembers. For MVP, maybe just show empty or list.
  // Docs said "Home / Pages List (Sidebar + Empty State)".
  // So we show Empty State or "Select a page from sidebar".
  
  const handleCreate = () => {
    createPage.mutate('Untitled', {
      onSuccess: (page) => {
        router.push(`/pages/${page.id}`)
      }
    })
  }

  // If we wanted to auto-redirect:
  /*
  useEffect(() => {
    if (!isLoading && pages && pages.length > 0) {
      router.replace(`/pages/${pages[0].id}`)
    }
  }, [pages, isLoading, router])
  */

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white">
      <EmptyState onCreateNew={handleCreate} isCreating={createPage.isPending} />
    </div>
  )
}
