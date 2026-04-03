'use client'

import { useState, useEffect } from 'react'
import {
  Store, Search, Plus, MoreVertical, CheckCircle,
  XCircle, Clock, AlertCircle, Eye, Edit, Trash2,
  Phone, Mail, MapPin, Calendar, DollarSign, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Barbershop {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  city: string
  state: string
  status: string
  plan: string
  monthly_price: number
  trial_ends_at: string
  subscription_ends_at: string
  created_at: string
  owner_id: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active: { label: 'Ativo', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  trial: { label: 'Trial', color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', icon: Clock },
  suspended: { label: 'Suspenso', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  expired: { label: 'Expirado', color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: AlertCircle },
}

export default function BarbershopsPage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<Barbershop | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [actionMenu, setActionMenu] = useState<string | null>(null)
  const supabase = createClient()

  async function loadBarbershops() {
    setLoading(true)
    const { data } = await supabase
      .from('barbershops')
      .select('*')
      .order('created_at', { ascending: false })
    setBarbershops(data || [])
    setLoading(false)
  }

  useEffect(() => { loadBarbershops() }, [])

  async function handleStatusChange(id: string, newStatus: string) {
    await supabase.from('barbershops').update({ status: newStatus }).eq('id', id)
    setActionMenu(null)
    await loadBarbershops()
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja remover esta barbearia? Esta ação não pode ser desfeita.')) return
    await supabase.from('barbershops').delete().eq('id', id)
    setActionMenu(null)
    await loadBarbershops()
  }

  const filtered = barbershops.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase()) ||
      b.phone?.includes(search)
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    all: barbershops.length,
    active: barbershops.filter(b => b.status === 'active').length,
    trial: barbershops.filter(b => b.status === 'trial').length,
    suspended: barbershops.filter(b => b.status === 'suspended').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
            Gestão de <span style={{ color: '#C9A84C' }}>Barbearias</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            {barbershops.length} barbearia{barbershops.length !== 1 ? 's' : ''} cadastrada{barbershops.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadBarbershops}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
            <Plus className="w-4 h-4" /> Nova Barbearia
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F5F0EB',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
        </div>

        <div className="flex gap-2">
          {Object.entries({ all: 'Todas', active: 'Ativas', trial: 'Trial', suspended: 'Suspensas' }).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: statusFilter === key ? 'rgba(201,168,76,0.15)' : '#1A1A1A',
                border: `1px solid ${statusFilter === key ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: statusFilter === key ? '#C9A84C' : 'rgba(245,240,235,0.6)',
              }}>
              {label}
              <span className="px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                {counts[key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 rounded skeleton" />
                  <div className="h-3 w-32 rounded skeleton" />
                </div>
                <div className="h-6 w-16 rounded-full skeleton" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(245,240,235,0.2)' }} />
            <p className="font-medium" style={{ color: 'rgba(245,240,235,0.6)' }}>
              {search ? 'Nenhuma barbearia encontrada' : 'Nenhuma barbearia cadastrada ainda'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Barbearia', 'Contato', 'Status', 'Plano', 'Receita', 'Cadastro', 'Ações'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium"
                      style={{ color: 'rgba(245,240,235,0.4)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.trial
                  return (
                    <tr key={b.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="transition-colors"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                            {b.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-sm" style={{ color: '#F5F0EB' }}>{b.name}</div>
                            <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>/{b.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {b.email && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                              <Mail className="w-3 h-3" /> {b.email}
                            </div>
                          )}
                          {b.phone && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                              <Phone className="w-3 h-3" /> {b.phone}
                            </div>
                          )}
                          {b.city && (
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                              <MapPin className="w-3 h-3" /> {b.city}{b.state ? `, ${b.state}` : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit"
                          style={{ background: sc.bg, color: sc.color }}>
                          <sc.icon className="w-3 h-3" />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs"
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.6)' }}>
                          {b.plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium"
                          style={{ color: b.status === 'active' ? '#22C55E' : 'rgba(245,240,235,0.3)' }}>
                          <DollarSign className="w-3.5 h-3.5" />
                          {b.status === 'active' ? `R$ ${b.monthly_price || 199}` : '—'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                          <Calendar className="w-3 h-3" />
                          {new Date(b.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenu(actionMenu === b.id ? null : b.id)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.5)' }}>
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {actionMenu === b.id && (
                            <div
                              className="absolute right-0 top-8 z-20 rounded-xl overflow-hidden w-48 shadow-2xl"
                              style={{ background: '#222222', border: '1px solid rgba(201,168,76,0.2)' }}>
                              <button onClick={() => { setSelected(b); setShowModal(true); setActionMenu(null) }}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors"
                                style={{ color: 'rgba(245,240,235,0.7)' }}>
                                <Eye className="w-4 h-4" /> Ver detalhes
                              </button>
                              {b.status !== 'active' && (
                                <button onClick={() => handleStatusChange(b.id, 'active')}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left"
                                  style={{ color: '#22C55E' }}>
                                  <CheckCircle className="w-4 h-4" /> Ativar
                                </button>
                              )}
                              {b.status !== 'suspended' && (
                                <button onClick={() => handleStatusChange(b.id, 'suspended')}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left"
                                  style={{ color: '#F59E0B' }}>
                                  <XCircle className="w-4 h-4" /> Suspender
                                </button>
                              )}
                              <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                              <button onClick={() => handleDelete(b.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left"
                                style={{ color: '#EF4444' }}>
                                <Trash2 className="w-4 h-4" /> Remover
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
