'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, Users, DollarSign, TrendingUp, Clock,
  CheckCircle, XCircle, AlertCircle, ArrowRight, Bot,
  Star, BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  todayAppointments: number
  confirmedToday: number
  pendingToday: number
  monthRevenue: number
  totalClients: number
  newClientsMonth: number
  cancellationRate: number
  avgRating: number
  recentAppointments: Array<{
    id: string
    client_name: string
    client_phone: string
    scheduled_at: string
    status: string
    price: number
    service_name?: string
    barber_name?: string
  }>
}

export default function PainelDashboard() {
  const [data, setData] = useState<DashboardData>({
    todayAppointments: 0,
    confirmedToday: 0,
    pendingToday: 0,
    monthRevenue: 0,
    totalClients: 0,
    newClientsMonth: 0,
    cancellationRate: 0,
    avgRating: 0,
    recentAppointments: [],
  })
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [barbershopName, setBarbershopName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('barbershop_id')
        .eq('id', user.id)
        .single()

      if (!profile?.barbershop_id) {
        setLoading(false)
        return
      }

      const bsId = profile.barbershop_id
      setBarbershopId(bsId)

      const { data: bs } = await supabase
        .from('barbershops')
        .select('name')
        .eq('id', bsId)
        .single()
      if (bs) setBarbershopName(bs.name)

      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const [todayRes, monthRevenueRes, clientsRes, recentRes] = await Promise.all([
        supabase.from('appointments').select('id, status')
          .eq('barbershop_id', bsId)
          .gte('scheduled_at', today)
          .lt('scheduled_at', tomorrow),
        supabase.from('appointments').select('price')
          .eq('barbershop_id', bsId)
          .eq('status', 'completed')
          .gte('scheduled_at', monthStart),
        supabase.from('clients').select('id, created_at')
          .eq('barbershop_id', bsId),
        supabase.from('appointments').select('id, client_name, client_phone, scheduled_at, status, price')
          .eq('barbershop_id', bsId)
          .order('scheduled_at', { ascending: false })
          .limit(5),
      ])

      const todayAppts = todayRes.data || []
      const monthRevenue = (monthRevenueRes.data || []).reduce((sum, a) => sum + (a.price || 0), 0)
      const allClients = clientsRes.data || []
      const newClients = allClients.filter(c => new Date(c.created_at) >= new Date(monthStart)).length

      setData({
        todayAppointments: todayAppts.length,
        confirmedToday: todayAppts.filter(a => a.status === 'confirmed').length,
        pendingToday: todayAppts.filter(a => a.status === 'pending').length,
        monthRevenue,
        totalClients: allClients.length,
        newClientsMonth: newClients,
        cancellationRate: 0,
        avgRating: 4.8,
        recentAppointments: (recentRes.data || []).map(a => ({
          ...a,
          service_name: 'Corte',
          barber_name: 'Barbeiro',
        })),
      })
      setLoading(false)
    }
    loadData()
  }, [])

  const stats = [
    {
      label: 'Agendamentos Hoje',
      value: data.todayAppointments,
      icon: Calendar,
      color: '#C9A84C',
      bg: 'rgba(201,168,76,0.1)',
      sub: `${data.confirmedToday} confirmados · ${data.pendingToday} pendentes`,
    },
    {
      label: 'Receita do Mês',
      value: `R$ ${data.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: '#22C55E',
      bg: 'rgba(34,197,94,0.1)',
      sub: 'Serviços concluídos',
    },
    {
      label: 'Total de Clientes',
      value: data.totalClients,
      icon: Users,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      sub: `+${data.newClientsMonth} este mês`,
    },
    {
      label: 'Avaliação Média',
      value: data.avgRating.toFixed(1),
      icon: Star,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      sub: 'Baseado em avaliações',
    },
  ]

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    confirmed: { label: 'Confirmado', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    cancelled: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
    completed: { label: 'Concluído', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
    no_show: { label: 'Não veio', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
          {barbershopName ? (
            <>Dashboard — <span style={{ color: '#C9A84C' }}>{barbershopName}</span></>
          ) : (
            'Dashboard'
          )}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Setup Banner (sem barbearia) */}
      {!barbershopId && !loading && (
        <div className="p-6 rounded-2xl mb-8"
          style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <h2 className="font-semibold mb-2" style={{ color: '#C9A84C' }}>Configure sua barbearia</h2>
          <p className="text-sm mb-4" style={{ color: 'rgba(245,240,235,0.6)' }}>
            Para começar a usar o sistema, configure os dados da sua barbearia.
          </p>
          <a href="/painel/configuracoes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
            Configurar agora <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

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
                <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{stat.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Nova Agenda', href: '/painel/agenda', icon: Calendar, color: '#C9A84C' },
          { label: 'Ver Clientes', href: '/painel/clientes', icon: Users, color: '#3B82F6' },
          { label: 'Analytics', href: '/painel/analytics', icon: BarChart3, color: '#22C55E' },
          { label: 'Config. Bot', href: '/painel/bot', icon: Bot, color: '#8B5CF6' },
        ].map(action => (
          <a key={action.label} href={action.href}
            className="flex items-center gap-3 p-4 rounded-xl transition-all"
            style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${action.color}15` }}>
              <action.icon className="w-4 h-4" style={{ color: action.color }} />
            </div>
            <span className="text-sm font-medium" style={{ color: 'rgba(245,240,235,0.8)' }}>{action.label}</span>
          </a>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <h2 className="font-semibold" style={{ color: '#F5F0EB' }}>Agendamentos Recentes</h2>
          <a href="/painel/agenda" className="text-sm" style={{ color: '#C9A84C' }}>Ver agenda →</a>
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
        ) : data.recentAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(245,240,235,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Nenhum agendamento ainda. Configure sua barbearia e comece a receber clientes!
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {data.recentAppointments.map(appt => {
              const sc = statusConfig[appt.status] || statusConfig.pending
              return (
                <div key={appt.id} className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                      style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                      {appt.client_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm" style={{ color: '#F5F0EB' }}>{appt.client_name}</div>
                      <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                        {new Date(appt.scheduled_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {appt.service_name && ` · ${appt.service_name}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium" style={{ color: '#22C55E' }}>
                      R$ {appt.price.toFixed(2)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
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
