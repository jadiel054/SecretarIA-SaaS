'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Scissors, LayoutDashboard, Calendar, Users, Settings,
  LogOut, ChevronLeft, ChevronRight, BarChart3, Bell,
  MessageSquare, Scissors as ScissorsIcon, Star, Gift,
  Bot, Megaphone
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/painel', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/painel/agenda', icon: Calendar, label: 'Agenda' },
  { href: '/painel/clientes', icon: Users, label: 'Clientes' },
  { href: '/painel/servicos', icon: ScissorsIcon, label: 'Serviços' },
  { href: '/painel/barbeiros', icon: Users, label: 'Barbeiros' },
  { href: '/painel/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/painel/bot', icon: Bot, label: 'Bot IA' },
  { href: '/painel/fidelidade', icon: Gift, label: 'Fidelidade' },
  { href: '/painel/avaliacoes', icon: Star, label: 'Avaliações' },
  { href: '/painel/comunicados', icon: Megaphone, label: 'Comunicados' },
  { href: '/painel/configuracoes', icon: Settings, label: 'Configurações' },
]

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [profile, setProfile] = useState<{ full_name: string; email: string } | null>(null)
  const [barbershop, setBarbershop] = useState<{ name: string; status: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role, barbershop_id')
        .eq('id', user.id)
        .single()

      if (!prof) { router.push('/login'); return }
      if (prof.role === 'super_admin') { router.push('/super-admin'); return }

      setProfile(prof)

      if (prof.barbershop_id) {
        const { data: bs } = await supabase
          .from('barbershops')
          .select('name, status')
          .eq('id', prof.barbershop_id)
          .single()
        if (bs) setBarbershop(bs)
      }
    }
    loadData()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const statusColor: Record<string, string> = {
    active: '#22C55E', trial: '#C9A84C', suspended: '#EF4444', expired: '#6B7280'
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
              {barbershop && (
                <div className="text-xs truncate max-w-[140px]" style={{ color: 'rgba(245,240,235,0.4)' }}>
                  {barbershop.name}
                </div>
              )}
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

        {/* Status da barbearia */}
        {!collapsed && barbershop && (
          <div className="mx-3 mt-3 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full"
                style={{ background: statusColor[barbershop.status] || '#6B7280' }} />
              <span className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                {barbershop.status === 'trial' ? 'Em período de teste' :
                  barbershop.status === 'active' ? 'Plano ativo' :
                    barbershop.status === 'suspended' ? 'Conta suspensa' : barbershop.status}
              </span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/painel' && pathname.startsWith(item.href))
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
              <div className="text-xs font-semibold truncate" style={{ color: '#F5F0EB' }}>{profile.full_name || 'Usuário'}</div>
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
