-- Tabela de barbeiros
CREATE TABLE public.barbers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 50.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  working_hours JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage barbers"
  ON public.barbers FOR ALL
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

CREATE POLICY "Public can view active barbers"
  ON public.barbers FOR SELECT
  USING (is_active = true);

CREATE TRIGGER barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_barbers_barbershop_id ON public.barbers(barbershop_id);

-- Tabela de serviços
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage services"
  ON public.services FOR ALL
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

CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_services_barbershop_id ON public.services(barbershop_id);

-- Preços por barbeiro x serviço
CREATE TABLE public.barber_service_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  UNIQUE(barber_id, service_id)
);

ALTER TABLE public.barber_service_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage prices"
  ON public.barber_service_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.barbers b
      JOIN public.barbershops bs ON bs.id = b.barbershop_id
      WHERE b.id = barber_id AND bs.owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Tabela de clientes
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  loyalty_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold')),
  preferred_barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  last_visit_at TIMESTAMPTZ,
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(barbershop_id, phone)
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage clients"
  ON public.clients FOR ALL
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

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_clients_barbershop_id ON public.clients(barbershop_id);
CREATE INDEX idx_clients_phone ON public.clients(phone);

-- Tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  barbershop_id UUID REFERENCES public.barbershops(id) ON DELETE CASCADE NOT NULL,
  barber_id UUID REFERENCES public.barbers(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  presence_confirmed BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbershop owner can manage appointments"
  ON public.appointments FOR ALL
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

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_appointments_barbershop_id ON public.appointments(barbershop_id);
CREATE INDEX idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX idx_appointments_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appointments_status ON public.appointments(status);
