import { useState, useEffect } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { BarChart3, RefreshCw, ArrowUpRight } from 'lucide-react'
import { analyticsApi } from '@/lib/api'
import { SessionsChart } from '@/components/charts/SessionsChart'
import { TopEventsChart } from '@/components/charts/TopEventsChart'
import { Sparkline } from '@/components/Sparkline'
import { cn } from '@/lib/utils'
import type { LayoutContext } from '@/components/Layout'
import { useAnalyticsInstances, type AnalyticsInstance } from '@/hooks/useAnalyticsInstances'

const ANALYTICS_COLOR = '#6366f1'

interface SessionStats {
  total: number
  byDay: { date: string; sessions: number }[]
}
interface EventStats {
  total: number
  topEvents: { eventName: string; count: number }[]
}
interface DurationStats {
  avg: number
  p50: number
  p90: number
  sampleSize: number
}

function ms(v: number): string {
  if (!v) return '—'
  if (v < 1000) return `${v}ms`
  const s = v / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

function Delta({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className="inline-flex items-center gap-px text-[11px] font-medium tabular-nums"
      style={{ color: up ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}
    >
      {up ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

function StatCard({
  label, value, delta, spark, loading, sub,
}: {
  label: string
  value: string
  delta?: number
  spark?: number[]
  loading: boolean
  sub?: string
}) {
  return (
    <div className="bg-card border border-border rounded-[10px] p-3.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        {delta != null && !loading && <Delta value={delta} />}
      </div>
      <div className="text-[22px] font-semibold tabular-nums tracking-tight leading-none">
        {loading ? <span className="text-muted-foreground">—</span> : value}
      </div>
      {sub && !loading && (
        <p className="text-[11px] text-muted-foreground tabular-nums">{sub}</p>
      )}
      {spark && spark.length > 1 && !loading && (
        <Sparkline data={spark} color={ANALYTICS_COLOR} width={100} height={24} />
      )}
    </div>
  )
}

function ServiceHealthRow({
  title, subtitle, total, spark, loading,
}: {
  title: string
  subtitle: string
  total: number | null
  spark: number[]
  loading: boolean
}) {
  return (
    <div
      className="bg-card border border-border rounded-[10px] p-4 flex items-center gap-4"
      style={{ transition: 'border-color .12s' }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border-strong))')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '')}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: `${ANALYTICS_COLOR}15`,
          border: `1px solid ${ANALYTICS_COLOR}25`,
          color: ANALYTICS_COLOR,
        }}
      >
        <BarChart3 className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold truncate">{title}</div>
        <div className="text-[11.5px] text-muted-foreground">{subtitle}</div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-[22px] font-semibold tabular-nums tracking-tight leading-none">
          {loading ? '—' : total != null ? total.toLocaleString() : '—'}
        </div>
        <div className="text-[11.5px] text-muted-foreground mt-0.5">sessions total</div>
      </div>

      {spark.length > 1 && !loading && (
        <Sparkline data={spark} color={ANALYTICS_COLOR} width={120} height={32} />
      )}

      <span
        className="inline-flex items-center gap-1 px-1.5 py-px rounded-full text-[11px] font-medium leading-[18px] shrink-0"
        style={{
          background: 'hsl(var(--success-bg))',
          color: 'hsl(var(--success))',
          border: '1px solid hsl(var(--success-border))',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        operational
      </span>
    </div>
  )
}

function PerInstanceHealthRow({
  companyId, instance,
}: {
  companyId: string
  instance: AnalyticsInstance
}) {
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!companyId) return
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ companyId, apiKeyIds: instance.id })
    analyticsApi
      .get(`/api/stats/sessions?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (!cancelled) setStats(s)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [companyId, instance.id])

  const spark = stats?.byDay.map((d) => d.sessions) ?? []
  return (
    <ServiceHealthRow
      title={instance.name}
      subtitle="Sessions, events, funnels"
      total={stats?.total ?? null}
      spark={spark}
      loading={loading}
    />
  )
}

function TimeRange({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = ['24h', '7d', '30d', '90d']
  return (
    <div
      className="inline-flex gap-0.5 p-[3px] rounded-[7px] border border-border"
      style={{ background: 'hsl(var(--muted))' }}
    >
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            'h-[22px] px-2.5 rounded-[5px] border-none text-[12px] font-medium cursor-pointer transition-all',
            value === o
              ? 'bg-card text-foreground shadow-sm'
              : 'bg-transparent text-muted-foreground hover:text-foreground',
          )}
          style={{ fontFamily: 'inherit' }}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

export function Dashboard() {
  const { companyId, company } = useOutletContext<LayoutContext>()
  const { instances } = useAnalyticsInstances(companyId)
  const [selectedInstanceId, setSelectedInstanceId] = useState('')
  const [sessions, setSessions] = useState<SessionStats | null>(null)
  const [events, setEvents] = useState<EventStats | null>(null)
  const [duration, setDuration] = useState<DurationStats | null>(null)
  const [range, setRange] = useState('7d')
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  // If selected instance was revoked / no longer present, fall back to "All"
  useEffect(() => {
    if (selectedInstanceId && !instances.some((i) => i.id === selectedInstanceId)) {
      setSelectedInstanceId('')
    }
  }, [instances, selectedInstanceId])

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    const params = new URLSearchParams({ companyId })
    if (selectedInstanceId) params.set('apiKeyIds', selectedInstanceId)
    const q = `?${params.toString()}`
    Promise.all([
      analyticsApi.get(`/api/stats/sessions${q}`).then((r) => r.ok ? r.json() : null),
      analyticsApi.get(`/api/stats/events${q}`).then((r) => r.ok ? r.json() : null),
      analyticsApi.get(`/api/stats/session-duration${q}`).then((r) => r.ok ? r.json() : null),
    ]).then(([s, e, d]) => {
      setSessions(s)
      setEvents(e)
      setDuration(d)
    }).finally(() => setLoading(false))
  }, [companyId, selectedInstanceId, tick])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const sessionSpark = sessions?.byDay.map((d) => d.sessions) ?? []

  return (
    <div className="p-7">
      {/* Section header */}
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight leading-none">{greeting}</h1>
          <p className="text-[12.5px] text-muted-foreground mt-1">
            {company
              ? `Here's how ${company.name} is doing across all services.`
              : 'Select a company to see analytics.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {instances.length > 0 && (
            <select
              value={selectedInstanceId}
              onChange={(e) => setSelectedInstanceId(e.target.value)}
              className="h-8 rounded-[7px] border border-border bg-card text-[13px] font-medium hover:bg-muted transition-colors px-2"
              style={{ fontFamily: 'inherit', cursor: 'pointer' }}
              title="Analytics instance"
            >
              <option value="">All instances</option>
              {instances.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          )}
          <TimeRange value={range} onChange={setRange} />
          <button
            onClick={() => setTick((v) => v + 1)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[7px] border border-border bg-card text-[13px] font-medium hover:bg-muted transition-colors"
            style={{ fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </button>
        </div>
      </div>

      {!companyId && (
        <p className="text-sm text-muted-foreground">No companies yet — <Link to="/companies" className="underline">create one</Link>.</p>
      )}

      {companyId && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Sessions"
              value={sessions?.total != null ? sessions.total.toLocaleString() : '—'}
              spark={sessionSpark}
              loading={loading}
            />
            <StatCard
              label="Events"
              value={events?.total != null ? events.total.toLocaleString() : '—'}
              spark={events?.topEvents.map((e) => e.count) ?? []}
              loading={loading}
            />
            <StatCard
              label="Avg session duration"
              value={duration ? ms(duration.avg) : '—'}
              sub={
                duration && duration.sampleSize > 0
                  ? `p50 ${ms(duration.p50)} · p90 ${ms(duration.p90)}`
                  : undefined
              }
              loading={loading}
            />
          </div>

          {/* Service health */}
          <div className="mt-7">
            <div className="flex items-end justify-between mb-3.5">
              <div>
                <div className="text-[14px] font-semibold">Service health</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Analytics · {selectedInstanceId
                    ? instances.find((i) => i.id === selectedInstanceId)?.name ?? '—'
                    : `${instances.length} instance${instances.length === 1 ? '' : 's'}`} · last 7 days
                </div>
              </div>
              <Link to="/analytics" className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors no-underline">
                View analytics →
              </Link>
            </div>

            {selectedInstanceId || instances.length === 0 ? (
              <ServiceHealthRow
                title={selectedInstanceId
                  ? instances.find((i) => i.id === selectedInstanceId)?.name ?? 'Analytics'
                  : 'Analytics'}
                subtitle="Sessions, events, funnels"
                total={sessions?.total ?? null}
                spark={sessionSpark}
                loading={loading}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {instances.map((inst) => (
                  <PerInstanceHealthRow key={inst.id} companyId={companyId} instance={inst} />
                ))}
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid gap-3 mt-5" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
            <div className="bg-card border border-border rounded-[10px] p-[18px]">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-[14px] font-semibold">Sessions over time</div>
                  <div className="text-[11.5px] text-muted-foreground mt-0.5">Last {range}</div>
                </div>
                <Link
                  to="/analytics"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              {sessions && sessions.byDay.length > 0 ? (
                <SessionsChart data={sessions.byDay} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No data yet'}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-[10px] p-[18px]">
              <div className="text-[14px] font-semibold mb-3.5">Top events</div>
              {events && events.topEvents.length > 0 ? (
                <TopEventsChart data={events.topEvents.slice(0, 8)} />
              ) : (
                <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No data yet'}
                </div>
              )}
            </div>
          </div>

          <div className="h-6" />
        </>
      )}
    </div>
  )
}
