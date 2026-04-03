'use client'
import { useState, useEffect } from 'react'
import { Users, Search, Plus, Phone, Calendar, Trash2, Loader2, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  phone: string
  email?: string
  total_appointments: number
  last_visit?: string
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

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadClients(bsId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('barbershop_id', bsId)
      .order('created_at', { ascending: false })
    if (!error && data) setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles')
        .select('barbershop_id')
        .eq('id', user.id)
        .single()
      if (profile?.barbershop_id) {
        setBarbershopId(profile.barbershop_id)
        await loadClients(profile.barbershop_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])

  async function handleAddClient() {
    if (!newClient.name.trim() || !newClient.phone.trim() || !barbershopId) return
    setSaving(true)
    const { error } = await supabase.from('clients').insert({
      barbershop_id: barbershopId,
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim() || null,
    })
    setSaving(false)
    if (error) { showToast('Erro ao adicionar cliente', 'error'); return }
    showToast('Cliente adicionado!', 'success')
    setShowModal(false)
    setNewClient({ name: '', phone: '', email: '' })
    await loadClients(barbershopId)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este cliente?')) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { showToast('Erro ao remover', 'error'); return }
    showToast('Cliente removido', 'success')
    setClients(prev => prev.filter(c => c.id !== id))
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Clientes</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.4)' }} />
        <input
          placeholder="Buscar por nome ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '38px' }}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Users className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p style={{ color: 'rgba(245,240,235,0.4)' }}>
            {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map(client => (
            <div key={client.id} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <UserCheck className="w-5 h-5" style={{ color: '#C9A84C' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{client.name}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                      <Phone className="w-3 h-3" /> {client.phone}
                    </span>
                    {client.total_appointments > 0 && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                        <Calendar className="w-3 h-3" /> {client.total_appointments} visita{client.total_appointments !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(client.id)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'rgba(239,68,68,0.6)' }}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#F5F0EB' }}>Novo Cliente</h2>
            <div className="space-y-3">
              <input placeholder="Nome completo *" value={newClient.name}
                onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                style={inputStyle} />
              <input placeholder="WhatsApp *" value={newClient.phone}
                onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))}
                style={inputStyle} />
              <input placeholder="E-mail (opcional)" value={newClient.email}
                onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))}
                style={inputStyle} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAddClient} disabled={saving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Adicionar
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
