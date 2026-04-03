// ============================================================
// TIPOS GLOBAIS DO SISTEMA SecretárIA
// ============================================================

export type UserRole = 'super_admin' | 'owner' | 'barber' | 'client'

export type BarbershopStatus = 'active' | 'suspended' | 'trial' | 'expired'

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'

export type BotMode = 'autonomous' | 'semi_manual'

export type AIProvider = 'groq' | 'openai' | 'anthropic' | 'google'

export type NotificationType = 'appointment' | 'cancellation' | 'holiday' | 'system' | 'message'

// ============================================================
// USUÁRIO E PERFIL
// ============================================================

export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: UserRole
  barbershop_id?: string
  is_active: boolean
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

// ============================================================
// BARBEARIA (TENANT)
// ============================================================

export interface Barbershop {
  id: string
  name: string
  slug: string
  owner_id: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  logo_url?: string
  status: BarbershopStatus
  bot_mode: BotMode
  trial_ends_at?: string
  subscription_ends_at?: string
  plan: 'trial' | 'professional'
  monthly_price: number
  timezone: string
  language: string
  theme: 'dark' | 'light'
  created_at: string
  updated_at: string
}

// ============================================================
// BARBEIRO
// ============================================================

export interface Barber {
  id: string
  barbershop_id: string
  user_id?: string
  name: string
  email?: string
  phone?: string
  avatar_url?: string
  commission_percentage: number
  is_active: boolean
  working_hours: WorkingHours
  created_at: string
}

export interface WorkingHours {
  monday?: DaySchedule
  tuesday?: DaySchedule
  wednesday?: DaySchedule
  thursday?: DaySchedule
  friday?: DaySchedule
  saturday?: DaySchedule
  sunday?: DaySchedule
}

export interface DaySchedule {
  is_open: boolean
  open_time: string
  close_time: string
  break_start?: string
  break_end?: string
}

// ============================================================
// SERVIÇO
// ============================================================

export interface Service {
  id: string
  barbershop_id: string
  name: string
  description?: string
  duration_minutes: number
  base_price: number
  is_active: boolean
  created_at: string
}

export interface BarberServicePrice {
  id: string
  barber_id: string
  service_id: string
  price: number
}

// ============================================================
// AGENDAMENTO
// ============================================================

export interface Appointment {
  id: string
  barbershop_id: string
  barber_id: string
  client_id?: string
  client_name: string
  client_phone: string
  service_id: string
  status: AppointmentStatus
  scheduled_at: string
  duration_minutes: number
  price: number
  notes?: string
  confirmed_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  created_at: string
  // Relations
  barber?: Barber
  service?: Service
}

// ============================================================
// CLIENTE
// ============================================================

export interface Client {
  id: string
  barbershop_id: string
  name: string
  phone: string
  email?: string
  avatar_url?: string
  points: number
  loyalty_tier: 'bronze' | 'silver' | 'gold'
  preferred_barber_id?: string
  last_visit_at?: string
  total_visits: number
  total_spent: number
  is_active: boolean
  created_at: string
}

// ============================================================
// CHAVES DE API (SUPER ADMIN)
// ============================================================

export interface APIKey {
  id: string
  provider: AIProvider | 'evolution' | 'mercadopago' | 'google_calendar' | 'smtp'
  name: string
  key_encrypted: string
  key_preview: string // últimos 4 chars
  is_active: boolean
  is_default: boolean
  barbershop_id?: string // null = global
  last_tested_at?: string
  test_status?: 'success' | 'error' | 'pending'
  created_at: string
  updated_at: string
}

// ============================================================
// CONFIGURAÇÕES GLOBAIS
// ============================================================

export interface SystemConfig {
  id: string
  key: string
  value: string
  description?: string
  updated_at: string
}

// ============================================================
// COMUNICADOS
// ============================================================

export interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'celebration'
  target: 'all' | 'specific'
  target_barbershop_ids?: string[]
  is_pinned: boolean
  expires_at?: string
  created_by: string
  created_at: string
}

// ============================================================
// ANALYTICS
// ============================================================

export interface AnalyticsPeriod {
  start_date: string
  end_date: string
  label: string
}

export interface DashboardMetrics {
  total_revenue: number
  total_appointments: number
  confirmed_appointments: number
  cancelled_appointments: number
  new_clients: number
  returning_clients: number
  cancellation_rate: number
  avg_revenue_per_day: number
  top_services: ServiceMetric[]
  top_barbers: BarberMetric[]
  revenue_by_day: DayRevenue[]
}

export interface ServiceMetric {
  service_id: string
  service_name: string
  count: number
  revenue: number
  percentage: number
}

export interface BarberMetric {
  barber_id: string
  barber_name: string
  appointments: number
  revenue: number
  commission: number
}

export interface DayRevenue {
  date: string
  revenue: number
  appointments: number
}

// ============================================================
// NOTIFICAÇÃO
// ============================================================

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  is_read: boolean
  data?: Record<string, unknown>
  created_at: string
}
