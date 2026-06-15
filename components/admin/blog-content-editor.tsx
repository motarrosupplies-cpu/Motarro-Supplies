'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, Loader2 } from 'lucide-react'

interface BlogContentEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function BlogContentEditor({ value, onChange, placeholder }: BlogContentEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: { class: 'rounded-lg max-w-full h-auto' },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none min-h-[200px] px-3 py-2 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      const current = editor.getHTML()
      if (value !== current) {
        editor.commands.setContent(value || '', false)
      }
    }
  }, [value, editor])

  const handleInsertImage = useCallback(async () => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files?.length || !editor) return
      setUploading(true)
      try {
        const formData = new FormData()
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i])
        }
        const res = await fetch('/api/upload/blog', { method: 'POST', body: formData })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || 'Upload failed')
        }
        const data = await res.json()
        const urls = data.results?.map((r: { url: string }) => r.url) ?? data.urls ?? []
        for (const url of urls) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      } catch (err) {
        console.error('Image upload failed:', err)
      } finally {
        setUploading(false)
        if (e.target) e.target.value = ''
      }
    },
    [editor]
  )

  if (!editor) {
    return (
      <div className="min-h-[200px] border rounded-md bg-muted/30 flex items-center justify-center text-muted-foreground">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="border rounded-md bg-background">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleInsertImage}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span className="ml-1.5">Insert image</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
