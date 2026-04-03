'use client'

import { useState, useEffect } from 'react'
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Clock,
  User, Phone, CheckCircle, XCircle, AlertCircle, Filter
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  client_name: string
  client_phone: string
  scheduled_at: string
  duration_minutes: number
  status: string
  price: number
  notes?: string
  service_id?: string
  barber_id?: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  confirmed: { label: 'Confirmado', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  cancelled: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  completed: { label: 'Concluído', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  no_show: { label: 'Não veio', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [barbershopId, setBarbershopId] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newAppt, setNewAppt] = useState({
    client_name: '', client_phone: '', scheduled_time: '09:00',
    duration_minutes: 30, price: 0, notes: ''
  })
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('barbershop_id').eq('id', user.id).single()
      if (profile?.barbershop_id) setBarbershopId(profile.barbershop_id)
    }
    init()
  }, [])

  useEffect(() => {
    if (barbershopId) loadAppointments()
  }, [barbershopId, selectedDate])

  async function loadAppointments() {
    setLoading(true)
    const dateStr = selectedDate.toISOString().split('T')[0]
    const nextDay = new Date(selectedDate.getTime() + 86400000).toISOString().split('T')[0]

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .gte('scheduled_at', dateStr)
      .lt('scheduled_at', nextDay)
      .order('scheduled_at', { ascending: true })

    setAppointments(data || [])
    setLoading(false)
  }

  async function handleStatusChange(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id)
    await loadAppointments()
  }

  async function handleNewAppointment() {
    if (!barbershopId || !newAppt.client_name || !newAppt.client_phone) return

    const scheduledAt = new Date(selectedDate)
    const [h, m] = newAppt.scheduled_time.split(':').map(Number)
    scheduledAt.setHours(h, m, 0, 0)

    await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      client_name: newAppt.client_name,
      client_phone: newAppt.client_phone,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: newAppt.duration_minutes,
      price: newAppt.price,
      notes: newAppt.notes,
      status: 'confirmed',
    })

    setShowNewModal(false)
    setNewAppt({ client_name: '', client_phone: '', scheduled_time: '09:00', duration_minutes: 30, price: 0, notes: '' })
    await loadAppointments()
  }

  // Calendar grid
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const calendarDays: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ]

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear()
  }

  const inputStyle = {
    background: '#222222', border: '1px solid rgba(255,255,255,0.08)',
    color: '#F5F0EB', outline: 'none', borderRadius: '10px',
    padding: '10px 14px', fontSize: '13px', width: '100%',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>
            Agenda <span style={{ color: '#C9A84C' }}>Inteligente</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Gerencie todos os agendamentos da sua barbearia
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="rounded-2xl p-5"
          style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: '#F5F0EB' }}>
              {MONTHS_PT[month]} {year}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg" style={{ color: 'rgba(245,240,235,0.5)' }}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg" style={{ color: 'rgba(245,240,235,0.5)' }}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_PT.map(d => (
              <div key={d} className="text-center text-xs py-1 font-medium"
                style={{ color: 'rgba(245,240,235,0.4)' }}>{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                disabled={!day}
                onClick={() => day && setSelectedDate(new Date(year, month, day))}
                className="aspect-square flex items-center justify-center text-sm rounded-lg transition-all"
                style={{
                  background: day && isSelected(day) ? 'linear-gradient(135deg, #C9A84C, #A07830)' :
                    day && isToday(day) ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: day && isSelected(day) ? '#0A0A0A' :
                    day && isToday(day) ? '#C9A84C' :
                      day ? 'rgba(245,240,235,0.7)' : 'transparent',
                  fontWeight: day && (isSelected(day) || isToday(day)) ? '600' : '400',
                  cursor: day ? 'pointer' : 'default',
                }}>
                {day || ''}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'rgba(245,240,235,0.5)' }}>
              {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </p>
            <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>
              {appointments.length} agendamento{appointments.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-2xl skeleton" />
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl p-12 text-center"
              style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
              <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: 'rgba(245,240,235,0.2)' }} />
              <p className="font-medium" style={{ color: 'rgba(245,240,235,0.6)' }}>
                Nenhum agendamento para este dia
              </p>
              <button onClick={() => setShowNewModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mx-auto"
                style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
                <Plus className="w-4 h-4" /> Adicionar agendamento
              </button>
            </div>
          ) : (
            appointments.map(appt => {
              const sc = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending
              const time = new Date(appt.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              return (
                <div key={appt.id}
                  className="p-4 rounded-2xl"
                  style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
                        {appt.client_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: '#F5F0EB' }}>{appt.client_name}</div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                            <Clock className="w-3 h-3" /> {time} · {appt.duration_minutes}min
                          </span>
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>
                            <Phone className="w-3 h-3" /> {appt.client_phone}
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>{appt.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                        R$ {appt.price.toFixed(2)}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {appt.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => handleStatusChange(appt.id, 'confirmed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                      </button>
                      <button onClick={() => handleStatusChange(appt.id, 'cancelled')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <XCircle className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  )}
                  {appt.status === 'confirmed' && (
                    <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button onClick={() => handleStatusChange(appt.id, 'completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(107,114,128,0.1)', color: '#9CA3AF', border: '1px solid rgba(107,114,128,0.2)' }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Concluir
                      </button>
                      <button onClick={() => handleStatusChange(appt.id, 'no_show')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <AlertCircle className="w-3.5 h-3.5" /> Não veio
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false) }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}>
            <h2 className="text-lg font-semibold mb-5" style={{ color: '#F5F0EB' }}>
              Novo Agendamento
            </h2>
            <div className="space-y-3">
              <input placeholder="Nome do cliente *" value={newAppt.client_name}
                onChange={e => setNewAppt(p => ({ ...p, client_name: e.target.value }))}
                style={inputStyle} />
              <input placeholder="WhatsApp do cliente *" value={newAppt.client_phone}
                onChange={e => setNewAppt(p => ({ ...p, client_phone: e.target.value }))}
                style={inputStyle} />
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={newAppt.scheduled_time}
                  onChange={e => setNewAppt(p => ({ ...p, scheduled_time: e.target.value }))}
                  style={inputStyle} />
                <input type="number" placeholder="Duração (min)" value={newAppt.duration_minutes}
                  onChange={e => setNewAppt(p => ({ ...p, duration_minutes: Number(e.target.value) }))}
                  style={inputStyle} />
              </div>
              <input type="number" step="0.01" placeholder="Valor (R$)" value={newAppt.price || ''}
                onChange={e => setNewAppt(p => ({ ...p, price: Number(e.target.value) }))}
                style={inputStyle} />
              <textarea placeholder="Observações (opcional)" value={newAppt.notes}
                onChange={e => setNewAppt(p => ({ ...p, notes: e.target.value }))}
                rows={2}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleNewAppointment}
                className="flex-1 py-3 rounded-xl font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                Agendar
              </button>
              <button onClick={() => setShowNewModal(false)}
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
