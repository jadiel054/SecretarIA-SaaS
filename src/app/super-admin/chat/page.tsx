'use client'
import { MessageSquare, Construction } from 'lucide-react'

export default function SuperAdminChatPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>Chat Interno</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,240,235,0.5)' }}>
          Comunicação direta com proprietários de barbearias
        </p>
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
        style={{ background: '#111111', border: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(201,168,76,0.1)' }}>
          <MessageSquare className="w-8 h-8" style={{ color: '#C9A84C' }} />
        </div>
        <div className="text-center">
          <div className="font-semibold mb-1" style={{ color: '#F5F0EB' }}>Chat em Desenvolvimento</div>
          <p className="text-sm max-w-sm" style={{ color: 'rgba(245,240,235,0.4)' }}>
            O módulo de chat interno está sendo desenvolvido e estará disponível em breve.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <Construction className="w-3.5 h-3.5" style={{ color: '#C9A84C' }} />
          <span className="text-xs font-medium" style={{ color: '#C9A84C' }}>Em breve</span>
        </div>
      </div>
    </div>
  )
}
