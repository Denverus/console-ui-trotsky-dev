import { FormEvent, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { platformApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { AnalyticsInstance } from '@/hooks/useAnalyticsInstances'

interface Props {
  companyId: string
  instance: AnalyticsInstance
  onSaved: () => void
}

function normalizeOrigin(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) throw new Error('Origin cannot be empty')
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('Must be a URL like https://example.com')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http and https are allowed')
  }
  if (url.origin !== trimmed) {
    throw new Error(`No path/query/trailing-slash — try "${url.origin}"`)
  }
  return url.origin
}

export function AllowedOriginsConfig({ companyId, instance, onSaved }: Props) {
  const [origins, setOrigins] = useState<string[]>(instance.allowedOrigins)
  const [draft, setDraft] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'ok' | 'error' } | null>(
    null,
  )

  useEffect(() => {
    setOrigins(instance.allowedOrigins)
    setDraft('')
    setAddError(null)
    setSaveMessage(null)
  }, [instance.id, instance.allowedOrigins])

  const dirty =
    origins.length !== instance.allowedOrigins.length ||
    origins.some((o, i) => o !== instance.allowedOrigins[i])

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    setAddError(null)
    let normalized: string
    try {
      normalized = normalizeOrigin(draft)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Invalid origin')
      return
    }
    if (origins.includes(normalized)) {
      setAddError('Already in the list')
      return
    }
    setOrigins([...origins, normalized])
    setDraft('')
  }

  function handleRemove(origin: string) {
    setOrigins(origins.filter((o) => o !== origin))
  }

  async function handleSave() {
    setSaving(true)
    setSaveMessage(null)
    try {
      const res = await platformApi.patch(
        `/api/companies/${companyId}/services/${instance.id}`,
        { allowedOrigins: origins },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Failed to save')
      }
      setSaveMessage({ text: 'Saved.', type: 'ok' })
      onSaved()
    } catch (err) {
      setSaveMessage({
        text: err instanceof Error ? err.message : 'Failed to save. Try again.',
        type: 'error',
      })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allowed origins — {instance.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Domains allowed to POST events with this API key from a browser. Cross-origin requests
          from any other domain are blocked. Changes take up to 60 seconds to take effect.
        </p>

        {origins.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No origins configured. Cross-origin event posts will be rejected. Add the domains where
            this snippet is embedded.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {origins.map((o) => (
              <li
                key={o}
                className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
              >
                <code className="font-mono">{o}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(o)}
                  disabled={saving}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Add origin</Label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="https://example.com"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={saving}
            />
            <Button type="submit" variant="outline" disabled={saving || !draft.trim()}>
              Add
            </Button>
          </div>
          {addError && <p className="text-sm text-destructive">{addError}</p>}
        </form>

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving || !dirty}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {saveMessage && (
            <p
              className={cn(
                'text-[12.5px]',
                saveMessage.type === 'ok' ? 'text-success' : 'text-destructive',
              )}
            >
              {saveMessage.text}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
