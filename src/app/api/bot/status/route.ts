import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    // Verificar se o usuário tem acesso (owner ou super_admin)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, barbershop_id')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 403 })

    // Buscar a chave GROQ ativa (global ou da barbearia)
    let groqKey = null

    // Primeiro tenta chave global (super admin)
    const { data: globalKey } = await supabase
      .from('api_keys')
      .select('key_encrypted, is_active, test_status, last_tested_at')
      .eq('provider', 'groq')
      .eq('is_default', true)
      .is('barbershop_id', null)
      .single()

    if (globalKey) {
      groqKey = globalKey
    } else if (profile.barbershop_id) {
      // Tenta chave específica da barbearia
      const { data: bsKey } = await supabase
        .from('api_keys')
        .select('key_encrypted, is_active, test_status, last_tested_at')
        .eq('provider', 'groq')
        .eq('barbershop_id', profile.barbershop_id)
        .single()
      if (bsKey) groqKey = bsKey
    }

    if (!groqKey) {
      return NextResponse.json({
        status: 'not_configured',
        message: 'Nenhuma chave GROQ configurada',
        active: false,
      })
    }

    // Testar a chave ao vivo
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${groqKey.key_encrypted}` },
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        const data = await res.json()
        const models = data.data?.map((m: { id: string }) => m.id) || []
        return NextResponse.json({
          status: 'active',
          message: 'GROQ API conectada e funcionando',
          active: true,
          models_available: models.length,
          last_tested: new Date().toISOString(),
        })
      } else {
        return NextResponse.json({
          status: 'error',
          message: 'Chave GROQ inválida ou expirada',
          active: false,
        })
      }
    } catch {
      return NextResponse.json({
        status: 'timeout',
        message: 'Não foi possível conectar à API GROQ (timeout)',
        active: false,
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
