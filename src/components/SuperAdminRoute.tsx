import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'superadmin') return <Navigate to="/app" replace />

  return <>{children}</>
}
