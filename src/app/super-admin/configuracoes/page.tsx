'use client'
import { useState, useEffect } from 'react'
import { Settings, Save, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SystemConfig {
  key: string
  value: string
  description?: string
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

const CONFIG_LABELS: Record<string, string> = {
  active_ai_provider: 'Provedor de IA Ativo',
  active_ai_model: 'Modelo de IA Ativo',
  bot_temperature: 'Temperatura Padrão do Bot',
  bot_max_tokens: 'Máximo de Tokens por Resposta',
  bot_context_messages: 'Mensagens de Contexto',
  trial_days: 'Dias de Trial Gratuito',
  monthly_price: 'Preço Mensal (R$)',
  platform_name: 'Nome da Plataforma',
  platform_email: 'E-mail da Plataforma',
  max_messages_per_day: 'Limite de Mensagens por Dia',
  session_expiry_hours: 'Horas para Expirar Sessão',
  max_login_attempts: 'Máximo de Tentativas de Login',
}

export default function SuperAdminConfiguracoesPage() {
  const [configs, setConfigs] = useState<SystemConfig[]>([])
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadConfigs() {
    setLoading(true)
    const { data, error } = await supabase
      .from('system_config')
      .select('key, value, description')
      .order('key')
    if (!error && data) {
      setConfigs(data)
      const vals: Record<string, string> = {}
      data.forEach(c => { vals[c.key] = c.value })
      setEditValues(vals)
    }
    setLoading(false)
  }

  useEffect(() => { loadConfigs() }, [])

  async function handleSave(key: string) {
    setSaving(key)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('system_config')
      .update({ value: editValues[key], updated_by: user?.id })
      .eq('key', key)
    setSaving(null)
    if (error) { showToast('Erro ao salvar configuração', 'error'); return }
    showToast(`"${CONFIG_LABELS[key] || key}" atualizado!`, 'success')
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
    setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: editValues[key] } : c))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Configurações do Sistema</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Parâmetros globais da plataforma SecretárIA
          </p>
        </div>
        <button onClick={loadConfigs}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map(config => (
            <div key={config.key} className="p-4 rounded-xl"
              style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: '#F5F0EB' }}>
                  {CONFIG_LABELS[config.key] || config.key}
                </label>
                <code className="text-xs px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(245,240,235,0.4)' }}>
                  {config.key}
                </code>
              </div>
              {config.description && (
                <p className="text-xs mb-2" style={{ color: 'rgba(245,240,235,0.4)' }}>{config.description}</p>
              )}
              <div className="flex gap-2">
                <input
                  value={editValues[config.key] || ''}
                  onChange={e => setEditValues(prev => ({ ...prev, [config.key]: e.target.value }))}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={() => handleSave(config.key)}
                  disabled={saving === config.key || editValues[config.key] === config.value}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                  style={{
                    background: saved === config.key ? 'rgba(34,197,94,0.1)' : 'rgba(201,168,76,0.1)',
                    color: saved === config.key ? '#22C55E' : '#C9A84C',
                    border: `1px solid ${saved === config.key ? 'rgba(34,197,94,0.3)' : 'rgba(201,168,76,0.2)'}`,
                    opacity: editValues[config.key] === config.value ? 0.5 : 1,
                  }}>
                  {saving === config.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                    saved === config.key ? <CheckCircle className="w-3.5 h-3.5" /> :
                      <Save className="w-3.5 h-3.5" />}
                  {saving === config.key ? 'Salvando' : saved === config.key ? 'Salvo' : 'Salvar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
