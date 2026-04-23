import { useState, useEffect } from 'react'
import { platformApi, analyticsApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { SessionsChart } from '@/components/charts/SessionsChart'
import { TopEventsChart } from '@/components/charts/TopEventsChart'

interface Company { _id: string; name: string }

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

function ms(milliseconds: number): string {
  if (milliseconds < 1000) return `${milliseconds}ms`
  return `${(milliseconds / 1000).toFixed(1)}s`
}

export function Dashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState('')
  const [sessions, setSessions] = useState<SessionStats | null>(null)
  const [events, setEvents] = useState<EventStats | null>(null)
  const [duration, setDuration] = useState<DurationStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    platformApi.get('/api/companies').then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setCompanies(data.companies)
        if (data.companies.length > 0) setCompanyId(data.companies[0]._id)
      }
    })
  }, [])

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {companies.length > 0 && (
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {companies.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {companies.length === 0 && (
        <p className="text-muted-foreground text-sm">No companies yet — create one first.</p>
      )}

      {loading && <p className="text-muted-foreground text-sm">Loading…</p>}

      {!loading && companyId && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{sessions?.total ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{events?.total ?? '—'}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg session duration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {duration ? ms(duration.avg) : '—'}
                </p>
                {duration && duration.sampleSize > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    p50 {ms(duration.p50)} · p90 {ms(duration.p90)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sessions over time</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions && sessions.byDay.length > 0
                  ? <SessionsChart data={sessions.byDay} />
                  : <p className="text-sm text-muted-foreground">No data yet</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top events</CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.topEvents.length > 0
                  ? <TopEventsChart data={events.topEvents.slice(0, 8)} />
                  : <p className="text-sm text-muted-foreground">No data yet</p>}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
