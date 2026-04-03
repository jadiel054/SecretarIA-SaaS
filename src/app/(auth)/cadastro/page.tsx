'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Scissors, Mail, Lock, User, Phone, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function CadastroPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado. Faça login.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleSignup() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError('Erro ao conectar com Google.')
      setLoading(false)
    }
  }

  const inputStyle = {
    background: '#222222',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#F5F0EB',
    outline: 'none',
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: '#0A0A0A' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{ background: '#1A1A1A', border: '1px solid rgba(201,168,76,0.2)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <Mail className="w-8 h-8" style={{ color: '#22C55E' }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB' }}>
            Verifique seu e-mail
          </h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(245,240,235,0.6)' }}>
            Enviamos um link de confirmação para <strong style={{ color: '#C9A84C' }}>{formData.email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 rounded-xl font-semibold text-sm"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#0A0A0A' }}
          >
            Ir para o Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0A0A0A 0%, #111111 50%, #0A0A0A 100%)' }}
    >
      <div className="w-full max-w-md">
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
            Crie sua conta gratuitamente
          </p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: '#1A1A1A',
            border: '1px solid rgba(201,168,76,0.2)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#F5F0EB' }}>
            Criar conta — 14 dias grátis
          </h2>

          {/* Google */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-6 transition-all duration-200 font-medium"
            style={{ background: '#222222', border: '1px solid rgba(255,255,255,0.1)', color: '#F5F0EB' }}
          >
            <Globe className="w-5 h-5" style={{ color: '#4285F4' }} />
            Continuar com Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs" style={{ color: 'rgba(245,240,235,0.4)' }}>ou cadastre com e-mail</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444' }}>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                  placeholder="Seu nome completo"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(245,240,235,0.3)' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(245,240,235,0.7)' }}>Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(245,240,235,0.3)' }} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Repita a senha"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#C9A84C'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 mt-2"
              style={{
                background: loading ? '#555' : 'linear-gradient(135deg, #C9A84C, #A07830)',
                color: '#0A0A0A',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(245,240,235,0.5)' }}>
            Já tem conta?{' '}
            <Link href="/login" style={{ color: '#C9A84C' }}>Fazer login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
