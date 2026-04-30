import { Link } from 'react-router-dom'
import { ChevronLeft, Construction } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SERVICE_DOCS } from './Docs'

type StubServiceId = 'payments' | 'email' | 'logs'

const TEASER: Record<StubServiceId, string> = {
  payments:
    'Payments will wrap Stripe to give every console project a turnkey checkout, subscription lifecycle, and webhook handler — without each project re-implementing payment plumbing.',
  email:
    'Email will be a thin transactional API on top of Resend / SendGrid: send templated mail with retries, bounces, and delivery logs visible from the console.',
  logs:
    'Logs will accept structured JSON log lines from your services and let you search, filter, and tail them from the console — a lighter alternative to setting up your own ELK stack per project.',
}

export function DocsServiceStub({ serviceId }: { serviceId: StubServiceId }) {
  const meta = SERVICE_DOCS.find((s) => s.id === serviceId)
  if (!meta) return null
  const Icon = meta.icon

  return (
    <div className="p-7 max-w-3xl">
      <Link
        to="/app/docs"
        className="inline-flex items-center gap-1 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mb-4 no-underline"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        All docs
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `${meta.color}15`,
            border: `1px solid ${meta.color}25`,
            color: meta.color,
          }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <h1 className="text-[20px] font-semibold tracking-tight">{meta.name}</h1>
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
          coming soon
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-[10px] p-8 flex flex-col items-center text-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
        >
          <Construction className="h-6 w-6" />
        </div>
        <div className="text-[15px] font-semibold">Not available yet</div>
        <p className="text-[13px] text-muted-foreground max-w-md leading-relaxed">{TEASER[serviceId]}</p>
        <Link
          to="/app/docs"
          className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors mt-2 no-underline"
        >
          ← Back to all docs
        </Link>
      </div>
    </div>
  )
}
