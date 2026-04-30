import { useState, useEffect } from 'react'
import { platformApi } from '@/lib/api'

export interface AnalyticsInstance {
  id: string
  name: string
}

interface ServiceRow {
  _id: string
  serviceId: string
  name: string
  revokedAt?: string
}

export function useAnalyticsInstances(companyId: string | undefined): {
  instances: AnalyticsInstance[]
  loading: boolean
} {
  const [instances, setInstances] = useState<AnalyticsInstance[]>([])
  const [loading, setLoading] = useState(false)

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
          .map((s) => ({ id: s._id, name: s.name }))
        setInstances(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [companyId])

  return { instances, loading }
}
