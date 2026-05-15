import { useState, useEffect, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { platformApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select } from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { PageHeader } from '@/components/PageHeader'
import { Plus } from 'lucide-react'

interface Company {
  _id: string
  name: string
  slug: string
  planTier: string
  createdAt: string
}

export function Companies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [planTier, setPlanTier] = useState<'free' | 'starter' | 'pro'>('free')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchCompanies() }, [])

  async function fetchCompanies() {
    const res = await platformApi.get('/api/companies')
    if (res.ok) {
      const data = await res.json()
      setCompanies(data.companies)
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await platformApi.post('/api/companies', { name, slug, planTier })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to create company')
      }
      setName(''); setSlug(''); setPlanTier('free'); setShowForm(false)
      fetchCompanies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  const tierColor = (tier: string) =>
    tier === 'pro' ? 'default' : tier === 'starter' ? 'secondary' : 'outline'

  return (
    <div className="p-7">
      <PageHeader
        title="Companies"
        description="Companies issued console services and API keys."
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-3.5 w-3.5" /> New company
          </Button>
        }
      />

      <div className="space-y-4">
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Create company</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex gap-3 flex-wrap items-end">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Playzoo" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="playzoo"
                  pattern="^[a-z0-9-]+"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value as 'free' | 'starter' | 'pro')}
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </Select>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating…' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </form>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No companies yet
                </TableCell>
              </TableRow>
            )}
            {companies.map((c) => (
              <TableRow key={c._id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell><Badge variant={tierColor(c.planTier) as 'default' | 'secondary' | 'outline'}>{c.planTier}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Link to={`/app/companies/${c._id}`} className="text-[12.5px] font-medium text-primary hover:underline">
                    Manage →
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      </div>
    </div>
  )
}
