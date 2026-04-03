'use client'
import { useState, useEffect } from 'react'
import { Megaphone, Bell, Info, CheckCircle, AlertTriangle, PartyPopper, Loader2, Pin } from 'lucide-react'
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

const typeConfig = {
  info: { icon: Info, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)', label: 'Informação' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', label: 'Aviso' },
  success: { icon: CheckCircle, color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)', label: 'Sucesso' },
  celebration: { icon: PartyPopper, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.2)', label: 'Celebração' },
}

export default function ComunicadosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) setAnnouncements(data)
      setLoading(false)
    }
    init()
  }, [])

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
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Comunicados</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Avisos e atualizações da plataforma SecretárIA
        </p>
      </div>

      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl"
          style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
          <Megaphone className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>Nenhum comunicado no momento</p>
          <p className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
            Novidades e avisos importantes aparecerão aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(ann => {
            const cfg = typeConfig[ann.type] || typeConfig.info
            const TypeIcon = cfg.icon
            return (
              <div key={ann.id} className="p-4 rounded-xl"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${cfg.color}20` }}>
                    <TypeIcon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{ann.title}</h3>
                      {ann.is_pinned && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                          <Pin className="w-2.5 h-2.5" /> Fixado
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${cfg.color}15`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-sm mt-1.5" style={{ color: 'rgba(245,240,235,0.7)' }}>{ann.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Bell className="w-3 h-3" style={{ color: 'rgba(245,240,235,0.3)' }} />
                      <span className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                        {new Date(ann.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </span>
                      {ann.expires_at && (
                        <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                          · Expira em {new Date(ann.expires_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
