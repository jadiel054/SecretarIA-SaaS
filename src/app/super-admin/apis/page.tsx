'use client'

import { useState, useEffect } from 'react'
import {
  Key, Eye, EyeOff, Plus, Trash2, CheckCircle, XCircle,
  Loader2, Save, TestTube, Zap, Globe, MessageSquare,
  CreditCard, Mail, RefreshCw
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface APIKey {
  id: string
  provider: string
  name: string
  key_encrypted: string
  key_preview: string
  is_active: boolean
  is_default: boolean
  last_tested_at?: string
  test_status?: 'success' | 'error' | 'pending'
  extra_config?: Record<string, string>
  created_at: string
}

const PROVIDERS = [
  { id: 'groq', label: 'Groq API', icon: Zap, color: '#F97316', desc: 'Motor principal de IA — Llama 3.3 70B', placeholder: 'gsk_...' },
  { id: 'openai', label: 'OpenAI', icon: Globe, color: '#10B981', desc: 'GPT-4o, GPT-4o-mini', placeholder: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', icon: Globe, color: '#8B5CF6', desc: 'Claude 3.5 Sonnet', placeholder: 'sk-ant-...' },
  { id: 'google', label: 'Google AI', icon: Globe, color: '#3B82F6', desc: 'Gemini Pro', placeholder: 'AIza...' },
  { id: 'evolution', label: 'Evolution API', icon: MessageSquare, color: '#25D366', desc: 'WhatsApp Business API', placeholder: 'URL da instância' },
  { id: 'mercadopago', label: 'Mercado Pago', icon: CreditCard, color: '#009EE3', desc: 'Pagamentos e assinaturas', placeholder: 'APP_USR-...' },
  { id: 'smtp', label: 'SMTP / E-mail', icon: Mail, color: '#6B7280', desc: 'Envio de e-mails transacionais', placeholder: 'smtp.host.com' },
]

function maskKey(key: string): string {
  if (!key || key.length < 8) return '••••••••'
  return `${key.slice(0, 6)}${'•'.repeat(Math.max(key.length - 10, 8))}${key.slice(-4)}`
}

export default function APIsPage() {
  const [keys, setKeys] = useState<APIKey[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [newKey, setNewKey] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState<Record<string, string>>({})
  const [editMode, setEditMode] = useState<Record<string, boolean>>({})
  const [editValue, setEditValue] = useState<Record<string, string>>({})
  const [showEditValue, setShowEditValue] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const supabase = createClient()

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadKeys() {
    setLoading(true)
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .is('barbershop_id', null)
      .order('created_at', { ascending: false })

    if (!error && data) setKeys(data)
    setLoading(false)
  }

  useEffect(() => { loadKeys() }, [])

  async function handleSaveKey(provider: string) {
    const keyValue = newKey[provider]?.trim()
    if (!keyValue) return

    setSaving(provider)
    const preview = maskKey(keyValue)
    const name = newName[provider]?.trim() || `${PROVIDERS.find(p => p.id === provider)?.label} — Principal`

    const { error } = await supabase.from('api_keys').insert({
      provider,
      name,
      key_encrypted: keyValue,
      key_preview: preview,
      is_active: true,
      is_default: true,
    })

    if (error) {
      showToast('Erro ao salvar chave: ' + error.message, 'error')
    } else {
      showToast('Chave salva com sucesso!', 'success')
      setNewKey(prev => ({ ...prev, [provider]: '' }))
      setNewName(prev => ({ ...prev, [provider]: '' }))
      await loadKeys()
    }
    setSaving(null)
  }

  async function handleUpdateKey(keyId: string, provider: string) {
    const keyValue = editValue[keyId]?.trim()
    if (!keyValue) return

    setSaving(keyId)
    const preview = maskKey(keyValue)

    const { error } = await supabase
      .from('api_keys')
      .update({ key_encrypted: keyValue, key_preview: preview, updated_at: new Date().toISOString() })
      .eq('id', keyId)

    if (error) {
      showToast('Erro ao atualizar chave', 'error')
    } else {
      showToast('Chave atualizada!', 'success')
      setEditMode(prev => ({ ...prev, [keyId]: false }))
      setEditValue(prev => ({ ...prev, [keyId]: '' }))
      await loadKeys()
    }
    setSaving(null)
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Tem certeza que deseja remover esta chave?')) return
    const { error } = await supabase.from('api_keys').delete().eq('id', keyId)
    if (error) {
      showToast('Erro ao remover chave', 'error')
    } else {
      showToast('Chave removida', 'success')
      await loadKeys()
    }
  }

  async function handleTestKey(key: APIKey) {
    setTesting(key.id)
    try {
      const response = await fetch('/api/admin/test-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId: key.id, provider: key.provider }),
      })
      const result = await response.json()

      await supabase.from('api_keys').update({
        last_tested_at: new Date().toISOString(),
        test_status: result.success ? 'success' : 'error',
      }).eq('id', key.id)

      showToast(result.success ? `✓ ${key.provider} conectado com sucesso!` : `✗ Erro: ${result.error}`, result.success ? 'success' : 'error')
      await loadKeys()
    } catch {
      showToast('Erro ao testar conexão', 'error')
    }
    setTesting(null)
  }

  async function handleToggleActive(key: APIKey) {
    await supabase.from('api_keys').update({ is_active: !key.is_active }).eq('id', key.id)
    await loadKeys()
  }

  const keysGrouped = PROVIDERS.reduce((acc, p) => {
    acc[p.id] = keys.filter(k => k.provider === p.id)
    return acc
  }, {} as Record<string, APIKey[]>)

  const inputStyle = {
    background: '#222222',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#F5F0EB',
    outline: 'none',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    width: '100%',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: toast.type === 'success' ? '#22C55E' : '#EF4444',
          }}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
            APIs de <span style={{ color: '#C9A84C' }}>IA & Integrações</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Gerencie todas as chaves de API da plataforma. As chaves são armazenadas com segurança no Supabase.
          </p>
        </div>
        <button onClick={loadKeys} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
          style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)', color: '#C9A84C' }}>
          <RefreshCw className="w-4 h-4" /> Atualizar
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl mb-8 flex items-start gap-3"
        style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <Key className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#C9A84C' }} />
        <div>
          <p className="text-sm font-medium" style={{ color: '#C9A84C' }}>Segurança das Chaves</p>
          <p className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Todas as chaves são salvas diretamente no Supabase com RLS ativo. Apenas o Super Admin tem acesso.
            Use o botão de olhinho para visualizar e o botão de teste para validar a conexão.
          </p>
        </div>
      </div>

      {/* Providers */}
      <div className="space-y-6">
        {PROVIDERS.map(provider => {
          const providerKeys = keysGrouped[provider.id] || []
          const hasKeys = providerKeys.length > 0

          return (
            <div key={provider.id}
              className="rounded-2xl overflow-hidden"
              style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
              {/* Provider Header */}
              <div className="flex items-center gap-4 p-5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${provider.color}15` }}>
                  <provider.icon className="w-5 h-5" style={{ color: provider.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: '#F5F0EB' }}>{provider.label}</h3>
                    {hasKeys && (
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {providerKeys.length} chave{providerKeys.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{provider.desc}</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Existing Keys */}
                {providerKeys.map(key => (
                  <div key={key.id}
                    className="p-4 rounded-xl"
                    style={{ background: '#222222', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-sm font-medium" style={{ color: '#F5F0EB' }}>{key.name}</span>
                        {key.test_status && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs"
                            style={{
                              background: key.test_status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                              color: key.test_status === 'success' ? '#22C55E' : '#EF4444',
                            }}>
                            {key.test_status === 'success' ? '✓ Testado' : '✗ Erro'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleActive(key)}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{
                            background: key.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                            color: key.is_active ? '#22C55E' : '#6B7280',
                            border: `1px solid ${key.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)'}`,
                          }}>
                          {key.is_active ? 'Ativa' : 'Inativa'}
                        </button>
                        {/* Test */}
                        <button
                          onClick={() => handleTestKey(key)}
                          disabled={testing === key.id}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                          title="Testar conexão">
                          {testing === key.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <TestTube className="w-4 h-4" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                          title="Remover chave">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Key Value */}
                    {editMode[key.id] ? (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showEditValue[key.id] ? 'text' : 'password'}
                            value={editValue[key.id] || ''}
                            onChange={e => setEditValue(prev => ({ ...prev, [key.id]: e.target.value }))}
                            placeholder="Nova chave..."
                            style={inputStyle}
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditValue(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgba(245,240,235,0.3)' }}>
                            {showEditValue[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <button
                          onClick={() => handleUpdateKey(key.id, provider.id)}
                          disabled={saving === key.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
                          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                          {saving === key.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditMode(prev => ({ ...prev, [key.id]: false }))}
                          className="px-3 py-2 rounded-xl text-sm"
                          style={{ background: '#2A2A2A', color: 'rgba(245,240,235,0.5)' }}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-sm"
                          style={{ background: '#1A1A1A', color: 'rgba(245,240,235,0.6)' }}>
                          {showValues[key.id] ? key.key_encrypted : key.key_preview}
                        </div>
                        <button
                          onClick={() => setShowValues(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                          className="p-2 rounded-lg"
                          style={{ background: '#2A2A2A', color: 'rgba(245,240,235,0.5)' }}
                          title={showValues[key.id] ? 'Ocultar chave' : 'Mostrar chave'}>
                          {showValues[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => setEditMode(prev => ({ ...prev, [key.id]: true }))}
                          className="p-2 rounded-lg text-xs"
                          style={{ background: '#2A2A2A', color: 'rgba(245,240,235,0.5)' }}
                          title="Editar chave">
                          Editar
                        </button>
                      </div>
                    )}

                    {key.last_tested_at && (
                      <p className="text-xs mt-2" style={{ color: 'rgba(245,240,235,0.3)' }}>
                        Último teste: {new Date(key.last_tested_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                ))}

                {/* Add New Key */}
                <div className="p-4 rounded-xl"
                  style={{ background: '#222222', border: '1px dashed rgba(201,168,76,0.2)' }}>
                  <p className="text-xs font-medium mb-3" style={{ color: 'rgba(245,240,235,0.5)' }}>
                    {hasKeys ? 'Adicionar outra chave' : 'Adicionar chave'}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newName[provider.id] || ''}
                      onChange={e => setNewName(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={`Nome (ex: ${provider.label} — Produção)`}
                      style={inputStyle}
                    />
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showValues[`new_${provider.id}`] ? 'text' : 'password'}
                          value={newKey[provider.id] || ''}
                          onChange={e => setNewKey(prev => ({ ...prev, [provider.id]: e.target.value }))}
                          placeholder={provider.placeholder}
                          style={inputStyle}
                          onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowValues(prev => ({ ...prev, [`new_${provider.id}`]: !prev[`new_${provider.id}`] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'rgba(245,240,235,0.3)' }}>
                          {showValues[`new_${provider.id}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSaveKey(provider.id)}
                        disabled={!newKey[provider.id] || saving === provider.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                        style={{
                          background: newKey[provider.id] ? 'linear-gradient(135deg, #C9A84C, #A07830)' : '#2A2A2A',
                          color: newKey[provider.id] ? '#0A0A0A' : 'rgba(245,240,235,0.3)',
                          cursor: newKey[provider.id] ? 'pointer' : 'not-allowed',
                        }}>
                        {saving === provider.id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Plus className="w-4 h-4" />}
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
