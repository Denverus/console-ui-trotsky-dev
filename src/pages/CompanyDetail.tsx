import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { platformApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ChevronLeft, Plus, RotateCcw, Trash2, Copy, Check } from 'lucide-react'

type ServiceId = 'analytics' | 'payments' | 'email' | 'logs'

interface Service {
  _id: string
  serviceId: ServiceId
  createdAt: string
  revokedAt?: string
}

interface Company {
  _id: string
  name: string
  slug: string
  planTier: string
}

export function CompanyDetail() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<ServiceId>('analytics')
  const [newKey, setNewKey] = useState<{ plaintext: string; serviceId: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    platformApi.get(`/api/companies/${id}`).then(async (res) => {
      if (res.ok) setCompany((await res.json()).company)
    })
    fetchServices()
  }, [id])

  async function fetchServices() {
    if (!id) return
    const res = await platformApi.get(`/api/companies/${id}/services`)
    if (res.ok) setServices((await res.json()).services)
  }

  async function handleAssign() {
    if (!id) return
    setError('')
    const res = await platformApi.post(`/api/companies/${id}/services`, { serviceId: selectedService })
    if (res.ok) {
      const data = await res.json()
      setNewKey({ plaintext: data.plaintext, serviceId: data.serviceId })
      fetchServices()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to assign service')
    }
  }

  async function handleRevoke(serviceId: ServiceId) {
    if (!id) return
    const res = await platformApi.delete(`/api/companies/${id}/services/${serviceId}`)
    if (res.ok) fetchServices()
  }

  async function handleRegenerate(serviceId: ServiceId) {
    if (!id) return
    setError('')
    const res = await platformApi.post(`/api/companies/${id}/services/${serviceId}/regenerate`)
    if (res.ok) {
      const data = await res.json()
      setNewKey({ plaintext: data.plaintext, serviceId: data.serviceId })
      fetchServices()
    }
  }

  function copyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey.plaintext)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeServices = services.filter((s) => !s.revokedAt)
  const availableServices: ServiceId[] = (['analytics', 'payments', 'email', 'logs'] as ServiceId[])
    .filter((s) => !activeServices.find((a) => a.serviceId === s))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link to="/companies" className="text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">{company?.name ?? '…'}</h1>
        {company && <Badge variant="outline">{company.planTier}</Badge>}
      </div>

      {newKey && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4">
            <p className="text-sm font-medium mb-2">
              API key for <strong>{newKey.serviceId}</strong> — copy now, shown once
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-background border rounded px-3 py-2 font-mono break-all">
                {newKey.plaintext}
              </code>
              <Button size="icon" variant="outline" onClick={copyKey}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-muted-foreground" onClick={() => setNewKey(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Services</CardTitle>
            {availableServices.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value as ServiceId)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                >
                  {availableServices.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <Button size="sm" onClick={handleAssign}>
                  <Plus className="h-3.5 w-3.5" /> Assign
                </Button>
              </div>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No services assigned
                  </TableCell>
                </TableRow>
              )}
              {services.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium">{s.serviceId}</TableCell>
                  <TableCell>
                    <Badge variant={s.revokedAt ? 'destructive' : 'default'}>
                      {s.revokedAt ? 'revoked' : 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!s.revokedAt && (
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Regenerate key"
                          onClick={() => handleRegenerate(s.serviceId)}
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Revoke"
                          onClick={() => handleRevoke(s.serviceId)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
