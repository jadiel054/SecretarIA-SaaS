'use client'

import { useState, useEffect } from 'react'
import { Store, Users, DollarSign, TrendingUp, Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  totalBarbershops: number
  activeBarbershops: number
  trialBarbershops: number
  suspendedBarbershops: number
  totalUsers: number
  totalAppointmentsToday: number
  monthlyRevenue: number
  recentBarbershops: Array<{
    id: string
    name: string
    status: string
    plan: string
    created_at: string
    owner_name?: string
  }>
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalBarbershops: 0,
    activeBarbershops: 0,
    trialBarbershops: 0,
    suspendedBarbershops: 0,
    totalUsers: 0,
    totalAppointmentsToday: 0,
    monthlyRevenue: 0,
    recentBarbershops: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [barbershopsRes, usersRes, appointmentsRes] = await Promise.all([
          supabase.from('barbershops').select('id, name, status, plan, created_at'),
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('appointments').select('id', { count: 'exact' })
            .gte('scheduled_at', new Date().toISOString().split('T')[0])
            .lt('scheduled_at', new Date(Date.now() + 86400000).toISOString().split('T')[0]),
        ])

        const barbershops = barbershopsRes.data || []
        const active = barbershops.filter(b => b.status === 'active')
        const trial = barbershops.filter(b => b.status === 'trial')
        const suspended = barbershops.filter(b => b.status === 'suspended')
        const monthlyRevenue = active.length * 199

        setData({
          totalBarbershops: barbershops.length,
          activeBarbershops: active.length,
          trialBarbershops: trial.length,
          suspendedBarbershops: suspended.length,
          totalUsers: usersRes.count || 0,
          totalAppointmentsToday: appointmentsRes.count || 0,
          monthlyRevenue,
          recentBarbershops: barbershops.slice(0, 5).map(b => ({
            ...b,
            owner_name: 'Carregando...',
          })),
        })
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const stats = [
    {
      label: 'Total de Barbearias',
      value: data.totalBarbershops,
      icon: Store,
      color: '#C9A84C',
      bg: 'rgba(201,168,76,0.1)',
      change: '+2 este mês',
    },
    {
      label: 'Barbearias Ativas',
      value: data.activeBarbershops,
      icon: CheckCircle,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      change: `${data.trialBarbershops} em trial`,
    },
    {
      label: 'Usuários Totais',
      value: data.totalUsers,
      icon: Users,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      change: 'Todos os perfis',
    },
    {
      label: 'MRR Estimado',
      value: `R$ ${data.monthlyRevenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: '#C9A84C',
      bg: 'rgba(201,168,76,0.1)',
      change: `${data.activeBarbershops} × R$ 199`,
    },
  ]

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Ativo', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    trial: { label: 'Trial', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
    suspended: { label: 'Suspenso', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    expired: { label: 'Expirado', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
          Dashboard <span style={{ color: '#C9A84C' }}>Super Admin</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Visão geral de toda a plataforma SecretárIA
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label}
            className="p-5 rounded-2xl"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
            {loading ? (
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="h-7 w-16 rounded skeleton" />
                <div className="h-4 w-24 rounded skeleton" />
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: stat.bg }}>
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#F5F0EB' }}>{stat.value}</div>
                <div className="text-xs font-medium mb-1" style={{ color: 'rgba(245,240,235,0.7)' }}>{stat.label}</div>
                <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{stat.change}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Status Overview */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Em Trial', value: data.trialBarbershops, icon: Clock, color: '#C9A84C', desc: 'Aguardando conversão' },
          { label: 'Suspensas', value: data.suspendedBarbershops, icon: AlertCircle, color: '#EF4444', desc: 'Requerem atenção' },
          { label: 'Agendamentos Hoje', value: data.totalAppointmentsToday, icon: Activity, color: '#3B82F6', desc: 'Em toda a plataforma' },
        ].map(item => (
          <div key={item.label}
            className="p-5 rounded-2xl flex items-center gap-4"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}15` }}>
              <item.icon className="w-6 h-6" style={{ color: item.color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>{loading ? '...' : item.value}</div>
              <div className="text-sm font-medium" style={{ color: 'rgba(245,240,235,0.7)' }}>{item.label}</div>
              <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Barbershops */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="font-semibold" style={{ color: '#F5F0EB' }}>Barbearias Recentes</h2>
          <a href="/super-admin/barbearias"
            className="text-sm transition-colors"
            style={{ color: '#C9A84C' }}>
            Ver todas →
          </a>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded skeleton" />
                  <div className="h-3 w-24 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        ) : data.recentBarbershops.length === 0 ? (
          <div className="p-8 text-center">
            <Store className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(245,240,235,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Nenhuma barbearia cadastrada ainda.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {data.recentBarbershops.map(b => {
              const sc = statusConfig[b.status] || statusConfig.trial
              return (
                <div key={b.id} className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                      {b.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: '#F5F0EB' }}>{b.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                        {new Date(b.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.5)' }}>
                      {b.plan}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
