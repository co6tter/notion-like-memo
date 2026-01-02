// import { Button } from '@/components/ui/button'
// I'll make a simple button inside or use standard HTML button styled with Tailwind.

import { FileText, Plus } from 'lucide-react'

interface EmptyStateProps {
  onCreateNew: () => void
  isCreating: boolean
}

export function EmptyState({ onCreateNew, isCreating }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-foreground/60">
      <FileText className="w-16 h-16 mb-4 text-foreground/20" />
      <h2 className="text-xl font-medium mb-2 text-foreground">No pages found</h2>
      <p className="mb-6 text-sm">Get started by creating a new page.</p>
      <button
        onClick={onCreateNew}
        disabled={isCreating}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {isCreating ? 'Creating...' : 'Create New Page'}
      </button>
    </div>
  )
}
