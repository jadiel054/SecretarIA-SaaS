'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Store, Clock, Bot, Bell, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'

interface BarbershopConfig {
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  timezone: string
  bot_mode: string
  bot_formality: string
  reminder_hours: number
  system_prompt: string
  whatsapp_number: string
  evolution_instance: string
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<BarbershopConfig>({
    name: '', slug: '', email: '', phone: '', address: '',
    city: '', state: '', timezone: 'America/Sao_Paulo',
    bot_mode: 'autonomous', bot_formality: 'neutral',
    reminder_hours: 2, system_prompt: '', whatsapp_number: '', evolution_instance: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('geral')
  const supabase = createClient()

  useEffect(() => {
    async function loadConfig() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('barbershop_id')
        .eq('id', user.id)
        .single()

      if (profile?.barbershop_id) {
        setBarbershopId(profile.barbershop_id)
        const { data: bs } = await supabase
          .from('barbershops')
          .select('*')
          .eq('id', profile.barbershop_id)
          .single()

        if (bs) {
          setConfig({
            name: bs.name || '',
            slug: bs.slug || '',
            email: bs.email || '',
            phone: bs.phone || '',
            address: bs.address || '',
            city: bs.city || '',
            state: bs.state || '',
            timezone: bs.timezone || 'America/Sao_Paulo',
            bot_mode: bs.bot_mode || 'autonomous',
            bot_formality: bs.bot_formality || 'neutral',
            reminder_hours: bs.reminder_hours || 2,
            system_prompt: bs.system_prompt || '',
            whatsapp_number: bs.whatsapp_number || '',
            evolution_instance: bs.evolution_instance || '',
          })
        }
      }
      setLoading(false)
    }
    loadConfig()
  }, [])

  async function handleSave() {
    setSaving(true)
    if (barbershopId) {
      await supabase.from('barbershops').update(config).eq('id', barbershopId)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: newBs } = await supabase.from('barbershops').insert({
          ...config,
          owner_id: user.id,
          slug: config.slug || slugify(config.name),
        }).select().single()

        if (newBs) {
          setBarbershopId(newBs.id)
          await supabase.from('profiles').update({ barbershop_id: newBs.id }).eq('id', user.id)
        }
      }
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const tabs = [
    { id: 'geral', label: 'Dados Gerais', icon: Store },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'bot', label: 'Configuração do Bot', icon: Bot },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
  ]

  const inputStyle = {
    background: '#222222', border: '1px solid rgba(255,255,255,0.08)',
    color: '#F5F0EB', outline: 'none', borderRadius: '10px',
    padding: '10px 14px', fontSize: '13px', width: '100%',
  }

  const labelStyle = { color: 'rgba(245,240,235,0.7)', fontSize: '13px', fontWeight: '500', marginBottom: '6px', display: 'block' }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
            Configurações da <span style={{ color: '#C9A84C' }}>Barbearia</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Personalize todos os aspectos da sua barbearia e do bot de IA
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{ background: saved ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #C9A84C, #A07830)', color: saved ? '#22C55E' : '#0A0A0A', border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : '#1A1A1A',
              border: `1px solid ${activeTab === tab.id ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: activeTab === tab.id ? '#C9A84C' : 'rgba(245,240,235,0.6)',
            }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-6"
        style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>

        {/* Tab: Dados Gerais */}
        {activeTab === 'geral' && (
          <div className="space-y-4">
            <h2 className="font-semibold mb-4" style={{ color: '#F5F0EB' }}>Dados da Barbearia</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Nome da Barbearia *</label>
                <input value={config.name} onChange={e => setConfig(p => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))}
                  placeholder="Ex: Barbearia Premium" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>Slug (URL)</label>
                <input value={config.slug} onChange={e => setConfig(p => ({ ...p, slug: e.target.value }))}
                  placeholder="barbearia-premium" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input type="email" value={config.email} onChange={e => setConfig(p => ({ ...p, email: e.target.value }))}
                  placeholder="contato@barbearia.com" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>Telefone / WhatsApp</label>
                <input value={config.phone} onChange={e => setConfig(p => ({ ...p, phone: e.target.value }))}
                  placeholder="(11) 99999-9999" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div className="md:col-span-2">
                <label style={labelStyle}>Endereço</label>
                <input value={config.address} onChange={e => setConfig(p => ({ ...p, address: e.target.value }))}
                  placeholder="Rua, número, bairro" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input value={config.city} onChange={e => setConfig(p => ({ ...p, city: e.target.value }))}
                  placeholder="São Paulo" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input value={config.state} onChange={e => setConfig(p => ({ ...p, state: e.target.value }))}
                  placeholder="SP" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>
          </div>
        )}

        {/* Tab: Bot */}
        {activeTab === 'bot' && (
          <div className="space-y-4">
            <h2 className="font-semibold mb-4" style={{ color: '#F5F0EB' }}>Configuração do Bot de IA</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label style={labelStyle}>Modo de Operação</label>
                <select value={config.bot_mode} onChange={e => setConfig(p => ({ ...p, bot_mode: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="autonomous">Autônomo (responde sozinho)</option>
                  <option value="semi_manual">Semi-manual (aguarda aprovação)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Formalidade do Bot</label>
                <select value={config.bot_formality} onChange={e => setConfig(p => ({ ...p, bot_formality: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="formal">Formal</option>
                  <option value="neutral">Neutro</option>
                  <option value="casual">Casual / Descontraído</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Número WhatsApp (Evolution)</label>
                <input value={config.whatsapp_number} onChange={e => setConfig(p => ({ ...p, whatsapp_number: e.target.value }))}
                  placeholder="5511999999999" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
              <div>
                <label style={labelStyle}>Nome da Instância Evolution</label>
                <input value={config.evolution_instance} onChange={e => setConfig(p => ({ ...p, evolution_instance: e.target.value }))}
                  placeholder="minha-barbearia" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Prompt do Sistema (Personalidade do Bot)</label>
              <textarea
                value={config.system_prompt}
                onChange={e => setConfig(p => ({ ...p, system_prompt: e.target.value }))}
                rows={6}
                placeholder="Você é a secretária virtual da [Nome da Barbearia]. Seu objetivo é ajudar os clientes a agendar horários de forma rápida e eficiente. Seja sempre cordial e profissional..."
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
                Este prompt define a personalidade e comportamento do bot. Deixe em branco para usar o padrão.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Notificações */}
        {activeTab === 'notificacoes' && (
          <div className="space-y-4">
            <h2 className="font-semibold mb-4" style={{ color: '#F5F0EB' }}>Configurações de Notificações</h2>
            <div>
              <label style={labelStyle}>Lembrete antecipado (horas antes)</label>
              <input
                type="number"
                min="1"
                max="48"
                value={config.reminder_hours}
                onChange={e => setConfig(p => ({ ...p, reminder_hours: Number(e.target.value) }))}
                style={{ ...inputStyle, width: '120px' }}
                onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <p className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>
                O bot enviará um lembrete automático para o cliente X horas antes do agendamento.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Horários */}
        {activeTab === 'horarios' && (
          <div className="space-y-4">
            <h2 className="font-semibold mb-4" style={{ color: '#F5F0EB' }}>Horários de Funcionamento</h2>
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
              Configure os horários de funcionamento de cada barbeiro individualmente na seção de Barbeiros.
            </p>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)' }}>
              <p className="text-sm" style={{ color: '#C9A84C' }}>
                💡 Os horários são configurados por barbeiro para máxima flexibilidade.
                Acesse <strong>Barbeiros → Editar → Horários</strong> para configurar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
