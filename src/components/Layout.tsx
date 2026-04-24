import { useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Activity, BarChart3, Search, Bell,
  ChevronDown, Settings, Key, LogOut, BookOpen, ArrowUpRight, Users,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { platformApi } from '@/lib/api'
import { cn } from '@/lib/utils'

export interface Company {
  _id: string
  name: string
  slug: string
  planTier: string
}

export interface LayoutContext {
  companies: Company[]
  companyId: string
  company: Company | null
  setCompanyId: (id: string) => void
}

function UserAvatar({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const hue = (name.charCodeAt(0) * 37) % 360
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 9999,
        background: `hsl(${hue} 65% 55%)`,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.42, fontWeight: 600, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function CompanyAvatar({ name, size = 18 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 53 + 120) % 360
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <div
      style={{
        width: size, height: size, borderRadius: 4,
        background: `hsl(${hue} 55% 50%)`,
        color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.44, fontWeight: 700, flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

function CompanyDropdown({
  companies, companyId, onSelect, onClose,
}: {
  companies: Company[]
  companyId: string
  onSelect: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-lg z-50 py-1">
      {companies.map((c) => (
        <button
          key={c._id}
          onClick={() => { onSelect(c._id); onClose() }}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-muted transition-colors text-left',
            c._id === companyId ? 'font-medium text-foreground' : 'text-muted-foreground',
          )}
        >
          <CompanyAvatar name={c.name} size={20} />
          <span className="flex-1 text-foreground">{c.name}</span>
          <span className="text-[10px] text-muted-foreground">{c.planTier}</span>
        </button>
      ))}
    </div>
  )
}

const PATH_LABELS: Record<string, string> = {
  '/app': 'Overview',
  '/app/companies': 'Companies',
  '/app/users': 'Users',
  '/app/analytics': 'Analytics',
  '/app/configuration': 'Configuration',
}

const SERVICES = [
  { id: 'analytics', name: 'Analytics', path: '/app/analytics', color: '#6366f1' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [companies, setCompanies] = useState<Company[]>([])
  const [companyId, setCompanyId] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

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
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const company = companies.find((c) => c._id === companyId) ?? null
  const pageTitle = PATH_LABELS[location.pathname] ?? ''
  const ctx: LayoutContext = { companies, companyId, company, setCompanyId }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground" style={{ fontSize: 13 }}>
      {/* ── Top bar ── */}
      <header
        className="flex-none flex items-center gap-3.5 border-b border-border bg-card px-4"
        style={{ height: 52 }}
      >
        {/* Brand + company pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center justify-center text-white font-bold tracking-wide"
            style={{
              width: 22, height: 22, borderRadius: 6,
              background: 'linear-gradient(135deg, #0f172a, #334155)',
              fontSize: 11,
            }}
          >
            t
          </div>
          <span className="font-semibold tracking-tight">trotsky.dev</span>
          <span className="text-muted-foreground">/</span>

          {/* Company picker */}
          <div className="relative" ref={pickerRef}>
            {company ? (
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="inline-flex items-center gap-2 h-[30px] px-2.5 rounded-[7px] border border-border bg-card font-medium text-foreground hover:bg-muted transition-colors"
                style={{ fontSize: 13 }}
              >
                <CompanyAvatar name={company.name} size={18} />
                <span>{company.name}</span>
                <span
                  className={cn(
                    'text-[10px] font-medium px-1.5 py-px rounded-full leading-[14px]',
                    company.planTier === 'pro'
                      ? 'bg-foreground text-background'
                      : 'border border-border text-muted-foreground',
                  )}
                >
                  {company.planTier}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            ) : (
              <span className="text-muted-foreground">No company</span>
            )}
            {pickerOpen && companies.length > 0 && (
              <CompanyDropdown
                companies={companies}
                companyId={companyId}
                onSelect={setCompanyId}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>

          {pageTitle && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{pageTitle}</span>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <button
          className="inline-flex items-center gap-2.5 h-[30px] px-2.5 min-w-[200px] rounded-[7px] border border-border bg-background text-muted-foreground hover:bg-muted transition-colors"
          style={{ fontSize: 12.5 }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <kbd
            className="inline-flex items-center justify-center h-[18px] px-1 rounded font-mono bg-card border border-border text-muted-foreground font-medium"
            style={{ fontSize: 10.5, minWidth: 18 }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Env indicator */}
        <button
          className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded-[7px] border border-border bg-transparent text-foreground hover:bg-muted transition-colors"
          style={{ fontSize: 12.5 }}
        >
          <span
            className="w-[7px] h-[7px] rounded-full shrink-0"
            style={{
              background: 'hsl(var(--success))',
              boxShadow: '0 0 0 3px hsl(var(--success-bg))',
            }}
          />
          production
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Bell */}
        <button className="relative w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-[7px] right-[7px] w-1.5 h-1.5 rounded-full"
            style={{ background: 'hsl(var(--danger))', border: '1.5px solid hsl(var(--card))' }}
          />
        </button>

        <UserAvatar name={user?.email ?? 'U'} size={26} />
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="flex-none flex flex-col border-r border-border bg-card" style={{ width: 220 }}>
          {/* Primary nav */}
          <div className="p-3 pb-1.5 flex flex-col gap-0.5">
            <SideNavItem to="/app" icon={<LayoutDashboard className="h-[15px] w-[15px]" />} label="Overview" end />
            <SideNavItem to="/app/companies" icon={<Building2 className="h-[15px] w-[15px]" />} label="Companies" />
            <SideNavItem to="/app/users" icon={<Users className="h-[15px] w-[15px]" />} label="Users" />
            <SideNavItem to="/app/activity" icon={<Activity className="h-[15px] w-[15px]" />} label="Activity" disabled />
          </div>

          {/* Services */}
          <div className="px-3 pt-3 pb-1">
            <div
              className="px-2 pb-1.5 font-semibold text-muted-foreground tracking-[0.6px] uppercase"
              style={{ fontSize: 10.5 }}
            >
              Services
            </div>
            {SERVICES.map((s) => (
              <SideNavItem
                key={s.id}
                to={s.path}
                icon={<BarChart3 className="h-[15px] w-[15px]" style={{ color: s.color }} />}
                label={s.name}
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Footer */}
          <div className="p-3 border-t border-border flex flex-col gap-0.5">
            <SideNavItem to="/app/api-keys" icon={<Key className="h-[15px] w-[15px]" />} label="API keys" disabled />
            <SideNavItem to="/app/docs" icon={<BookOpen className="h-[15px] w-[15px]" />} label="Docs" external />
            {user?.role === 'superadmin' && (
              <SideNavItem to="/app/configuration" icon={<Settings className="h-[15px] w-[15px]" />} label="Configuration" />
            )}
            <button
              onClick={logout}
              className="flex items-center gap-2.5 w-full px-2 py-[6px] rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
              style={{ fontSize: 13, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span className="inline-flex w-4 justify-center"><LogOut className="h-[15px] w-[15px]" /></span>
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet context={ctx} />
        </main>
      </div>
    </div>
  )
}

function SideNavItem({
  to, icon, label, end = false, disabled = false, external = false,
}: {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
  disabled?: boolean
  external?: boolean
}) {
  const base = 'flex items-center gap-2.5 w-full px-2 py-[6px] rounded-md transition-colors text-left'
  const iconWrap = <span className="inline-flex w-4 justify-center shrink-0">{icon}</span>

  if (disabled) {
    return (
      <div className={cn(base, 'text-muted-foreground/40 cursor-not-allowed select-none')} style={{ fontSize: 13 }}>
        {iconWrap}
        <span className="flex-1">{label}</span>
      </div>
    )
  }
  if (external) {
    return (
      <a href="#" className={cn(base, 'text-muted-foreground hover:bg-muted hover:text-foreground no-underline')} style={{ fontSize: 13 }}>
        {iconWrap}
        <span className="flex-1">{label}</span>
        <ArrowUpRight className="h-[11px] w-[11px] text-muted-foreground shrink-0" />
      </a>
    )
  }
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(base, 'no-underline', isActive
          ? 'bg-muted text-foreground font-medium'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
      style={{ fontSize: 13 }}
    >
      {iconWrap}
      <span className="flex-1">{label}</span>
    </NavLink>
  )
}
