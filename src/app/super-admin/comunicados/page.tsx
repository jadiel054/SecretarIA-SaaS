'use client'
import { useState, useEffect } from 'react'
import { Megaphone, Plus, Trash2, Pin, Loader2, Save, X, Info, AlertTriangle, CheckCircle, PartyPopper } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'celebration'
  is_pinned: boolean
  expires_at?: string
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

const typeConfig = {
  info: { icon: Info, color: '#3B82F6', label: 'Informação' },
  warning: { icon: AlertTriangle, color: '#F59E0B', label: 'Aviso' },
  success: { icon: CheckCircle, color: '#22C55E', label: 'Sucesso' },
  celebration: { icon: PartyPopper, color: '#C9A84C', label: 'Celebração' },
}

export default function SuperAdminComunicadosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'celebration',
    is_pinned: false,
    expires_at: '',
  })
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) setAnnouncements(data)
    setLoading(false)
  }

  useEffect(() => { loadAnnouncements() }, [])

  async function handleCreate() {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('announcements').insert({
      title: form.title.trim(),
      content: form.content.trim(),
      type: form.type,
      is_pinned: form.is_pinned,
      target: 'all',
      expires_at: form.expires_at || null,
      created_by: user?.id,
    })
    setSaving(false)
    if (error) { showToast('Erro ao criar comunicado', 'error'); return }
    showToast('Comunicado criado!', 'success')
    setShowModal(false)
    setForm({ title: '', content: '', type: 'info', is_pinned: false, expires_at: '' })
    await loadAnnouncements()
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este comunicado?')) return
    const { error } = await supabase.from('announcements').delete().eq('id', id)
    if (error) { showToast('Erro ao excluir', 'error'); return }
    showToast('Comunicado excluído', 'success')
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  async function handleTogglePin(id: string, current: boolean) {
    await supabase.from('announcements').update({ is_pinned: !current }).eq('id', id)
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, is_pinned: !current } : a))
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
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Comunicados</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Gerencie avisos e comunicados para todas as barbearias
          </p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
          <Plus className="w-4 h-4" /> Novo Comunicado
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl"
          style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
          <Megaphone className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p style={{ color: 'rgba(245,240,235,0.4)' }}>Nenhum comunicado criado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const cfg = typeConfig[ann.type]
            const TypeIcon = cfg.icon
            return (
              <div key={ann.id} className="p-4 rounded-xl"
                style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <TypeIcon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: cfg.color }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{ann.title}</h3>
                        {ann.is_pinned && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                            Fixado
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.6)' }}>{ann.content}</p>
                      <div className="text-xs mt-2" style={{ color: 'rgba(245,240,235,0.3)' }}>
                        {new Date(ann.created_at).toLocaleDateString('pt-BR')}
                        {ann.expires_at && ` · Expira: ${new Date(ann.expires_at).toLocaleDateString('pt-BR')}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleTogglePin(ann.id, ann.is_pinned)}
                      className="p-2 rounded-lg"
                      style={{ color: ann.is_pinned ? '#C9A84C' : 'rgba(245,240,235,0.3)' }}>
                      <Pin className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(ann.id)}
                      className="p-2 rounded-lg" style={{ color: 'rgba(239,68,68,0.6)' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="w-full max-w-lg rounded-2xl p-6"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold" style={{ color: '#F5F0EB' }}>Novo Comunicado</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'rgba(245,240,235,0.4)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input placeholder="Título *" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={inputStyle} />
              <textarea placeholder="Conteúdo *" value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={4} style={{ ...inputStyle, resize: 'none' }} />
              <div>
                <label className="text-xs mb-2 block" style={{ color: 'rgba(245,240,235,0.5)' }}>Tipo</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(typeConfig) as [string, typeof typeConfig.info][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setForm(p => ({ ...p, type: key as typeof form.type }))}
                      className="py-2 rounded-lg text-xs font-medium"
                      style={{
                        background: form.type === key ? `${cfg.color}20` : 'rgba(255,255,255,0.03)',
                        color: form.type === key ? cfg.color : 'rgba(245,240,235,0.5)',
                        border: `1px solid ${form.type === key ? cfg.color + '40' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(245,240,235,0.5)' }}>
                  Data de expiração (opcional)
                </label>
                <input type="datetime-local" value={form.expires_at}
                  onChange={e => setForm(p => ({ ...p, expires_at: e.target.value }))}
                  style={inputStyle} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_pinned}
                  onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))}
                  style={{ accentColor: '#C9A84C' }} />
                <span className="text-sm" style={{ color: 'rgba(245,240,235,0.6)' }}>Fixar comunicado no topo</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Publicar
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
