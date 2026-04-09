'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SECTORS = ['', 'Tech', 'Fintech', 'Health', 'Education', 'Legal', 'Marketing', 'AI', 'Sustainability']

export default function ShowcasePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [sector, setSector] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  supabase.auth.getUser().then(({ data }) => setUser(data.user))
}, [])

useEffect(() => { 
  load()
}, [sector])

  async function load() {
    setLoading(true)
    let q = supabase
      .from('projects')
      .select('*, profiles:founder_id(display_name), project_members(profile_id, profiles:profile_id(display_name))')
      .eq('status', 'closed')
    if (sector) q = q.eq('category', sector)
    const { data } = await q.order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  if (!loading && !user) return (
  <div style={{ minHeight: '100vh', background: '#0D111D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
    <h2 style={{ fontSize: 22, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, maxWidth: 500, lineHeight: 1.6 }}>
      Qui vedrai i team già creati che stanno lavorando a un'idea concreta! Sii il prossimo.
    </h2>
    <img src="/foundy.png" alt="Foundy" style={{ height: 320, width: 'auto', marginTop: 24 }} />
  </div>
)

  return (
    <div style={{ minHeight: '100vh', background: '#0D111D', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40, padding: '2rem 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 999, padding: '5px 14px', fontSize: 13, color: '#F59E0B', marginBottom: 18 }}>
            🏆 Startup pronte per gli investitori
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#F1F5F9', marginBottom: 10 }}>Vetrina</h1>
          <p style={{ fontSize: 16, color: '#94A3B8' }}>Team completi, idee consolidate. Progetti pronti per decollare.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' as const }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
              background: sector === s ? 'rgba(245,158,11,0.12)' : 'none',
              border: sector === s ? '1px solid rgba(245,158,11,0.4)' : '1px solid #2D3F5C',
              color: sector === s ? '#F59E0B' : '#94A3B8',
            }}>{s || 'Tutti'}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>Caricamento...</div>}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>Nessuna startup in vetrina ancora.</p>
            <p style={{ fontSize: 14 }}>Le startup appariranno qui quando avranno completato il team.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {!loading && projects.map(pr => {
            const members = pr.project_members ?? []
            return (
              <div key={pr.id} style={{ background: '#1E293B', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, overflow: 'hidden' }}>
                {pr.image_url
                  ? <img src={pr.image_url} alt={pr.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                  : <div style={{ height: 120, background: 'linear-gradient(135deg,#0F1F0A,#0A2010)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🏆</div>
                }
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{pr.category}</span>}
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>Team completo</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>{pr.title}</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 14 }}>{pr.description}</p>
                  <div style={{ borderTop: '1px solid #2D3F5C', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8 }}>Il team</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                      <a href={`/profile/${pr.founder_id}`} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#8B5CF6', textDecoration: 'none' }}>
                        👑 {pr.profiles?.display_name ?? 'Founder'}
                      </a>
                      {members.map((m: any) => (
                        <span key={m.profile_id} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
                          {m.profiles?.display_name ?? 'Co-founder'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}