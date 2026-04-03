import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ system_prompt: '', bot_mode: 'autonomous', bot_formality: 'neutral' })
    }

    const { data: bs } = await supabase
      .from('barbershops')
      .select('system_prompt, bot_mode, bot_formality, bot_temperature, bot_max_tokens')
      .eq('id', profile.barbershop_id)
      .single()

    return NextResponse.json({
      system_prompt: bs?.system_prompt || '',
      bot_mode: bs?.bot_mode || 'autonomous',
      bot_formality: bs?.bot_formality || 'neutral',
      bot_temperature: bs?.bot_temperature || 0.7,
      bot_max_tokens: bs?.bot_max_tokens || 1024,
    })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const body = await req.json()
    const { system_prompt, bot_mode, bot_formality, bot_temperature, bot_max_tokens } = body

    const { data: profile } = await supabase
      .from('profiles')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!profile?.barbershop_id) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
    }

    const { error } = await supabase
      .from('barbershops')
      .update({
        system_prompt: system_prompt || null,
        bot_mode: bot_mode || 'autonomous',
        bot_formality: bot_formality || 'neutral',
        bot_temperature: bot_temperature ?? 0.7,
        bot_max_tokens: bot_max_tokens ?? 1024,
      })
      .eq('id', profile.barbershop_id)

    if (error) return NextResponse.json({ error: 'Erro ao salvar prompt' }, { status: 500 })

    return NextResponse.json({ success: true, message: 'Prompt de treinamento salvo com sucesso!' })
  } catch {
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
