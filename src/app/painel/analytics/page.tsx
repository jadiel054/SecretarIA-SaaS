'use client'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, DollarSign, Calendar, Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  pendingAppointments: number
  totalRevenue: number
  totalClients: number
  avgTicket: number
  thisMonthAppointments: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    pendingAppointments: 0,
    totalRevenue: 0,
    totalClients: 0,
    avgTicket: 0,
    thisMonthAppointments: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('barbershop_id').eq('id', user.id).single()
      if (!profile?.barbershop_id) { setLoading(false); return }
      const bsId = profile.barbershop_id

      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [apptRes, clientRes, monthApptRes] = await Promise.all([
        supabase.from('appointments').select('status, price').eq('barbershop_id', bsId),
        supabase.from('clients').select('id', { count: 'exact' }).eq('barbershop_id', bsId),
        supabase.from('appointments').select('id', { count: 'exact' })
          .eq('barbershop_id', bsId).gte('scheduled_at', firstOfMonth),
      ])

      const appts = apptRes.data || []
      const completed = appts.filter(a => a.status === 'completed')
      const cancelled = appts.filter(a => a.status === 'cancelled')
      const pending = appts.filter(a => a.status === 'pending' || a.status === 'confirmed')
      const totalRevenue = completed.reduce((sum, a) => sum + (a.price || 0), 0)
      const avgTicket = completed.length > 0 ? totalRevenue / completed.length : 0

      setStats({
        totalAppointments: appts.length,
        completedAppointments: completed.length,
        cancelledAppointments: cancelled.length,
        pendingAppointments: pending.length,
        totalRevenue,
        totalClients: clientRes.count || 0,
        avgTicket,
        thisMonthAppointments: monthApptRes.count || 0,
      })
      setLoading(false)
    }
    loadStats()
  }, [])

  const completionRate = stats.totalAppointments > 0
    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
    : 0

  const cards = [
    { label: 'Agendamentos Totais', value: stats.totalAppointments, icon: Calendar, color: '#C9A84C', sub: `${stats.thisMonthAppointments} este mês` },
    { label: 'Receita Total', value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#22C55E', sub: `Ticket médio: R$ ${stats.avgTicket.toFixed(2)}` },
    { label: 'Clientes', value: stats.totalClients, icon: Users, color: '#3B82F6', sub: 'Cadastrados' },
    { label: 'Taxa de Conclusão', value: `${completionRate}%`, icon: TrendingUp, color: '#8B5CF6', sub: `${stats.completedAppointments} concluídos` },
  ]

  const statusCards = [
    { label: 'Concluídos', value: stats.completedAppointments, icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Pendentes', value: stats.pendingAppointments, icon: Clock, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)' },
    { label: 'Cancelados', value: stats.cancelledAppointments, icon: XCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>Visão geral do desempenho da sua barbearia</p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {cards.map((card, i) => (
          <div key={i} className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: 'rgba(245,240,235,0.5)' }}>{card.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: '#F5F0EB' }}>{card.value}</div>
            <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="p-5 rounded-2xl mb-6"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#F5F0EB' }}>
          <BarChart3 className="w-4 h-4 inline mr-2" style={{ color: '#C9A84C' }} />
          Status dos Agendamentos
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {statusCards.map((s, i) => (
            <div key={i} className="p-4 rounded-xl text-center"
              style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
              <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {stats.totalAppointments > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
              <span>Taxa de conclusão</span>
              <span>{completionRate}%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-2 rounded-full transition-all"
                style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, #C9A84C, #22C55E)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Empty state for charts */}
      {stats.totalAppointments === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-2xl"
          style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
          <BarChart3 className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
            Nenhum dado disponível ainda. Os gráficos aparecerão conforme os agendamentos forem realizados.
          </p>
        </div>
      )}
    </div>
  )
}
