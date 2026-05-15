/**
 * Per-service accent colors — the single source of truth for JS-consumed
 * colors (Recharts series, inline SVG/gradients, `${color}15` tints) that
 * can't be expressed as Tailwind classes. Do not redeclare these literals
 * inside pages; import from here.
 */
export const SERVICE_ACCENT = {
  analytics: '#6366f1',
  payments: '#10b981',
  email: '#f59e0b',
  logs: '#06b6d4',
} as const

export type ServiceId = keyof typeof SERVICE_ACCENT

/** Convenience alias — the analytics service is the dense UI's primary accent. */
export const ANALYTICS_ACCENT = SERVICE_ACCENT.analytics
