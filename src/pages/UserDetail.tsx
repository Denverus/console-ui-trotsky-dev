import { useState, useEffect, FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { platformApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface UserProfile {
  _id: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  lastLoginAt?: string
  companyId?: { _id: string; name: string; slug: string } | null
  createdAt: string
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const { user: me } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notFound, setNotFound] = useState(false)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameError, setNameError] = useState('')
  const [nameSaved, setNameSaved] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const isOwnProfile = me?.id === id

  useEffect(() => {
    if (!id) return
    platformApi.get(`/api/users/${id}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setProfile(data.user)
        setFirstName(data.user.firstName ?? '')
        setLastName(data.user.lastName ?? '')
      } else if (res.status === 404) {
        setNotFound(true)
      }
    })
  }, [id])

  async function handleSaveName(e: FormEvent) {
    e.preventDefault()
    setNameError('')
    setNameSaved(false)
    setNameLoading(true)
    try {
      const res = await platformApi.patch(`/api/users/${id}`, { firstName, lastName })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to update')
      }
      setNameSaved(true)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Error')
    } finally {
      setNameLoading(false)
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwError('Passwords do not match')
      return
    }
    setPwError('')
    setPwSaved(false)
    setPwLoading(true)
    try {
      const body: Record<string, string> = { newPassword }
      if (isOwnProfile) body.oldPassword = oldPassword
      const res = await platformApi.patch(`/api/users/${id}/password`, body)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to change password')
      }
      setPwSaved(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Error')
    } finally {
      setPwLoading(false)
    }
  }

  if (notFound) {
    return <div className="p-6 text-muted-foreground">User not found.</div>
  }
  if (!profile) {
    return <div className="p-6 text-muted-foreground">Loading…</div>
  }

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email
  const company = profile.companyId

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/users" className="hover:text-foreground">Users</Link>
        <span>/</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="text-sm">
          <dl className="grid grid-cols-[120px_1fr] gap-y-2.5">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{[profile.firstName, profile.lastName].filter(Boolean).join(' ') || '—'}</dd>
            <dt className="text-muted-foreground">Email</dt>
            <dd>{profile.email}</dd>
            <dt className="text-muted-foreground">Role</dt>
            <dd>
              <Badge variant={profile.role === 'superadmin' ? 'default' : 'outline'}>
                {profile.role}
              </Badge>
            </dd>
            <dt className="text-muted-foreground">Company</dt>
            <dd>{company ? `${company.name} (${company.slug})` : '—'}</dd>
            <dt className="text-muted-foreground">Last login</dt>
            <dd>{profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}</dd>
            <dt className="text-muted-foreground">Joined</dt>
            <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Edit name</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSaveName} className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Smith" />
            </div>
            <Button type="submit" disabled={nameLoading}>{nameLoading ? 'Saving…' : 'Save'}</Button>
          </form>
          {nameError && <p className="text-sm text-destructive mt-2">{nameError}</p>}
          {nameSaved && <p className="text-sm text-green-600 mt-2">Saved.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isOwnProfile ? 'Change password' : 'Reset password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="flex gap-3 flex-wrap items-end">
            {isOwnProfile && (
              <div className="space-y-1.5">
                <Label>Current password</Label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>New password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? 'Saving…' : isOwnProfile ? 'Change' : 'Reset'}
            </Button>
          </form>
          {pwError && <p className="text-sm text-destructive mt-2">{pwError}</p>}
          {pwSaved && <p className="text-sm text-green-600 mt-2">Password updated.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
