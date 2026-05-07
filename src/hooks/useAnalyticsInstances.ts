import { useState, useEffect, useCallback } from 'react'
import { platformApi } from '@/lib/api'

export interface AnalyticsInstance {
  id: string
  name: string
  allowedOrigins: string[]
}

interface ServiceRow {
  _id: string
  serviceId: string
  name: string
  allowedOrigins?: string[]
  revokedAt?: string
}

export function useAnalyticsInstances(companyId: string | undefined): {
  instances: AnalyticsInstance[]
  loading: boolean
  refetch: () => void
} {
  const [instances, setInstances] = useState<AnalyticsInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => {
    setReloadToken((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!companyId) {
      setInstances([])
      return
    }
    let cancelled = false
    setLoading(true)
    platformApi
      .get(`/api/companies/${companyId}/services`)
      .then(async (res) => {
        if (!res.ok) return
        const data = (await res.json()) as { services: ServiceRow[] }
        if (cancelled) return
        const list = data.services
          .filter((s) => s.serviceId === 'analytics' && !s.revokedAt)
          .map((s) => ({
            id: s._id,
            name: s.name,
            allowedOrigins: s.allowedOrigins ?? [],
          }))
        setInstances(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [companyId, reloadToken])

  return { instances, loading, refetch }
}
