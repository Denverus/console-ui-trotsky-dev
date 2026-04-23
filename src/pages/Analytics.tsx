import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { LayoutDashboard, Zap, Clock, Filter, Settings, Globe, Download } from 'lucide-react'
import { analyticsApi } from '@/lib/api'
import { SessionsChart } from '@/components/charts/SessionsChart'
import { TopEventsChart } from '@/components/charts/TopEventsChart'
import { Sparkline } from '@/components/Sparkline'
import { cn } from '@/lib/utils'
import type { LayoutContext } from '@/components/Layout'

const COLOR = '#6366f1'

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

function StatCard({ label, value, delta, spark, sub, loading }: {
  label: string
  value: string
  delta?: number
  spark?: number[]
  sub?: string
  loading: boolean
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
        <Sparkline data={spark} color={COLOR} width={100} height={24} />
      )}
    </div>
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

const SUB_NAV = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'events',    label: 'Events',    icon: Zap },
  { id: 'sessions',  label: 'Sessions',  icon: Clock },
  { id: 'settings',  label: 'Settings',  icon: Settings },
]

export function Analytics() {
  const { companyId } = useOutletContext<LayoutContext>()
  const [tab, setTab] = useState('overview')
  const [range, setRange] = useState('7d')
  const [sessions, setSessions] = useState<SessionStats | null>(null)
  const [events, setEvents] = useState<EventStats | null>(null)
  const [duration, setDuration] = useState<DurationStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!companyId) return
    setLoading(true)
    const q = `?companyId=${companyId}`
    Promise.all([
      analyticsApi.get(`/api/stats/sessions${q}`).then((r) => r.ok ? r.json() : null),
      analyticsApi.get(`/api/stats/events${q}`).then((r) => r.ok ? r.json() : null),
      analyticsApi.get(`/api/stats/session-duration${q}`).then((r) => r.ok ? r.json() : null),
    ]).then(([s, e, d]) => {
      setSessions(s)
      setEvents(e)
      setDuration(d)
    }).finally(() => setLoading(false))
  }, [companyId])

  const sessionSpark = sessions?.byDay.map((d) => d.sessions) ?? []

  return (
    <div className="flex h-full min-h-0">
      {/* Analytics sub-nav */}
      <div
        className="flex-none border-r border-border bg-card flex flex-col"
        style={{ width: 180 }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `${COLOR}15`, border: `1px solid ${COLOR}25`, color: COLOR }}
          >
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[13px] font-semibold">Analytics</div>
            <div className="text-[10.5px] text-muted-foreground">connected</div>
          </div>
        </div>

        <div className="flex flex-col gap-0.5 p-2 pt-2">
          {SUB_NAV.map((s) => {
            const Icon = s.icon
            const active = tab === s.id
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-2 py-[6px] rounded-md transition-colors text-left',
                  active
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                style={{ fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: active ? undefined : 'transparent' }}
              >
                <Icon className="h-[14px] w-[14px] shrink-0" />
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Filter bar */}
        <div className="flex items-center gap-2.5 px-6 py-3 border-b border-border bg-card shrink-0">
          <div className="text-[14px] font-semibold capitalize">{tab}</div>
          <div className="flex-1" />
          <button
            className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[6px] border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <Filter className="h-3 w-3 text-muted-foreground" />
            Segment: all users
          </button>
          <button
            className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[6px] border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <Globe className="h-3 w-3 text-muted-foreground" />
            All countries
          </button>
          <TimeRange value={range} onChange={setRange} />
          <button
            className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-[6px] border border-border bg-card text-[12.5px] font-medium text-foreground hover:bg-muted transition-colors"
            style={{ fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <Download className="h-3 w-3 text-muted-foreground" />
            Export
          </button>
        </div>

        {/* Tab content */}
        {!companyId ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Select a company to view analytics.
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-3">
            {/* Overview tab */}
            {tab === 'overview' && (
              <>
                <div className="grid grid-cols-4 gap-3">
                  <StatCard
                    label="Sessions"
                    value={sessions?.total != null ? sessions.total.toLocaleString() : '—'}
                    delta={sessions?.total ? 8.4 : undefined}
                    spark={sessionSpark}
                    loading={loading}
                  />
                  <StatCard
                    label="Events"
                    value={events?.total != null ? events.total.toLocaleString() : '—'}
                    delta={events?.total ? 12.1 : undefined}
                    loading={loading}
                  />
                  <StatCard
                    label="Unique sessions"
                    value={sessions?.byDay.length != null
                      ? sessions.byDay.reduce((a, d) => a + d.sessions, 0).toLocaleString()
                      : '—'}
                    loading={loading}
                  />
                  <StatCard
                    label="Avg session duration"
                    value={duration ? ms(duration.avg) : '—'}
                    delta={duration?.sampleSize ? -1.8 : undefined}
                    sub={
                      duration && duration.sampleSize > 0
                        ? `p50 ${ms(duration.p50)} · p90 ${ms(duration.p90)}`
                        : undefined
                    }
                    loading={loading}
                  />
                </div>

                <div className="grid gap-3" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
                  <div className="bg-card border border-border rounded-[10px] p-[18px]">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <div className="text-[14px] font-semibold">Sessions over time</div>
                        <div className="text-[11.5px] text-muted-foreground mt-0.5">Last 30 days</div>
                      </div>
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

                {/* Duration breakdown */}
                {duration && duration.sampleSize > 0 && (
                  <div className="bg-card border border-border rounded-[10px] p-[18px]">
                    <div className="text-[14px] font-semibold mb-3">Session duration distribution</div>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'Average', value: ms(duration.avg) },
                        { label: 'Median (p50)', value: ms(duration.p50) },
                        { label: 'p90', value: ms(duration.p90) },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="text-[11.5px] text-muted-foreground mb-1">{s.label}</div>
                          <div className="text-[26px] font-semibold tabular-nums tracking-tight">{s.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[11.5px] text-muted-foreground">
                      Based on {duration.sampleSize.toLocaleString()} sessions with recorded duration.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Events tab */}
            {tab === 'events' && (
              <>
                <div className="bg-card border border-border rounded-[10px] p-[18px]">
                  <div className="text-[14px] font-semibold mb-4">Top events</div>
                  {events && events.topEvents.length > 0 ? (
                    <div className="flex flex-col gap-2.5">
                      {events.topEvents.map((e, i) => {
                        const max = events.topEvents[0].count
                        const pct = (e.count / max) * 100
                        return (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-[120px] text-[12px] text-muted-foreground truncate shrink-0">
                              {e.eventName}
                            </div>
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: COLOR }}
                              />
                            </div>
                            <div className="w-[60px] text-right text-[12px] tabular-nums text-foreground shrink-0">
                              {e.count.toLocaleString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{loading ? 'Loading…' : 'No events yet'}</p>
                  )}
                </div>
              </>
            )}

            {/* Sessions tab */}
            {tab === 'sessions' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total sessions" value={sessions?.total != null ? sessions.total.toLocaleString() : '—'} loading={loading} />
                  <StatCard label="Avg duration" value={duration ? ms(duration.avg) : '—'} loading={loading} />
                  <StatCard
                    label="p50 / p90"
                    value={duration ? `${ms(duration.p50)} / ${ms(duration.p90)}` : '—'}
                    loading={loading}
                  />
                </div>
                <div className="bg-card border border-border rounded-[10px] p-[18px]">
                  <div className="text-[14px] font-semibold mb-3">Sessions over time</div>
                  {sessions && sessions.byDay.length > 0 ? (
                    <SessionsChart data={sessions.byDay} />
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                      {loading ? 'Loading…' : 'No session data yet'}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Settings tab */}
            {tab === 'settings' && (
              <div className="bg-card border border-border rounded-[10px] p-6 text-sm text-muted-foreground">
                Analytics settings — coming soon.
              </div>
            )}

            <div className="h-2" />
          </div>
        )}
      </div>
    </div>
  )
}
