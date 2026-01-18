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
  { name: 'People Directory', href: '/unified/people', icon: UserCircle },
]

const navigation = [
  { name: 'T5T Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Recommendations', href: '/dashboard/actions', icon: Lightbulb },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Org Chart', href: '/dashboard/org-chart', icon: Building2 },
]

const wbrNavigation = [
  { name: 'WBR Dashboard', href: '/wbr', icon: Target },
  { name: 'Projects', href: '/wbr/projects', icon: FolderKanban },
  { name: 'Upload WBR', href: '/wbr/upload', icon: Upload },
]

const adminNavigation = [
  { name: 'Workers', href: '/admin/workers', icon: Users },
  { name: 'Teams', href: '/admin/teams', icon: Building2 },
  { name: 'WBR Participants', href: '/wbr/participants', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

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
  const isManager = user?.role === 'manager' || isAdmin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              T5T Tracker
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Unified Section */}
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Unified
              </p>
            </div>
            {unifiedNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}

            {/* T5T Section */}
            <div className="mt-6 mb-4">
              <p className="px-3 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                T5T
              </p>
            </div>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}

            {/* WBR Section */}
            <div className="mt-6 mb-4">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                WBR
              </p>
            </div>
            {wbrNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}

            {isAdmin && (
              <>
                <div className="mt-6 mb-4">
                  <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                {adminNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            {user && (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">
        {/* Header with search */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
            <Link
              href="/dashboard/search"
              className="ml-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Search</span>
            </Link>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
