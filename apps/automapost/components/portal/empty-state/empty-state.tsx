'use client'

import { CalendarPlus, Sparkles, Upload, Clock, Wand2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PrimaryButton } from '../button/button'

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }>
  className?: string
}

export function EmptyState({
  title,
  description,
  icon = <CalendarPlus className="w-16 h-16 text-[#0078D4]" />,
  primaryAction,
  secondaryActions,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      "bg-white rounded-2xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-[#DADDE1] p-4 md:p-12 text-center mx-0",
      className
    )}>
      <div className="max-w-md mx-auto">
        {/* Illustration */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-[#EBF4FF] rounded-full flex items-center justify-center animate-float">
            {icon}
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-[#1C1E21] mb-4">
          {title}
        </h3>
        <p className="text-sm md:text-base text-[#6B7280] mb-6 md:mb-8 leading-relaxed">
          {description}
        </p>
        
        {primaryAction && (
          <PrimaryButton
            onClick={primaryAction.onClick}
            icon={primaryAction.icon || <Sparkles className="w-4 md:w-5 h-4 md:h-5" />}
            size="lg"
          >
            {primaryAction.label}
          </PrimaryButton>
        )}
        
        {secondaryActions && secondaryActions.length > 0 && (
          <div className="mt-8 pt-8 border-t border-[#DADDE1]">
            <p className="text-sm text-[#6B7280] mb-4 font-medium">Quick Actions</p>
            <div className="flex flex-col md:flex-row items-center justify-center space-y-3 md:space-y-0 md:space-x-4">
              {secondaryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="text-xs md:text-sm text-[#6B7280] hover:text-[#0078D4] hover:bg-[#F0F2F5] flex items-center space-x-2 rounded-xl px-3 py-2 transition-all font-medium cursor-pointer"
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function QueueEmptyState({ onSchedulePost }: { onSchedulePost?: () => void }) {
  return (
    <EmptyState
      title="Your queue is empty"
      description="Start scheduling posts to keep your social media presence active and engaging. Use our AI-powered tools to create compelling content in seconds."
      primaryAction={onSchedulePost ? {
        label: "Schedule Your First Post",
        onClick: onSchedulePost,
        icon: <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
      } : undefined}
      secondaryActions={[
        {
          label: "Import Content",
          onClick: () => console.log('Import content'),
          icon: <Upload className="w-4 h-4" />
        },
        {
          label: "Set Posting Schedule",
          onClick: () => console.log('Set schedule'),
          icon: <Clock className="w-4 h-4" />
        },
        {
          label: "AI Content Ideas",
          onClick: () => console.log('AI ideas'),
          icon: <Wand2 className="w-4 h-4" />
        }
      ]}
    />
  )
}
