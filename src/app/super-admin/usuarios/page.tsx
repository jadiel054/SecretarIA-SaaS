'use client'
import { useState, useEffect } from 'react'
import { Users, Search, Shield, Store, Loader2, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: string
  barbershop_id?: string
  created_at: string
  barbershop_name?: string
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

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadUsers() {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, barbershop_id, created_at')
        .order('created_at', { ascending: false })

      if (error || !profiles) { setLoading(false); return }

      // Enriquecer com nome da barbearia
      const enriched = await Promise.all(profiles.map(async (p) => {
        if (p.barbershop_id) {
          const { data: bs } = await supabase
            .from('barbershops')
            .select('name')
            .eq('id', p.barbershop_id)
            .single()
          return { ...p, barbershop_name: bs?.name }
        }
        return p
      }))

      setUsers(enriched)
      setLoading(false)
    }
    loadUsers()
  }, [])

  async function handleRoleChange(userId: string, newRole: string) {
    if (!confirm(`Alterar role para "${newRole}"?`)) return
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const roleConfig: Record<string, { color: string; bg: string; label: string }> = {
    super_admin: { color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', label: 'Super Admin' },
    owner: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: 'Proprietário' },
    barber: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', label: 'Barbeiro' },
    client: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Cliente' },
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Usuários</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.4)' }} />
        <input placeholder="Buscar por nome ou e-mail..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '38px' }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map(user => {
              const rc = roleConfig[user.role] || roleConfig.client
              return (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: rc.bg, color: rc.color }}>
                      {(user.full_name || user.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: '#F5F0EB' }}>
                        {user.full_name || 'Sem nome'}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                          <Mail className="w-3 h-3" /> {user.email}
                        </span>
                        {user.barbershop_name && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
                            <Store className="w-3 h-3" /> {user.barbershop_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: rc.bg, color: rc.color }}>
                      {rc.label}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
