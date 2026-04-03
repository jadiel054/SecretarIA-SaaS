import Link from 'next/link'
import {
  Scissors, Bot, Calendar, BarChart3, Users, Bell,
  Shield, Star, CheckCircle, ArrowRight, MessageSquare,
  Zap, TrendingUp, Globe
} from 'lucide-react'

export default function HomePage() {
  return (
    <div style={{ background: '#0A0A0A', color: '#F5F0EB', minHeight: '100vh' }}>
      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(201,168,76,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <Scissors className="w-5 h-5" style={{ color: '#0A0A0A' }} />
          </div>
          <span className="text-xl font-bold" style={{ color: '#F5F0EB' }}>
            Secret<span style={{ color: '#C9A84C' }}>á</span>rIA
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Funcionalidades', href: '#funcionalidades' },
            { label: 'Planos', href: '#planos' },
            { label: 'Depoimentos', href: '#depoimentos' },
            { label: 'Contato', href: '#contato' },
          ].map(item => (
            <a key={item.label} href={item.href}
              className="text-sm transition-colors"
              style={{ color: 'rgba(245,240,235,0.6)' }}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login"
            className="hidden md:block text-sm px-4 py-2 rounded-xl transition-all"
            style={{ color: 'rgba(245,240,235,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Entrar
          </Link>
          <Link href="/cadastro"
            className="text-sm px-4 py-2 rounded-xl font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(ellipse, #C9A84C, transparent)' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
            <Zap className="w-4 h-4" />
            Powered by IA Avançada — Groq + GPT-4o
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Sua barbearia{' '}
            <span style={{
              background: 'linear-gradient(135deg, #E8C96A, #C9A84C, #A07830)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              atendendo 24h
            </span>
            {' '}com IA
          </h1>

          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed"
            style={{ color: 'rgba(245,240,235,0.7)' }}>
            A SecretárIA automatiza agendamentos, responde clientes no WhatsApp e
            gerencia toda sua operação. Enquanto você corta cabelo, a IA trabalha por você.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/cadastro"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
              Começar grátis por 14 dias
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#depoimentos"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg"
              style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
              Ver depoimentos
            </a>
          </div>

          <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
            Sem cartão de crédito · Cancele quando quiser · Setup em 5 minutos
          </p>

          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            {[
              { value: '24/7', label: 'Atendimento contínuo' },
              { value: '3x', label: 'Mais agendamentos' },
              { value: '80%', label: 'Menos no-shows' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold mb-1" style={{ color: '#C9A84C' }}>{stat.value}</div>
                <div className="text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 rounded-full text-sm mb-4"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
              Funcionalidades
            </div>
            <h2 className="text-4xl font-bold mb-4">Tudo que sua barbearia precisa</h2>
            <p className="text-lg" style={{ color: 'rgba(245,240,235,0.6)' }}>
              Uma plataforma completa para automatizar, gerenciar e crescer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: 'Bot de IA Avançado', desc: 'Atendimento automatizado 24/7 via WhatsApp. Agenda, responde dúvidas e converte clientes enquanto você dorme.' },
              { icon: Calendar, title: 'Agenda Inteligente', desc: 'Verificação de disponibilidade em tempo real. Modo autônomo ou semi-manual. Lembretes automáticos.' },
              { icon: BarChart3, title: 'Analytics Completo', desc: 'Métricas financeiras e operacionais. Filtros de 7 a 60 dias. Tome decisões baseadas em dados.' },
              { icon: Users, title: 'Gestão de Equipe', desc: 'Controle de barbeiros, comissões, horários e desempenho individual em um painel centralizado.' },
              { icon: Bell, title: 'Notificações Proativas', desc: 'Lembretes automáticos, confirmação de presença, alertas de feriados com mensagens temáticas por IA.' },
              { icon: Shield, title: 'Multi-tenant Seguro', desc: 'Isolamento total de dados entre barbearias. Row Level Security, 2FA e logs de auditoria.' },
              { icon: MessageSquare, title: 'WhatsApp Nativo', desc: 'Integração via Evolution API. Bot responde, agenda e encaminha mídias. Histórico completo no painel.' },
              { icon: TrendingUp, title: 'Fidelização & Pontos', desc: 'Sistema de pontos, planos de assinatura, régua de relacionamento e avaliações pós-atendimento.' },
              { icon: Globe, title: 'Página Pública', desc: 'Cada barbearia recebe uma página pública com SEO, QR Code e link personalizado para agendamento.' },
            ].map(feature => (
              <div key={feature.title}
                className="p-6 rounded-2xl"
                style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(201,168,76,0.1)' }}>
                  <feature.icon className="w-6 h-6" style={{ color: '#C9A84C' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#F5F0EB' }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,240,235,0.6)' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="planos" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 rounded-full text-sm mb-4"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
              Plano Profissional
            </div>
            <h2 className="text-4xl font-bold mb-4">Investimento em crescimento</h2>
          </div>

          <div className="max-w-md mx-auto rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1A1A1A, #222222)',
              border: '2px solid rgba(201,168,76,0.4)',
              boxShadow: '0 0 60px rgba(201,168,76,0.15)',
            }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C96A, #C9A84C)' }} />

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#F5F0EB' }}>Plano Profissional</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(245,240,235,0.5)' }}>Acesso completo a todas as funcionalidades</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-5xl font-bold" style={{ color: '#C9A84C' }}>R$ 199</span>
                <span className="text-lg mb-2" style={{ color: 'rgba(245,240,235,0.5)' }}>/mês</span>
              </div>
              <p className="text-sm mt-2" style={{ color: 'rgba(245,240,235,0.4)' }}>+ Setup inicial de R$ 300,00</p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'Barbeiros ilimitados', 'Clientes ilimitados', 'Bot IA 24/7 via WhatsApp',
                'Agenda inteligente em tempo real', 'Analytics completo com 6 presets',
                'Gestão de feriados com IA', 'Sistema de fidelização e pontos',
                'Campanhas de marketing via WhatsApp', 'Notificações proativas configuráveis',
                'Multi-tenant com isolamento de dados', 'Suporte prioritário',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#C9A84C' }} />
                  <span className="text-sm" style={{ color: 'rgba(245,240,235,0.8)' }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/cadastro"
              className="block text-center py-4 rounded-2xl font-bold text-lg"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
              Começar grátis por 14 dias
            </Link>
            <p className="text-center text-xs mt-3" style={{ color: 'rgba(245,240,235,0.4)' }}>
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-1 rounded-full text-sm mb-4"
              style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>
              Depoimentos
            </div>
            <h2 className="text-4xl font-bold">O que os donos dizem</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Izaías Martins', business: 'Barbearia Ty_Zah', rating: 5,
                text: 'A SecretárIA transformou minha barbearia. O bot responde clientes 24/7 e minha agenda nunca esteve tão cheia. Reduzi no-shows em 80%!',
              },
              {
                name: 'Carlos Eduardo', business: 'Barbearia Premium CE', rating: 5,
                text: 'Antes eu perdia clientes por não responder rápido. Agora o bot responde na hora, agenda e ainda manda lembrete. Faturamento subiu 40%.',
              },
              {
                name: 'Rafael Santos', business: 'Studio Rafael Barber', rating: 5,
                text: 'O analytics me mostrou que minhas terças eram ociosas. Criei uma promoção e agora são os dias mais cheios. Incrível!',
              },
            ].map(review => (
              <div key={review.name} className="p-6 rounded-2xl"
                style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.15)' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#C9A84C' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(245,240,235,0.7)' }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{review.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>{review.business}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-12 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #1A1A1A, #222222)', border: '1px solid rgba(201,168,76,0.3)' }}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
                style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Pronto para transformar sua barbearia?</h2>
              <p className="text-lg mb-8" style={{ color: 'rgba(245,240,235,0.6)' }}>
                Junte-se ao programa de acesso antecipado. 14 dias grátis, sem cartão de crédito.
              </p>
              <Link href="/cadastro"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}>
                Começar agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contato" className="py-12 px-6" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
                <Scissors className="w-4 h-4" style={{ color: '#0A0A0A' }} />
              </div>
              <span className="font-bold" style={{ color: '#F5F0EB' }}>
                Secret<span style={{ color: '#C9A84C' }}>á</span>rIA
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
              <a href="#">Privacidade</a>
              <a href="#">Termos</a>
              <a href="mailto:contato@secretaria.app">Contato</a>
            </div>
            <p className="text-sm" style={{ color: 'rgba(245,240,235,0.3)' }}>
              © 2025 SecretárIA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
