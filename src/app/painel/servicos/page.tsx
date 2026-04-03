'use client'
import { useState, useEffect } from 'react'
import { Scissors, Plus, Trash2, Edit2, Save, X, Loader2, Clock, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Service {
  id: string
  name: string
  description?: string
  duration_minutes: number
  base_price: number
  is_active: boolean
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '10px',
  background: '#1A1A1A',
  border: '1px solid rgba(201,168,76,0.2)',
  color: '#F5F0EB',
  fontSize: '14px',
  outline: 'none',
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: 30, base_price: 0 })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadServices(bsId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', bsId)
      .order('created_at', { ascending: false })
    if (!error && data) setServices(data)
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('barbershop_id').eq('id', user.id).single()
      if (profile?.barbershop_id) {
        setBarbershopId(profile.barbershop_id)
        await loadServices(profile.barbershop_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  function openNew() {
    setEditingId(null)
    setForm({ name: '', description: '', duration_minutes: 30, base_price: 0 })
    setShowModal(true)
  }

  function openEdit(s: Service) {
    setEditingId(s.id)
    setForm({ name: s.name, description: s.description || '', duration_minutes: s.duration_minutes, base_price: s.base_price })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !barbershopId) return
    setSaving(true)
    if (editingId) {
      const { error } = await supabase.from('services').update({
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration_minutes: form.duration_minutes,
        base_price: form.base_price,
      }).eq('id', editingId)
      if (error) { showToast('Erro ao atualizar', 'error'); setSaving(false); return }
      showToast('Serviço atualizado!', 'success')
    } else {
      const { error } = await supabase.from('services').insert({
        barbershop_id: barbershopId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        duration_minutes: form.duration_minutes,
        base_price: form.base_price,
      })
      if (error) { showToast('Erro ao criar serviço', 'error'); setSaving(false); return }
      showToast('Serviço criado!', 'success')
    }
    setSaving(false)
    setShowModal(false)
    await loadServices(barbershopId)
  }

  async function handleToggle(id: string, current: boolean) {
    await supabase.from('services').update({ is_active: !current }).eq('id', id)
    setServices(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este serviço?')) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) { showToast('Erro ao excluir', 'error'); return }
    showToast('Serviço excluído', 'success')
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: toast.type === 'success' ? '#22C55E' : '#EF4444',
          }}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Serviços</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            {services.length} serviço{services.length !== 1 ? 's' : ''} cadastrado{services.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Scissors className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p style={{ color: 'rgba(245,240,235,0.4)' }}>Nenhum serviço cadastrado ainda</p>
          <button onClick={openNew} className="text-sm font-medium" style={{ color: '#C9A84C' }}>
            Adicionar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {services.map(service => (
            <div key={service.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{
                background: '#111111',
                border: `1px solid ${service.is_active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)'}`,
                opacity: service.is_active ? 1 : 0.6,
              }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: service.is_active ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.05)' }}>
                  <Scissors className="w-5 h-5" style={{ color: service.is_active ? '#C9A84C' : '#6B7280' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{service.name}</div>
                  {service.description && (
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>{service.description}</div>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      <Clock className="w-3 h-3" /> {service.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#C9A84C' }}>
                      <DollarSign className="w-3 h-3" /> R$ {service.base_price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleToggle(service.id, service.is_active)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: service.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                    color: service.is_active ? '#22C55E' : '#6B7280',
                    border: `1px solid ${service.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}`,
                  }}>
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </button>
                <button onClick={() => openEdit(service)}
                  className="p-2 rounded-lg" style={{ color: 'rgba(201,168,76,0.7)' }}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(service.id)}
                  className="p-2 rounded-lg" style={{ color: 'rgba(239,68,68,0.6)' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: '#F5F0EB' }}>
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(245,240,235,0.4)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nome do serviço *" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} />
              <input placeholder="Descrição (opcional)" value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={inputStyle} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(245,240,235,0.5)' }}>Duração (min)</label>
                  <input type="number" value={form.duration_minutes}
                    onChange={e => setForm(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                    style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'rgba(245,240,235,0.5)' }}>Preço (R$)</label>
                  <input type="number" step="0.01" value={form.base_price}
                    onChange={e => setForm(p => ({ ...p, base_price: Number(e.target.value) }))}
                    style={inputStyle} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Salvar' : 'Criar'}
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{ background: '#222222', color: 'rgba(245,240,235,0.6)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
