-- Tabela de barbearias (tenants)
CREATE TABLE public.barbershops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'suspended', 'trial', 'expired')),
  bot_mode TEXT NOT NULL DEFAULT 'autonomous' CHECK (bot_mode IN ('autonomous', 'semi_manual')),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  subscription_ends_at TIMESTAMPTZ,
  plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'professional')),
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 199.00,
  timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  language TEXT NOT NULL DEFAULT 'pt-BR',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  evolution_instance TEXT,
  whatsapp_number TEXT,
  google_calendar_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_hours INTEGER NOT NULL DEFAULT 2,
  bot_temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  bot_max_tokens INTEGER NOT NULL DEFAULT 1024,
  bot_context_messages INTEGER NOT NULL DEFAULT 10,
  bot_formality TEXT NOT NULL DEFAULT 'neutral' CHECK (bot_formality IN ('formal', 'neutral', 'casual')),
  system_prompt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view own barbershop"
  ON public.barbershops FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Owner can update own barbershop"
  ON public.barbershops FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Super admin full access"
  ON public.barbershops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can insert"
  ON public.barbershops FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE TRIGGER barbershops_updated_at
  BEFORE UPDATE ON public.barbershops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Índices
CREATE INDEX idx_barbershops_owner_id ON public.barbershops(owner_id);
CREATE INDEX idx_barbershops_status ON public.barbershops(status);
CREATE INDEX idx_barbershops_slug ON public.barbershops(slug);
