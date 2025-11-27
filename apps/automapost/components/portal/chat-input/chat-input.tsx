'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Mic, ArrowUp, Loader2 } from 'lucide-react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onFilesSelected?: (files: FileList | null) => void
  placeholder?: string
  className?: string
  maxHeightPx?: number
  loading?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onFilesSelected,
  placeholder = 'Ask anything...',
  className,
  maxHeightPx = 160,
  loading = false,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const nextHeight = Math.min(el.scrollHeight, maxHeightPx)
    el.style.height = `${nextHeight}px`
    el.style.overflowY = el.scrollHeight > maxHeightPx ? 'auto' : 'hidden'
  }

  useEffect(() => {
    autoResize()
  }, [value])

  return (
    <div className={cn('bg-white rounded-full border border-[#DADDE1] flex items-center gap-2 pl-2 pr-2 py-1.5', className)}>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full hover:bg-[#F0F2F5] transition-colors cursor-pointer"
        aria-label="Add attachment"
      >
        <Plus className="w-5 h-5 text-[#1C1E21]" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => onFilesSelected?.(e.target.files)}
        className="hidden"
      />

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoResize}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={placeholder}
        className="min-h-[44px] max-h-40 overflow-y-auto resize-none border-0 bg-transparent focus-visible:ring-0 px-2"
      />

      <button
        onClick={() => { /* TODO: voice input */ }}
        className="p-2 rounded-full hover:bg-[#F0F2F5] transition-colors cursor-pointer"
        aria-label="Voice input"
      >
        <Mic className="w-5 h-5 text-[#1C1E21]" />
      </button>

      <button
        onClick={onSend}
        disabled={loading}
        className="h-11 w-11 aspect-square p-0 rounded-full bg-white text-[#1C1E21] border border-[#DADDE1] hover:bg-[#F8FAFC] flex items-center justify-center transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ArrowUp className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}


