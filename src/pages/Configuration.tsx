import { useEffect, useState } from 'react'
import { platformApi } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export function Configuration() {
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'ok' | 'error' } | null>(null)

  useEffect(() => {
    platformApi.get('/api/config').then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setRegistrationEnabled(data.config.registrationEnabled)
      }
      setLoading(false)
    })
  }, [])

  async function handleToggle(value: boolean) {
    setSaving(true)
    setSaveMessage(null)
    try {
      const res = await platformApi.patch('/api/config', { registrationEnabled: value })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setRegistrationEnabled(data.config.registrationEnabled)
      setSaveMessage({ text: 'Saved.', type: 'ok' })
    } catch {
      setSaveMessage({ text: 'Failed to save. Try again.', type: 'error' })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 2000)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Configuration</h1>

      <Tabs defaultValue="registration">
        <TabsList>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </TabsList>

        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="text-sm font-medium">Allow new user registration</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    When disabled, the registration endpoint returns 403.
                  </p>
                </div>
                <Switch
                  checked={registrationEnabled ?? false}
                  onCheckedChange={handleToggle}
                  disabled={loading || saving}
                />
              </div>
              {saveMessage && (
                <p className={cn('text-sm mt-3', saveMessage.type === 'ok' ? 'text-green-600' : 'text-destructive')}>
                  {saveMessage.text}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
