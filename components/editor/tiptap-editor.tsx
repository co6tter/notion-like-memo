'use client'

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

interface TiptapEditorProps {
  content: JSONContent | null
  onChange: (content: JSONContent) => void
  editable?: boolean
  className?: string
}

export function TiptapEditor({ content, onChange, editable = true, className }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Write something ...',
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:h-0 before:pointer-events-none',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON())
    },
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-stone dark:prose-invert max-w-none focus:outline-none min-h-[500px] px-8 py-4',
          className
        ),
      },
    },
    immediatelyRender: false, // Fix hydration mismatch in some cases
  })

  // We do NOT seek to update content from props after init unless key changes from parent remounting.
  // The parent handles key.
  
  return (
    <div className="w-full max-w-4xl mx-auto cursor-text" onClick={() => editor?.chain().focus().run()}>
      <EditorContent editor={editor} />
    </div>
  )
}
