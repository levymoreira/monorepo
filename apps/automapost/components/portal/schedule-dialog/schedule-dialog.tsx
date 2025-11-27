'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Check, X, Calendar as CalendarIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { PrimaryButton, TertiaryButton } from '@/components/portal/button/button'

interface ScheduleDialogProps {
  scheduledTo: Date
  onScheduleChange: (date: Date) => void
  formattedDate: string
}

export function ScheduleDialog({ scheduledTo, onScheduleChange, formattedDate }: ScheduleDialogProps) {
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isMobileDialogOpen, setIsMobileDialogOpen] = useState(false)
  const [tempDate, setTempDate] = useState(scheduledTo)
  const [tempTimeString, setTempTimeString] = useState(() => format(scheduledTo, 'HH:mm'))
  const [isMobile, setIsMobile] = useState(false)

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleTriggerClick = () => {
    if (isMobile) {
      setIsMobileDialogOpen(true)
      setTempDate(scheduledTo)
      setTempTimeString(format(scheduledTo, 'HH:mm'))
    } else {
      setIsDateOpen(true)
    }
  }

  const handleApply = () => {
    // Combine date and time
    const [hours, minutes] = tempTimeString.split(':').map(Number)
    const newDateTime = new Date(tempDate)
    newDateTime.setHours(hours, minutes, 0, 0)
    
    onScheduleChange(newDateTime)
    
    if (isMobile) {
      setIsMobileDialogOpen(false)
    } else {
      setIsDateOpen(false)
    }
  }

  const handleCancel = () => {
    if (isMobile) {
      setIsMobileDialogOpen(false)
    } else {
      setIsDateOpen(false)
    }
  }

  return (
    <>
      {/* Desktop Popover */}
      <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
        <PopoverTrigger asChild>
          <button 
            className="text-xs text-[#0078D4] hover:underline inline-flex items-center gap-1 cursor-pointer"
            onClick={handleTriggerClick}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formattedDate} - Edit</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-4 bg-white">
          <div className="flex flex-col md:flex-row gap-4">
            <Calendar 
              mode="single" 
              selected={tempDate} 
              onSelect={(d) => d && setTempDate(d)} 
              initialFocus 
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#1C1E21]">Time</label>
              <Input
                type="time"
                value={tempTimeString}
                onChange={(e) => setTempTimeString(e.target.value)}
                className="w-36"
              />
              <div className="flex gap-2 mt-2">
                <PrimaryButton size="md" onClick={handleApply} icon={<Check className="w-4 h-4" />}>
                  Apply
                </PrimaryButton>
                <TertiaryButton size="md" onClick={handleCancel} icon={<X className="w-4 h-4" />}>
                  Cancel
                </TertiaryButton>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Mobile Fullscreen Dialog */}
      <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
        <DialogContent className="w-full max-w-none h-full max-h-none m-0 rounded-none p-0 gap-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-4 py-3 border-b border-[#DADDE1] flex-shrink-0">
              <DialogTitle className="text-lg font-semibold text-[#1C1E21]">
                Schedule Post
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto">
              <div className="flex-1 flex items-center justify-center">
                <Calendar 
                  mode="single" 
                  selected={tempDate} 
                  onSelect={(d) => d && setTempDate(d)} 
                  initialFocus
                  className="w-full max-w-sm"
                />
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-base font-medium text-[#1C1E21]">Select Time</label>
                <Input
                  type="time"
                  value={tempTimeString}
                  onChange={(e) => setTempTimeString(e.target.value)}
                  className="w-full h-12 text-base"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t border-[#DADDE1] flex-shrink-0">
              <TertiaryButton 
                size="lg" 
                onClick={handleCancel} 
                className="flex-1"
                icon={<X className="w-4 h-4" />}
              >
                Cancel
              </TertiaryButton>
              <PrimaryButton 
                size="lg" 
                onClick={handleApply} 
                className="flex-1"
                icon={<Check className="w-4 h-4" />}
              >
                Apply
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}