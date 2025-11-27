'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'font-semibold inline-flex items-center justify-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0078D4] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-[#0078D4] text-white hover:bg-[#005A9E] hover:shadow-[0_6px_20px_rgba(0,120,212,0.4)] hover:-translate-y-[1px] shadow-[0_4px_12px_rgba(0,120,212,0.3)]',
      secondary: 'border border-[#DADDE1] text-[#1C1E21] hover:bg-[#F0F2F5]',
      tertiary: 'text-[#6B7280] hover:text-[#1C1E21] hover:bg-[#F0F2F5]'
    }
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm md:text-base',
      lg: 'px-6 md:px-8 py-2.5 md:py-3 text-sm md:text-base'
    }
    
    const shapes = {
      primary: 'rounded-full',
      secondary: 'rounded-lg',
      tertiary: 'rounded-lg'
    }
    
    const iconSpacing = {
      sm: 'gap-1.5',
      md: 'gap-2',
      lg: 'gap-2'
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          shapes[variant],
          icon && iconSpacing[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Convenience components for common button types
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="primary" {...props} />
)

PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />
)

SecondaryButton.displayName = 'SecondaryButton'

export const TertiaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="tertiary" {...props} />
)

TertiaryButton.displayName = 'TertiaryButton'
