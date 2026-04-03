'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors, Mail, Lock, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
      setLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role === 'super_admin') {
        router.push('/super-admin')
      } else {
        router.push('/painel')
      }
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError('Erro ao conectar com Google. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)' }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }}
        />
      </div>

      <div className="w-full max-w-md relative" style={{ zIndex: 1 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)' }}>
            <Scissors className="w-8 h-8" style={{ color: '#0A0A0A' }} />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#F5F0EB' }}>
            Secret<span style={{ color: '#C9A84C' }}>á</span>rIA
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Secretária Inteligente para Barbearias
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(201,168,76,0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F5F0EB' }}>
            Entrar na plataforma
          </h2>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-6 transition-all duration-200 font-medium"
            style={{
              background: '#222222',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F5F0EB',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#C9A84C'
              e.currentTarget.style.background = '#2A2A2A'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = '#222222'
            }}
          >
            <Globe className="w-5 h-5" style={{ color: '#4285F4' }} />
            Continuar com Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>
              ou entre com e-mail
            </span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#EF4444',
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: '#222222',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F5F0EB',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: '#222222',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#F5F0EB',
                    outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(245,240,235,0.3)' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/recuperar-senha"
                className="text-sm transition-colors"
                style={{ color: '#C9A84C' }}
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200"
              style={{
                background: loading ? '#555' : 'linear-gradient(135deg, #C9A84C, #A07830)',
                color: '#0A0A0A',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Não tem conta?{' '}
            <Link href="/cadastro" style={{ color: '#C9A84C' }}>
              Criar conta grátis
            </Link>
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(245,240,235,0.3)' }}>
          © 2025 SecretárIA. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}
