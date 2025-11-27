'use client'

import { Trash2, Image, Images, FileText, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SecondaryButton } from '../button/button'

interface PostListItemProps {
  platform: {
    name: string
    icon: React.ReactNode
    color: string
    bgColor: string
  }
  timeAgo: string
  content: string
  media?: {
    type: 'image' | 'images' | 'article'
    count: number
  }
  characterCount: number
  onEdit?: () => void
  onDelete?: () => void
  onSchedule?: () => void
  onContinueEditing?: () => void
  editButtonText?: string
  status?: string
}

export function PostListItem({
  platform,
  timeAgo,
  content,
  media,
  characterCount,
  onEdit,
  onDelete,
  onSchedule,
  editButtonText = "Edit",
  status = "DRAFT"
}: PostListItemProps) {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return {
          text: 'Scheduled',
          bgColor: 'bg-[#EBF4FF]',
          textColor: 'text-[#0078D4]'
        }
      case 'DRAFT':
        return {
          text: 'Draft',
          bgColor: 'bg-[#EBF4FF]',
          textColor: 'text-[#0078D4]'
        }
      case 'PENDING_APPROVAL':
        return {
          text: 'Pending',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600'
        }
      case 'SENT':
        return {
          text: 'Published',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600'
        }
      default:
        return {
          text: 'Draft',
          bgColor: 'bg-[#EBF4FF]',
          textColor: 'text-[#0078D4]'
        }
    }
  }

  const statusDisplay = getStatusDisplay(status)

  return (
    <div 
      className="bg-white rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-[#DADDE1] p-6 transition-all hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] hover:-translate-y-1 cursor-pointer group"
      onClick={onEdit}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", platform.bgColor)}>
            <span className={platform.color}>{platform.icon}</span>
          </div>
          <div>
            <h4 className="font-semibold text-[#1C1E21]">{platform.name}</h4>
            <p className="text-sm text-[#6B7280]">{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-[#1C1E21] mb-3">{content}</p>
        <div className="flex items-center space-x-4 text-sm text-[#6B7280]">
          {media && (
            <span className="flex items-center space-x-1">
              {media.type === 'image' && <Image className="w-4 h-4" />}
              {media.type === 'images' && <Images className="w-4 h-4" />}
              {media.type === 'article' && <FileText className="w-4 h-4" />}
              <span>
                {media.count} {media.type === 'article' ? 'Article draft' : media.count === 1 ? 'image' : 'images'}
              </span>
            </span>
          )}
          <span className="flex items-center space-x-1">
            <Type className="w-4 h-4" />
            <span>{characterCount} characters</span>
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-[#DADDE1]">
        <div className="flex items-center space-x-3">
          <SecondaryButton
            onClick={(e) => {
              e.stopPropagation()
              onSchedule?.()
            }}
            size="md"
          >
            {editButtonText}
          </SecondaryButton>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusDisplay.bgColor} ${statusDisplay.textColor}`}>
          {statusDisplay.text}
        </span>
      </div>
    </div>
  )
}