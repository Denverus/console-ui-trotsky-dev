import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const navItem = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
    isActive
      ? 'bg-primary text-primary-foreground'
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
  )

export function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 border-r flex flex-col shrink-0">
        <div className="p-4 border-b">
          <p className="font-semibold text-sm">console.trotsky.dev</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink to="/" end className={navItem}>
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/companies" className={navItem}>
            <Building2 className="h-4 w-4" /> Companies
          </NavLink>
        </nav>
        <div className="p-2 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
