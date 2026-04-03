-- Tabela de chaves de API (Super Admin)
CREATE TABLE public.api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('groq', 'openai', 'anthropic', 'google', 'evolution', 'mercadopago', 'google_calendar', 'smtp')),
  name TEXT NOT NULL,
  key_encrypted TEXT NOT NULL,
  key_preview TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  last_tested_at TIMESTAMPTZ,
  test_status TEXT CHECK (test_status IN ('success', 'error', 'pending')),
  extra_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admin can manage api keys"
  ON public.api_keys FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_api_keys_provider ON public.api_keys(provider);
CREATE INDEX idx_api_keys_barbershop_id ON public.api_keys(barbershop_id);

-- Tabela de configurações globais do sistema
CREATE TABLE public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only super admin can manage system config"
  ON public.system_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Inserir configurações padrão
INSERT INTO public.system_config (key, value, description) VALUES
  ('active_ai_provider', 'groq', 'Provedor de IA ativo'),
  ('active_ai_model', 'llama-3.3-70b-versatile', 'Modelo de IA ativo'),
  ('bot_temperature', '0.7', 'Temperatura padrão do bot'),
  ('bot_max_tokens', '1024', 'Máximo de tokens por resposta'),
  ('bot_context_messages', '10', 'Mensagens de contexto do bot'),
  ('trial_days', '14', 'Dias de trial gratuito'),
  ('monthly_price', '199.00', 'Preço mensal do plano profissional'),
  ('platform_name', 'SecretárIA', 'Nome da plataforma'),
  ('platform_email', 'contato@secretaria.app', 'Email da plataforma'),
  ('max_messages_per_day', '100', 'Limite de mensagens por cliente por dia'),
  ('session_expiry_hours', '24', 'Horas para expirar sessão'),
  ('max_login_attempts', '5', 'Máximo de tentativas de login');

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('appointment', 'cancellation', 'holiday', 'system', 'message', 'payment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Tabela de comunicados
CREATE TABLE public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'celebration')),
  target TEXT NOT NULL DEFAULT 'all' CHECK (target IN ('all', 'specific')),
  target_barbershop_ids UUID[],
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Owners can view announcements"
  ON public.announcements FOR SELECT
  USING (
    target = 'all' OR
    (target = 'specific' AND EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE owner_id = auth.uid() AND id = ANY(target_barbershop_ids)
    ))
  );

-- Tabela de leituras de comunicados
CREATE TABLE public.announcement_reads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own reads"
  ON public.announcement_reads FOR ALL
  USING (user_id = auth.uid());

-- Tabela de chat interno (Admin <-> Dono)
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  group_id UUID,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'pdf', 'video', 'audio')),
  media_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.chat_messages FOR SELECT
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON public.chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_barbershop ON public.chat_messages(barbershop_id);

-- Tabela de feriados
CREATE TABLE public.holidays (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'national' CHECK (type IN ('national', 'custom')),
  is_working BOOLEAN,
  open_time TEXT,
  close_time TEXT,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage holidays"
  ON public.holidays FOR ALL
  USING (
    barbershop_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE id = barbershop_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Tabela de avaliações
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can view reviews"
  ON public.reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.barbershops
      WHERE id = barbershop_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "System can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_reviews_barbershop_id ON public.reviews(barbershop_id);
