'use client'
import { useState, useEffect } from 'react'
import {
  Bot, Zap, CheckCircle, XCircle, AlertCircle, Loader2,
  Save, RefreshCw, Settings, MessageSquare, Sliders,
  Brain, Sparkles, Shield, Activity
} from 'lucide-react'

interface BotStatus {
  status: 'active' | 'error' | 'not_configured' | 'timeout' | 'loading'
  message: string
  active: boolean
  models_available?: number
  last_tested?: string
}

interface BotConfig {
  system_prompt: string
  bot_mode: string
  bot_formality: string
  bot_temperature: number
  bot_max_tokens: number
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

const PROMPT_TEMPLATES = [
  {
    label: 'Barbearia Clássica',
    value: `Você é a secretária virtual de uma barbearia. Seu nome é SecretárIA.

Suas responsabilidades:
- Responder dúvidas sobre serviços, preços e horários disponíveis
- Realizar agendamentos de forma simples e eficiente
- Confirmar, reagendar ou cancelar agendamentos existentes
- Enviar lembretes de agendamentos
- Coletar avaliações após os atendimentos

Tom de comunicação: profissional, mas amigável e acolhedor.
Idioma: sempre em português brasileiro.
Seja conciso e objetivo nas respostas.`,
  },
  {
    label: 'Barbearia Premium',
    value: `Você é a assistente virtual exclusiva de uma barbearia premium. Seu nome é SecretárIA.

Missão: Proporcionar uma experiência de atendimento de alto nível, digna de um estabelecimento premium.

Diretrizes:
- Trate cada cliente com distinção e personalização
- Apresente os serviços de forma elegante, destacando o valor e a experiência
- Gerencie agendamentos com precisão e confirmações proativas
- Use linguagem sofisticada mas acessível
- Antecipe as necessidades do cliente

Sempre finalize com uma mensagem de agradecimento personalizada.`,
  },
  {
    label: 'Barbearia Jovem/Descolada',
    value: `Você é a SecretárIA, assistente virtual de uma barbearia moderna e descolada!

Seu estilo:
- Comunicação descontraída e jovial (sem ser informal demais)
- Use emojis com moderação para deixar a conversa mais leve ✂️
- Seja direto e rápido nas respostas
- Mostre entusiasmo pelos serviços

Funções principais:
- Agendamentos rápidos
- Informações sobre serviços e preços
- Confirmações e lembretes
- Coleta de avaliações pós-atendimento`,
  },
]

export default function BotIAPage() {
  const [botStatus, setBotStatus] = useState<BotStatus>({ status: 'loading', message: 'Verificando...', active: false })
  const [config, setConfig] = useState<BotConfig>({
    system_prompt: '',
    bot_mode: 'autonomous',
    bot_formality: 'neutral',
    bot_temperature: 0.7,
    bot_max_tokens: 1024,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'prompt' | 'settings'>('status')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  async function checkBotStatus() {
    setTesting(true)
    setBotStatus(prev => ({ ...prev, status: 'loading', message: 'Verificando conexão com GROQ...' }))
    try {
      const res = await fetch('/api/bot/status')
      const data = await res.json()
      setBotStatus(data)
    } catch {
      setBotStatus({ status: 'error', message: 'Erro ao verificar status', active: false })
    }
    setTesting(false)
  }

  async function loadConfig() {
    try {
      const res = await fetch('/api/bot/prompt')
      const data = await res.json()
      if (!data.error) {
        setConfig({
          system_prompt: data.system_prompt || '',
          bot_mode: data.bot_mode || 'autonomous',
          bot_formality: data.bot_formality || 'neutral',
          bot_temperature: data.bot_temperature ?? 0.7,
          bot_max_tokens: data.bot_max_tokens ?? 1024,
        })
      }
    } catch {
      // silently fail
    }
    setLoading(false)
  }

  useEffect(() => {
    checkBotStatus()
    loadConfig()
  }, [])

  async function handleSavePrompt() {
    setSaving(true)
    try {
      const res = await fetch('/api/bot/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Prompt de treinamento salvo com sucesso!', 'success')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        showToast(data.error || 'Erro ao salvar', 'error')
      }
    } catch {
      showToast('Erro de conexão', 'error')
    }
    setSaving(false)
  }

  function applyTemplate(template: string) {
    setConfig(prev => ({ ...prev, system_prompt: template }))
    showToast('Template aplicado! Clique em Salvar para confirmar.', 'success')
  }

  const statusConfig = {
    active: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', icon: CheckCircle, label: 'Ativo' },
    error: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: XCircle, label: 'Erro' },
    not_configured: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: AlertCircle, label: 'Não Configurado' },
    timeout: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)', icon: AlertCircle, label: 'Timeout' },
    loading: { color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.3)', icon: Loader2, label: 'Verificando' },
  }
  const sc = statusConfig[botStatus.status]
  const StatusIcon = sc.icon

  const tabs = [
    { id: 'status', label: 'Status', icon: Activity },
    { id: 'prompt', label: 'Treinamento', icon: Brain },
    { id: 'settings', label: 'Configurações', icon: Sliders },
  ] as const

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <Bot className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Bot IA</h1>
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
              Secretária virtual inteligente powered by GROQ
            </p>
          </div>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: sc.bg, border: `1px solid ${sc.border}` }}>
          <StatusIcon className={`w-4 h-4 ${botStatus.status === 'loading' ? 'animate-spin' : ''}`}
            style={{ color: sc.color }} />
          <span className="text-xs font-semibold" style={{ color: sc.color }}>{sc.label}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(201,168,76,0.15)' : 'transparent',
              color: activeTab === tab.id ? '#C9A84C' : 'rgba(245,240,235,0.5)',
              border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
            }}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Status */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {/* GROQ Status Card */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#111111', border: `1px solid ${sc.border}` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: sc.bg }}>
                  <Zap className="w-5 h-5" style={{ color: sc.color }} />
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#F5F0EB' }}>GROQ API</div>
                  <div className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>Motor de IA — Llama 3.3 70B</div>
                </div>
              </div>
              <button onClick={checkBotStatus} disabled={testing}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                Testar
              </button>
            </div>

            <div className="p-3 rounded-xl flex items-center gap-3"
              style={{ background: sc.bg }}>
              <StatusIcon className={`w-5 h-5 flex-shrink-0 ${botStatus.status === 'loading' ? 'animate-spin' : ''}`}
                style={{ color: sc.color }} />
              <div>
                <div className="text-sm font-medium" style={{ color: sc.color }}>{botStatus.message}</div>
                {botStatus.models_available !== undefined && (
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.5)' }}>
                    {botStatus.models_available} modelos disponíveis
                  </div>
                )}
                {botStatus.last_tested && (
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
                    Testado em {new Date(botStatus.last_tested).toLocaleTimeString('pt-BR')}
                  </div>
                )}
              </div>
            </div>

            {botStatus.status === 'not_configured' && (
              <div className="mt-3 p-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs" style={{ color: 'rgba(245,240,235,0.6)' }}>
                  <strong style={{ color: '#F59E0B' }}>Como configurar:</strong> Acesse o painel Super Admin → APIs e adicione sua chave GROQ.
                  A chave pode ser obtida gratuitamente em{' '}
                  <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer"
                    style={{ color: '#C9A84C', textDecoration: 'underline' }}>
                    console.groq.com
                  </a>
                </p>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F5F0EB' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#C9A84C' }} />
              Capacidades do Bot
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageSquare, label: 'Agendamentos via WhatsApp', desc: 'Agenda, confirma e cancela' },
                { icon: Brain, label: 'IA Conversacional', desc: 'Llama 3.3 70B via GROQ' },
                { icon: Shield, label: 'Respostas Personalizadas', desc: 'Baseadas no seu prompt' },
                { icon: Activity, label: 'Lembretes Automáticos', desc: 'Notificações proativas' },
              ].map((feat, i) => (
                <div key={i} className="p-3 rounded-xl"
                  style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.1)' }}>
                  <feat.icon className="w-4 h-4 mb-2" style={{ color: '#C9A84C' }} />
                  <div className="text-xs font-semibold" style={{ color: '#F5F0EB' }}>{feat.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>{feat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Prompt de Treinamento */}
      {activeTab === 'prompt' && (
        <div className="space-y-4">
          {/* Templates */}
          <div className="p-4 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F5F0EB' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#C9A84C' }} />
              Templates Prontos
            </h3>
            <div className="flex flex-wrap gap-2">
              {PROMPT_TEMPLATES.map((tpl, i) => (
                <button key={i} onClick={() => applyTemplate(tpl.value)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    color: '#C9A84C',
                    border: '1px solid rgba(201,168,76,0.2)',
                  }}>
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Editor */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#F5F0EB' }}>
                <Brain className="w-4 h-4" style={{ color: '#C9A84C' }} />
                Prompt de Treinamento
              </h3>
              <span className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                {config.system_prompt.length} caracteres
              </span>
            </div>
            <p className="text-xs mb-3" style={{ color: 'rgba(245,240,235,0.5)' }}>
              Este prompt define a personalidade, tom e comportamento do seu Bot IA. Ele é enviado como instrução
              de sistema para cada conversa com seus clientes.
            </p>
            <textarea
              value={config.system_prompt}
              onChange={e => setConfig(prev => ({ ...prev, system_prompt: e.target.value }))}
              placeholder="Descreva como o Bot IA deve se comportar, qual é o nome da sua barbearia, os serviços oferecidos, o tom de comunicação desejado..."
              rows={12}
              style={{
                ...inputStyle,
                resize: 'vertical',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={handleSavePrompt} disabled={saving || loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Prompt'}
              </button>
              {config.system_prompt && (
                <button onClick={() => setConfig(prev => ({ ...prev, system_prompt: '' }))}
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: '#222222', color: 'rgba(245,240,235,0.6)' }}>
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Configurações */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F5F0EB' }}>
              <Settings className="w-4 h-4" style={{ color: '#C9A84C' }} />
              Modo de Operação
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { value: 'autonomous', label: 'Autônomo', desc: 'O bot responde automaticamente sem intervenção humana' },
                { value: 'semi_manual', label: 'Semi-Manual', desc: 'O bot sugere respostas, mas você aprova antes de enviar' },
              ].map(mode => (
                <button key={mode.value} onClick={() => setConfig(prev => ({ ...prev, bot_mode: mode.value }))}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: config.bot_mode === mode.value ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${config.bot_mode === mode.value ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  }}>
                  <div className="text-sm font-semibold mb-1"
                    style={{ color: config.bot_mode === mode.value ? '#C9A84C' : '#F5F0EB' }}>
                    {mode.label}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>{mode.desc}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium mb-2 block" style={{ color: 'rgba(245,240,235,0.6)' }}>
                Formalidade do tom
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'formal', label: 'Formal' },
                  { value: 'neutral', label: 'Neutro' },
                  { value: 'casual', label: 'Casual' },
                ].map(f => (
                  <button key={f.value} onClick={() => setConfig(prev => ({ ...prev, bot_formality: f.value }))}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: config.bot_formality === f.value ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.03)',
                      color: config.bot_formality === f.value ? '#C9A84C' : 'rgba(245,240,235,0.5)',
                      border: `1px solid ${config.bot_formality === f.value ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium mb-2 flex justify-between" style={{ color: 'rgba(245,240,235,0.6)' }}>
                <span>Temperatura (criatividade)</span>
                <span style={{ color: '#C9A84C' }}>{config.bot_temperature.toFixed(1)}</span>
              </label>
              <input type="range" min="0" max="1" step="0.1" value={config.bot_temperature}
                onChange={e => setConfig(prev => ({ ...prev, bot_temperature: Number(e.target.value) }))}
                className="w-full" style={{ accentColor: '#C9A84C' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(245,240,235,0.3)' }}>
                <span>Preciso (0.0)</span>
                <span>Criativo (1.0)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-2 flex justify-between" style={{ color: 'rgba(245,240,235,0.6)' }}>
                <span>Máximo de tokens por resposta</span>
                <span style={{ color: '#C9A84C' }}>{config.bot_max_tokens}</span>
              </label>
              <input type="range" min="256" max="4096" step="256" value={config.bot_max_tokens}
                onChange={e => setConfig(prev => ({ ...prev, bot_max_tokens: Number(e.target.value) }))}
                className="w-full" style={{ accentColor: '#C9A84C' }} />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'rgba(245,240,235,0.3)' }}>
                <span>Curto (256)</span>
                <span>Longo (4096)</span>
              </div>
            </div>
          </div>

          <button onClick={handleSavePrompt} disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      )}
    </div>
  )
}
