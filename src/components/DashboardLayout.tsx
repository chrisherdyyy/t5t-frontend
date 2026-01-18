'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Lightbulb,
  Search,
  Target,
  Upload,
  FolderKanban,
  Sparkles,
  UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Worker } from '@/types'
import { SearchBar } from './SearchBar'

const unifiedNavigation = [
  { name: 'CEO Dashboard', href: '/unified', icon: Sparkles },
  { name: 'People', href: '/unified/people', icon: UserCircle },
]

const t5tNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Recommendations', href: '/dashboard/actions', icon: Lightbulb },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Org Chart', href: '/dashboard/org-chart', icon: Building2 },
]

const wbrNavigation = [
  { name: 'Dashboard', href: '/wbr', icon: Target },
  { name: 'Projects', href: '/wbr/projects', icon: FolderKanban },
  { name: 'Upload', href: '/wbr/upload', icon: Upload },
]

const adminNavigation = [
  { name: 'Workers', href: '/admin/workers', icon: Users },
  { name: 'Teams', href: '/admin/teams', icon: Building2 },
  { name: 'Participants', href: '/wbr/participants', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

function NavSection({
  title,
  items,
  pathname
}: {
  title: string
  items: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[]
  pathname: string
}) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && item.href !== '/wbr' && pathname.startsWith(item.href + '/')) ||
            (item.href === '/dashboard' && pathname === '/dashboard') ||
            (item.href === '/wbr' && pathname === '/wbr')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-colors rounded-md',
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Worker | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('t5t_user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('t5t_token')
    localStorage.removeItem('t5t_user')
    router.push('/auth/login')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-4 py-5 border-b border-gray-100">
            <Link href="/unified" className="text-lg font-semibold text-gray-900">
              T5T Tracker
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <NavSection title="Overview" items={unifiedNavigation} pathname={pathname} />
            <NavSection title="T5T" items={t5tNavigation} pathname={pathname} />
            <NavSection title="WBR" items={wbrNavigation} pathname={pathname} />
            {isAdmin && (
              <NavSection title="Admin" items={adminNavigation} pathname={pathname} />
            )}
          </nav>

          {/* User section */}
          <div className="px-3 py-3 border-t border-gray-100">
            {user && (
              <div className="flex items-center gap-2.5 mb-2 px-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 min-h-screen">
        {/* Header with search */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
            <Link
              href="/dashboard/search"
              className="ml-4 flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Advanced</span>
            </Link>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
