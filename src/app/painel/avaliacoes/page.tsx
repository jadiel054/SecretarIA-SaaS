'use client'
import { useState, useEffect } from 'react'
import { Star, Loader2, TrendingUp, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  client_name: string
  rating: number
  comment?: string
  created_at: string
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className="w-4 h-4"
          style={{ color: i <= rating ? '#C9A84C' : 'rgba(201,168,76,0.2)', fill: i <= rating ? '#C9A84C' : 'transparent' }} />
      ))}
    </div>
  )
}

export default function AvaliacoesPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase
        .from('profiles').select('barbershop_id').eq('id', user.id).single()
      if (!profile?.barbershop_id) { setLoading(false); return }

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('barbershop_id', profile.barbershop_id)
        .order('created_at', { ascending: false })

      if (!error && data) setReviews(data)
      setLoading(false)
    }
    init()
  }, [])

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#C9A84C' }} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Avaliações</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Feedback dos seus clientes
        </p>
      </div>

      {reviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Average */}
          <div className="p-5 rounded-2xl flex items-center gap-5"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="text-center">
              <div className="text-5xl font-bold" style={{ color: '#C9A84C' }}>{avgRating.toFixed(1)}</div>
              <StarRating rating={Math.round(avgRating)} />
              <div className="text-xs mt-1" style={{ color: 'rgba(245,240,235,0.4)' }}>{reviews.length} avaliações</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {distribution.map(d => (
                <div key={d.star} className="flex items-center gap-2">
                  <span className="text-xs w-3" style={{ color: 'rgba(245,240,235,0.5)' }}>{d.star}</span>
                  <Star className="w-3 h-3" style={{ color: '#C9A84C', fill: '#C9A84C' }} />
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${d.pct}%`, background: '#C9A84C' }} />
                  </div>
                  <span className="text-xs w-4 text-right" style={{ color: 'rgba(245,240,235,0.4)' }}>{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4" style={{ color: '#C9A84C' }} />
              <span className="text-sm font-semibold" style={{ color: '#F5F0EB' }}>Resumo</span>
            </div>
            {[
              { label: 'Avaliações 5 estrelas', value: `${distribution[0].count} (${distribution[0].pct.toFixed(0)}%)`, color: '#22C55E' },
              { label: 'Avaliações 4 estrelas', value: `${distribution[1].count} (${distribution[1].pct.toFixed(0)}%)`, color: '#C9A84C' },
              { label: 'Avaliações negativas (1–2)', value: `${distribution[3].count + distribution[4].count}`, color: '#EF4444' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2"
                style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <span className="text-xs" style={{ color: 'rgba(245,240,235,0.5)' }}>{item.label}</span>
                <span className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-2xl"
          style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
          <Star className="w-12 h-12" style={{ color: 'rgba(201,168,76,0.3)' }} />
          <p className="text-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
            Nenhuma avaliação recebida ainda
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(245,240,235,0.3)' }}>
            As avaliações são enviadas automaticamente pelo Bot IA após a conclusão dos agendamentos
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="p-4 rounded-xl"
              style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#F5F0EB' }}>{review.client_name}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(245,240,235,0.4)' }}>
                    {new Date(review.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <div className="flex items-start gap-2 mt-2 p-3 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'rgba(245,240,235,0.3)' }} />
                  <p className="text-xs" style={{ color: 'rgba(245,240,235,0.6)' }}>{review.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
