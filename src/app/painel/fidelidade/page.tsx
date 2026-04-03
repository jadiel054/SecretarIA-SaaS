'use client'
import { useState, useEffect } from 'react'
import { Gift, Star, Trophy, Users, TrendingUp, Loader2, Crown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ClientRanking {
  id: string
  name: string
  phone: string
  total_appointments: number
  last_visit?: string
}

export default function FidelidadePage() {
  const [clients, setClients] = useState<ClientRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('barbershop_id').eq('id', user.id).single()
      if (!profile?.barbershop_id) { setLoading(false); return }
      setBarbershopId(profile.barbershop_id)

      const { data, error } = await supabase
        .from('clients')
        .select('id, name, phone, total_appointments, last_visit')
        .eq('barbershop_id', profile.barbershop_id)
        .order('total_appointments', { ascending: false })
        .limit(50)

      if (!error && data) setClients(data)
      setLoading(false)
    }
    init()
  }, [])

  function getLoyaltyLevel(visits: number): { label: string; color: string; icon: typeof Star } {
    if (visits >= 20) return { label: 'VIP', color: '#C9A84C', icon: Crown }
    if (visits >= 10) return { label: 'Ouro', color: '#F59E0B', icon: Trophy }
    if (visits >= 5) return { label: 'Prata', color: '#9CA3AF', icon: Star }
    return { label: 'Bronze', color: '#CD7F32', icon: Star }
  }

  const vipCount = clients.filter(c => c.total_appointments >= 20).length
  const goldCount = clients.filter(c => c.total_appointments >= 10 && c.total_appointments < 20).length
  const silverCount = clients.filter(c => c.total_appointments >= 5 && c.total_appointments < 10).length

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
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Programa de Fidelidade</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Acompanhe seus clientes mais fiéis e recompense a lealdade
        </p>
      </div>

      {/* Levels Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'VIP', desc: '20+ visitas', count: vipCount, color: '#C9A84C', icon: Crown },
          { label: 'Ouro', desc: '10–19 visitas', count: goldCount, color: '#F59E0B', icon: Trophy },
          { label: 'Prata', desc: '5–9 visitas', count: silverCount, color: '#9CA3AF', icon: Star },
          { label: 'Bronze', desc: '1–4 visitas', count: clients.filter(c => c.total_appointments < 5).length, color: '#CD7F32', icon: Star },
        ].map((level, i) => (
          <div key={i} className="p-4 rounded-xl text-center"
            style={{ background: '#111111', border: `1px solid ${level.color}25` }}>
            <level.icon className="w-6 h-6 mx-auto mb-2" style={{ color: level.color }} />
            <div className="text-xl font-bold" style={{ color: level.color }}>{level.count}</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: '#F5F0EB' }}>{level.label}</div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>{level.desc}</div>
          </div>
        ))}
      </div>

      {/* Ranking */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="p-4 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <TrendingUp className="w-4 h-4" style={{ color: '#C9A84C' }} />
          <h2 className="text-sm font-semibold" style={{ color: '#F5F0EB' }}>Ranking de Clientes</h2>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Gift className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Nenhum cliente com visitas registradas ainda
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {clients.map((client, index) => {
              const level = getLoyaltyLevel(client.total_appointments)
              const LevelIcon = level.icon
              return (
                <div key={client.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{
                        background: index < 3 ? `${level.color}20` : 'rgba(255,255,255,0.05)',
                        color: index < 3 ? level.color : 'rgba(245,240,235,0.4)',
                      }}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#F5F0EB' }}>{client.name}</div>
                      <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{client.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                      style={{ background: `${level.color}15`, border: `1px solid ${level.color}30` }}>
                      <LevelIcon className="w-3 h-3" style={{ color: level.color }} />
                      <span className="text-xs font-semibold" style={{ color: level.color }}>{level.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: '#F5F0EB' }}>{client.total_appointments}</div>
                      <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>visitas</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="mt-4 p-4 rounded-xl"
        style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="flex items-start gap-3">
          <Gift className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#C9A84C' }}>Como funciona</div>
            <div className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
              O programa de fidelidade é calculado automaticamente com base no número de visitas de cada cliente.
              Clientes com mais visitas recebem níveis mais altos: Bronze (1–4), Prata (5–9), Ouro (10–19) e VIP (20+).
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
