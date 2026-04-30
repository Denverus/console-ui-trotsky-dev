import { Link } from 'react-router-dom'
import { BarChart3, CreditCard, Mail, FileText, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ServiceDoc {
  id: 'analytics' | 'payments' | 'email' | 'logs'
  name: string
  description: string
  icon: typeof BarChart3
  color: string
  available: boolean
}

export const SERVICE_DOCS: ServiceDoc[] = [
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Track sessions, events, and funnels across your sites.',
    icon: BarChart3,
    color: '#6366f1',
    available: true,
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Stripe-backed checkout, subscriptions, and webhooks.',
    icon: CreditCard,
    color: '#10b981',
    available: false,
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Transactional email API wrapping Resend / SendGrid.',
    icon: Mail,
    color: '#f59e0b',
    available: false,
  },
  {
    id: 'logs',
    name: 'Logs',
    description: 'Structured log ingestion and search.',
    icon: FileText,
    color: '#06b6d4',
    available: false,
  },
]

export function Docs() {
  return (
    <div className="p-7 max-w-5xl">
      <div className="mb-7">
        <h1 className="text-[18px] font-semibold tracking-tight leading-none">Documentation</h1>
        <p className="text-[12.5px] text-muted-foreground mt-1.5">
          Integration guides for trotsky.dev console services.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SERVICE_DOCS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.id}
              to={`/app/docs/${s.id}`}
              className="group bg-card border border-border rounded-[10px] p-5 flex items-start gap-3.5 hover:border-foreground/30 transition-colors no-underline"
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `${s.color}15`,
                  border: `1px solid ${s.color}25`,
                  color: s.color,
                }}
              >
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-semibold text-foreground">{s.name}</h3>
                  {!s.available && (
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                      coming soon
                    </Badge>
                  )}
                </div>
                <p className="text-[12.5px] text-muted-foreground mt-1">{s.description}</p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
