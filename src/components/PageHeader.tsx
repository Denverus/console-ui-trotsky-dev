import type { ReactNode } from 'react'

/**
 * Standard page header for full-width console pages — matches the Dashboard's
 * title treatment (18px, tight tracking) so every page reads the same.
 * Place as the first child of a `p-7` page wrapper; it owns its bottom margin.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[18px] font-semibold leading-none tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
