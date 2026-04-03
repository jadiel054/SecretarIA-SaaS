'use client'
import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Edit2, Save, X, Loader2, Phone, Mail, Percent } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Barber {
  id: string
  name: string
  email?: string
  phone?: string
  commission_percentage: number
  is_active: boolean
  created_at: string
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

export default function BarbeirosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', commission_percentage: 50 })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadBarbers(bsId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('barbers')
      .select('*')
      .eq('barbershop_id', bsId)
      .order('created_at', { ascending: false })
    if (!error && data) setBarbers(data)
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
        await loadBarbers(profile.barbershop_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  function openNew() {
    setEditingId(null)
    setForm({ name: '', email: '', phone: '', commission_percentage: 50 })
    setShowModal(true)
  }

  function openEdit(b: Barber) {
    setEditingId(b.id)
    setForm({ name: b.name, email: b.email || '', phone: b.phone || '', commission_percentage: b.commission_percentage })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !barbershopId) return
    setSaving(true)
    if (editingId) {
      const { error } = await supabase.from('barbers').update({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        commission_percentage: form.commission_percentage,
      }).eq('id', editingId)
      if (error) { showToast('Erro ao atualizar', 'error'); setSaving(false); return }
      showToast('Barbeiro atualizado!', 'success')
    } else {
      const { error } = await supabase.from('barbers').insert({
        barbershop_id: barbershopId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        commission_percentage: form.commission_percentage,
      })
      if (error) { showToast('Erro ao cadastrar barbeiro', 'error'); setSaving(false); return }
      showToast('Barbeiro cadastrado!', 'success')
    }
    setSaving(false)
    setShowModal(false)
    await loadBarbers(barbershopId)
  }

  async function handleToggle(id: string, current: boolean) {
    await supabase.from('barbers').update({ is_active: !current }).eq('id', id)
    setBarbers(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este barbeiro?')) return
    const { error } = await supabase.from('barbers').delete().eq('id', id)
    if (error) { showToast('Erro ao remover', 'error'); return }
    showToast('Barbeiro removido', 'success')
    setBarbers(prev => prev.filter(b => b.id !== id))
  }

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Barbeiros</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            {barbers.length} barbeiro{barbers.length !== 1 ? 's' : ''} cadastrado{barbers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
          <Plus className="w-4 h-4" /> Novo Barbeiro
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : barbers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p style={{ color: 'rgba(245,240,235,0.4)' }}>Nenhum barbeiro cadastrado ainda</p>
          <button onClick={openNew} className="text-sm font-medium" style={{ color: '#C9A84C' }}>
            Adicionar primeiro barbeiro
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {barbers.map(barber => (
            <div key={barber.id} className="p-4 rounded-xl"
              style={{
                background: '#111111',
                border: `1px solid ${barber.is_active ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)'}`,
                opacity: barber.is_active ? 1 : 0.6,
              }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                    {getInitials(barber.name)}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: '#F5F0EB' }}>{barber.name}</div>
                    <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: '#C9A84C' }}>
                      <Percent className="w-3 h-3" /> {barber.commission_percentage}% comissão
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(barber)} className="p-1.5 rounded-lg" style={{ color: 'rgba(201,168,76,0.7)' }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(barber.id)} className="p-1.5 rounded-lg" style={{ color: 'rgba(239,68,68,0.6)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {(barber.phone || barber.email) && (
                <div className="space-y-1 mb-3">
                  {barber.phone && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      <Phone className="w-3 h-3" /> {barber.phone}
                    </div>
                  )}
                  {barber.email && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      <Mail className="w-3 h-3" /> {barber.email}
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => handleToggle(barber.id, barber.is_active)}
                className="w-full py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: barber.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                  color: barber.is_active ? '#22C55E' : '#6B7280',
                  border: `1px solid ${barber.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}`,
                }}>
                {barber.is_active ? 'Ativo' : 'Inativo'}
              </button>
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
                {editingId ? 'Editar Barbeiro' : 'Novo Barbeiro'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(245,240,235,0.4)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder="Nome completo *" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} />
              <input placeholder="Telefone/WhatsApp" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} />
              <input placeholder="E-mail" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={inputStyle} />
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(245,240,235,0.5)' }}>
                  Comissão: {form.commission_percentage}%
                </label>
                <input type="range" min="0" max="100" value={form.commission_percentage}
                  onChange={e => setForm(p => ({ ...p, commission_percentage: Number(e.target.value) }))}
                  className="w-full" style={{ accentColor: '#C9A84C' }} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? 'Salvar' : 'Cadastrar'}
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
