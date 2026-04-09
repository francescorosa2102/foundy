'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SECTORS = ['', 'Blockchain & Crypto', 'Crescita personale', 'Cybersecurity', 'Data & Analytics', 'Design & UX/UI', 'E-commerce & Marketplace', 'Educazione & Formazione', 'Energia & Smart cities', 'Finanza personale & Investimenti', 'Fintech', 'Fitness & Sport', 'Intelligenza Artificiale', 'Marketing & Vendite', 'Media & Intrattenimento', 'Mobilità & Trasporti', 'Produttività & Automazione', 'Risorse umane & Recruiting', 'Ristorazione & Food', 'SaaS & Software', 'Salute & Benessere', 'Social & Creator economy', 'Startup & PMI', 'Sostenibilità & Ambiente', 'Tecnologia', 'Turismo & Viaggi']

function getCategoryGradient(category: string | null) {
  const map: Record<string, string> = {
    'Intelligenza Artificiale': 'linear-gradient(135deg, #1a1a2e, #16213e)',
    'Fintech': 'linear-gradient(135deg, #0a2342, #1a3a5c)',
    'Finanza personale & Investimenti': 'linear-gradient(135deg, #0a2342, #1a3a5c)',
    'Blockchain & Crypto': 'linear-gradient(135deg, #1a0a2e, #2d1b4e)',
    'Salute & Benessere': 'linear-gradient(135deg, #0a2e1a, #1a4a2e)',
    'Fitness & Sport': 'linear-gradient(135deg, #1a2e0a, #2e4a1a)',
    'Sostenibilità & Ambiente': 'linear-gradient(135deg, #0a2e1a, #1a3a2a)',
    'Energia & Smart cities': 'linear-gradient(135deg, #1a2a0a, #2a3a1a)',
    'Tecnologia': 'linear-gradient(135deg, #0a1a2e, #1a2a3e)',
    'Cybersecurity': 'linear-gradient(135deg, #2e0a0a, #3e1a1a)',
    'SaaS & Software': 'linear-gradient(135deg, #1a0a2e, #2a1a3e)',
    'Data & Analytics': 'linear-gradient(135deg, #0a1a2e, #1a2a4e)',
    'Design & UX/UI': 'linear-gradient(135deg, #2e0a2e, #3e1a3e)',
    'Marketing & Vendite': 'linear-gradient(135deg, #2e1a0a, #3e2a1a)',
    'Social & Creator economy': 'linear-gradient(135deg, #2e0a1a, #3e1a2a)',
    'Media & Intrattenimento': 'linear-gradient(135deg, #2e1a0a, #4e2a0a)',
    'E-commerce & Marketplace': 'linear-gradient(135deg, #1a2e0a, #2a3e1a)',
    'Ristorazione & Food': 'linear-gradient(135deg, #2e1a0a, #3e2a0a)',
    'Turismo & Viaggi': 'linear-gradient(135deg, #0a2a2e, #1a3a3e)',
    'Mobilità & Trasporti': 'linear-gradient(135deg, #0a1a2e, #1a2a3e)',
    'Educazione & Formazione': 'linear-gradient(135deg, #1a0a2e, #2a1a3e)',
    'Crescita personale': 'linear-gradient(135deg, #2e0a2a, #3e1a3a)',
    'Produttività & Automazione': 'linear-gradient(135deg, #0a2e2a, #1a3e3a)',
    'Risorse umane & Recruiting': 'linear-gradient(135deg, #2e2a0a, #3e3a1a)',
    'Startup & PMI': 'linear-gradient(135deg, #1a1a2e, #2a2a3e)',
  }
  return map[category ?? ''] ?? 'linear-gradient(135deg, #1a1f35, #2D3F5C)'
}

export default function SearchPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sentIds, setSentIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: sent } = await supabase.from('join_requests').select('project_id').eq('applicant_id', data.user.id)
        if (sent) setSentIds(sent.map(r => r.project_id))
      }
    })
    search()
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function search() {
    setLoading(true)
    let q = supabase
      .from('projects')
      .select('*, profiles:founder_id(display_name, avatar_url)')
      .eq('status', 'active')
    if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    if (sector) q = q.eq('category', sector)
    if (city) q = q.ilike('city', `%${city}%`)
    const { data } = await q.order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  const inp: React.CSSProperties = { padding: '11px 16px', background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 10, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
  const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer' }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <img src="/foundy.png" alt="Foundy" style={{ height: 320, width: 'auto', marginBottom: 32 }} />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>Cerca la tua prossima avventura</h2>
      <p style={{ fontSize: 16, color: '#94A3B8', maxWidth: 460, lineHeight: 1.7, marginBottom: 32 }}>
        Migliaia di idee ti aspettano. Accedi per cercare progetti, filtrare per settore e candidarti come co-founder.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="/signup" style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 9, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>Pubblica la tua idea →</a>
        <a href="/login" style={{ display: 'inline-block', padding: '12px 28px', fontSize: 15, borderRadius: 9, border: '1px solid #2D3F5C', color: '#94A3B8', textDecoration: 'none' }}>Accedi</a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Cerca idee</h1>
        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 28 }}>Trova la startup su cui vuoi lavorare.</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' as const }}>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Cerca per titolo o descrizione..." />
          <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp, minWidth: 140 }}>
            {SECTORS.map(s => <option key={s} value={s}>{s || 'Tutti i settori'}</option>)}
          </select>
          <input value={city} onChange={e => setCity(e.target.value)}
  onKeyDown={e => e.key === 'Enter' && search()}
  style={{ ...inp, minWidth: 140 }} placeholder="Città..." />
<button onClick={search} style={btn}>Cerca</button>
          <button onClick={search} style={btn}>Cerca</button>
        </div>

        <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>{projects.length} risultati</div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Caricamento...</div>}

        {!loading && projects.map(pr => (
          <div key={pr.id} onClick={() => window.location.href = `/projects/${pr.id}`} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, overflow: 'hidden', marginBottom: 20, cursor: 'pointer' }}>
            {pr.image_url
              ? <img src={pr.image_url} alt={pr.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
              : <div style={{ height: 160, background: getCategoryGradient(pr.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/foundy.png" alt="Foundy" style={{ height: 80, width: 'auto', opacity: 0.7 }} />
                </div>
            }
            <div style={{ padding: '1.1rem' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
                {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{pr.category}</span>}
                {(pr.required_roles || []).slice(0, 3).map((r: string) => (
                  <span key={r} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{r}</span>
                ))}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}>{pr.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <a href={`/profile/${pr.founder_id}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>👤 {pr.profiles?.display_name ?? 'Founder'}</a>
                {sentIds.includes(pr.id)
                  ? <span style={{ fontSize: 13, color: '#10B981' }}>✓ Richiesta inviata</span>
                  : user?.id !== pr.founder_id && <span style={{ fontSize: 12, color: '#7C3AED' }}>Clicca per vedere →</span>
                }
              </div>
            </div>
          </div>
        ))}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p>Nessun risultato. Prova con altri termini.</p>
          </div>
        )}
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}