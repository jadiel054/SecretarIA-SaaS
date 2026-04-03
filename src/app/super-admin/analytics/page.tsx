'use client'
import { useState, useEffect } from 'react'
import { BarChart3, Store, Users, DollarSign, TrendingUp, Activity, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface GlobalStats {
  totalBarbershops: number
  activeBarbershops: number
  trialBarbershops: number
  suspendedBarbershops: number
  totalUsers: number
  totalAppointments: number
  monthlyRevenue: number
  totalRevenue: number
}

export default function SuperAdminAnalyticsPage() {
  const [stats, setStats] = useState<GlobalStats>({
    totalBarbershops: 0, activeBarbershops: 0, trialBarbershops: 0,
    suspendedBarbershops: 0, totalUsers: 0, totalAppointments: 0,
    monthlyRevenue: 0, totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const [bsRes, usersRes, apptRes] = await Promise.all([
        supabase.from('barbershops').select('id, status, monthly_price, plan'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('appointments').select('id, price, status', { count: 'exact' }),
      ])

      const barbershops = bsRes.data || []
      const active = barbershops.filter(b => b.status === 'active')
      const trial = barbershops.filter(b => b.status === 'trial')
      const suspended = barbershops.filter(b => b.status === 'suspended')
      const monthlyRevenue = active.reduce((sum, b) => sum + (b.monthly_price || 199), 0)

      const appointments = apptRes.data || []
      const totalRevenue = appointments
        .filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.price || 0), 0)

      setStats({
        totalBarbershops: barbershops.length,
        activeBarbershops: active.length,
        trialBarbershops: trial.length,
        suspendedBarbershops: suspended.length,
        totalUsers: usersRes.count || 0,
        totalAppointments: apptRes.count || 0,
        monthlyRevenue,
        totalRevenue,
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
      </div>
    )
  }

  const kpis = [
    { label: 'Barbearias Ativas', value: stats.activeBarbershops, icon: Store, color: '#22C55E', sub: `${stats.totalBarbershops} total` },
    { label: 'MRR Estimado', value: `R$ ${stats.monthlyRevenue.toLocaleString('pt-BR')}`, icon: DollarSign, color: '#C9A84C', sub: 'Receita mensal recorrente' },
    { label: 'Total de Usuários', value: stats.totalUsers, icon: Users, color: '#3B82F6', sub: 'Todos os perfis' },
    { label: 'Agendamentos', value: stats.totalAppointments, icon: Activity, color: '#8B5CF6', sub: 'Total histórico' },
  ]

  const statusData = [
    { label: 'Ativas', value: stats.activeBarbershops, color: '#22C55E', pct: stats.totalBarbershops > 0 ? (stats.activeBarbershops / stats.totalBarbershops) * 100 : 0 },
    { label: 'Trial', value: stats.trialBarbershops, color: '#C9A84C', pct: stats.totalBarbershops > 0 ? (stats.trialBarbershops / stats.totalBarbershops) * 100 : 0 },
    { label: 'Suspensas', value: stats.suspendedBarbershops, color: '#EF4444', pct: stats.totalBarbershops > 0 ? (stats.suspendedBarbershops / stats.totalBarbershops) * 100 : 0 },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Analytics Global</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Visão consolidada de toda a plataforma SecretárIA
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>{kpi.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${kpi.color}15` }}>
                <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#F5F0EB' }}>{kpi.value}</div>
            <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F5F0EB' }}>
          <BarChart3 className="w-4 h-4" style={{ color: '#C9A84C' }} />
          Distribuição de Status
        </h2>
        <div className="space-y-3">
          {statusData.map((s, i) => (
            <div key={i}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'rgba(245,240,235,0.6)' }}>{s.label}</span>
                <span style={{ color: s.color }}>{s.value} ({s.pct.toFixed(0)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${s.pct}%`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
