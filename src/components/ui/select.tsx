import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Styled native `<select>` matching the dense control system (height, radius,
 * 13px text). Use this instead of hand-rolling `<select className="h-9 …">`.
 */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-8 cursor-pointer rounded-control border border-input bg-card px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Select.displayName = 'Select'
