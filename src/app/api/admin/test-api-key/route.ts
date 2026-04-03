import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { keyId, provider } = await request.json()

    const supabase = await createAdminClient()

    // Verificar se o usuário é super_admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar a chave
    const { data: apiKey } = await supabase
      .from('api_keys')
      .select('key_encrypted, provider')
      .eq('id', keyId)
      .single()

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Chave não encontrada' })
    }

    const key = apiKey.key_encrypted

    // Testar conforme o provider
    switch (provider) {
      case 'groq': {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (res.ok) return NextResponse.json({ success: true, message: 'Groq conectado!' })
        return NextResponse.json({ success: false, error: 'Chave Groq inválida' })
      }

      case 'openai': {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (res.ok) return NextResponse.json({ success: true, message: 'OpenAI conectado!' })
        return NextResponse.json({ success: false, error: 'Chave OpenAI inválida' })
      }

      case 'anthropic': {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          }),
        })
        if (res.status !== 401) return NextResponse.json({ success: true, message: 'Anthropic conectado!' })
        return NextResponse.json({ success: false, error: 'Chave Anthropic inválida' })
      }

      case 'google': {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        )
        if (res.ok) return NextResponse.json({ success: true, message: 'Google AI conectado!' })
        return NextResponse.json({ success: false, error: 'Chave Google AI inválida' })
      }

      case 'evolution': {
        // Para Evolution API, a chave é a URL + API key separados por |
        const parts = key.split('|')
        if (parts.length < 2) {
          return NextResponse.json({ success: false, error: 'Formato: URL|API_KEY' })
        }
        const [url, apiKey] = parts
        const res = await fetch(`${url}/instance/fetchInstances`, {
          headers: { apikey: apiKey },
        })
        if (res.ok) return NextResponse.json({ success: true, message: 'Evolution API conectada!' })
        return NextResponse.json({ success: false, error: 'Evolution API inacessível' })
      }

      case 'mercadopago': {
        const res = await fetch('https://api.mercadopago.com/v1/account/bank_report/config', {
          headers: { Authorization: `Bearer ${key}` },
        })
        if (res.status !== 401) return NextResponse.json({ success: true, message: 'Mercado Pago conectado!' })
        return NextResponse.json({ success: false, error: 'Token Mercado Pago inválido' })
      }

      default:
        return NextResponse.json({ success: true, message: 'Chave salva (sem teste disponível para este provider)' })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno ao testar chave' }, { status: 500 })
  }
}
