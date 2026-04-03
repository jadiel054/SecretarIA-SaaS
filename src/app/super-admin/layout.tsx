'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Scissors, LayoutDashboard, Store, Key, Users,
  MessageSquare, Bell, Settings, LogOut, ChevronLeft,
  ChevronRight, BarChart3, Megaphone, Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/super-admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/super-admin/barbearias', icon: Store, label: 'Barbearias' },
  { href: '/super-admin/apis', icon: Key, label: 'APIs de IA' },
  { href: '/super-admin/usuarios', icon: Users, label: 'Usuários' },
  { href: '/super-admin/comunicados', icon: Megaphone, label: 'Comunicados' },
  { href: '/super-admin/chat', icon: MessageSquare, label: 'Chat Interno' },
  { href: '/super-admin/analytics', icon: BarChart3, label: 'Analytics Global' },
  { href: '/super-admin/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null)
  const supabase = createClient()

  const SUPER_ADMIN_EMAIL = 'jadielalves54@gmail.com'

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('full_name, email, role').eq('id', user.id).single()
      // Proteção dupla: role super_admin E email autorizado
      if (!data || data.role !== 'super_admin' || data.email !== SUPER_ADMIN_EMAIL) {
        router.push('/painel')
        return
      }
      setProfile(data)
    }
    loadProfile()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 relative"
        style={{
          width: collapsed ? '72px' : '256px',
          background: '#111111',
          borderRight: '1px solid rgba(201,168,76,0.15)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <Scissors className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm" style={{ color: '#F5F0EB' }}>
                Secret<span style={{ color: '#C9A84C' }}>á</span>rIA
              </div>
              <div className="text-xs flex items-center gap-1" style={{ color: '#C9A84C' }}>
                <Shield className="w-3 h-3" /> Super Admin
              </div>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/super-admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  background: isActive ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: isActive ? '#C9A84C' : 'rgba(245,240,235,0.6)',
                  border: isActive ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          {!collapsed && profile && (
            <div className="px-3 py-2 mb-2 rounded-xl" style={{ background: 'rgba(201,168,76,0.05)' }}>
              <div className="text-xs font-semibold truncate" style={{ color: '#F5F0EB' }}>{profile.full_name || 'Admin'}</div>
              <div className="text-xs truncate" style={{ color: 'rgba(245,240,235,0.4)' }}>{profile.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
            style={{ color: 'rgba(239,68,68,0.7)' }}
            title={collapsed ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0A0A0A' }}>
        {children}
      </main>
    </div>
  )
}
