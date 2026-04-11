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
  const [tab, setTab] = useState<'idee' | 'persone'>('idee')
  const [projects, setProjects] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('')
  const [city, setCity] = useState('')
  const [peopleQuery, setPeopleQuery] = useState('')
  const [peopleCity, setPeopleCity] = useState('')
  const [peopleUniversity, setPeopleUniversity] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingPeople, setLoadingPeople] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sentIds, setSentIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [savedProfileIds, setSavedProfileIds] = useState<string[]>([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: sent } = await supabase.from('join_requests').select('project_id').eq('applicant_id', data.user.id)
        if (sent) setSentIds(sent.map(r => r.project_id))
        const { data: saved } = await supabase.from('saved_projects').select('project_id').eq('profile_id', data.user.id)
        if (saved) setSavedIds(saved.map(r => r.project_id))
        const { data: savedP } = await supabase.from('saved_profiles').select('saved_profile_id').eq('profile_id', data.user.id)
        if (savedP) setSavedProfileIds(savedP.map(r => r.saved_profile_id))
      }
    })
    search()
    searchPeople()
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function search() {
    setLoading(true)
    let q = supabase.from('projects').select('*, profiles:founder_id(display_name, avatar_url)').eq('status', 'active')
    if (query) q = q.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    if (sector) q = q.eq('category', sector)
    if (city) q = q.ilike('city', `%${city}%`)
    const { data } = await q.order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  async function searchPeople() {
    setLoadingPeople(true)
    let q = supabase.from('profiles').select('*')
    if (peopleQuery) q = q.ilike('display_name', `%${peopleQuery}%`)
    if (peopleCity) q = q.ilike('city', `%${peopleCity}%`)
    if (peopleUniversity) q = q.ilike('university', `%${peopleUniversity}%`)
    const { data: profiles } = await q
    if (!profiles) { setLoadingPeople(false); return }

    const enriched = await Promise.all(profiles.map(async (p) => {
      const { count: total } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('founder_id', p.id)
      const { count: completed } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('founder_id', p.id).eq('status', 'closed')
      const { count: followers } = await supabase.from('saved_profiles').select('*', { count: 'exact', head: true }).eq('saved_profile_id', p.id)
      return { ...p, total_projects: total ?? 0, completed_projects: completed ?? 0, followers: followers ?? 0 }
    }))

    enriched.sort((a, b) => (b.completed_projects * 3 + b.total_projects + b.followers * 2) - (a.completed_projects * 3 + a.total_projects + a.followers * 2))
    setPeople(enriched)
    setLoadingPeople(false)
  }

  async function toggleSave(projectId: string) {
    if (!user) return
    if (savedIds.includes(projectId)) {
      await supabase.from('saved_projects').delete().eq('project_id', projectId).eq('profile_id', user.id)
      setSavedIds(p => p.filter(id => id !== projectId))
    } else {
      await supabase.from('saved_projects').insert({ project_id: projectId, profile_id: user.id })
      setSavedIds(p => [...p, projectId])
    }
  }

  async function toggleSaveProfile(profileId: string) {
    if (!user) return
    if (savedProfileIds.includes(profileId)) {
      await supabase.from('saved_profiles').delete().eq('saved_profile_id', profileId).eq('profile_id', user.id)
      setSavedProfileIds(p => p.filter(id => id !== profileId))
    } else {
      await supabase.from('saved_profiles').insert({ profile_id: user.id, saved_profile_id: profileId })
      setSavedProfileIds(p => [...p, profileId])
    }
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
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Cerca</h1>
        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 24 }}>Trova idee o persone con cui costruire qualcosa di grande.</p>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2D3F5C', marginBottom: 24 }}>
          {(['idee', 'persone'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15,
              color: tab === t ? '#F59E0B' : '#94A3B8',
              borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400, marginBottom: -1,
            }}>{t === 'idee' ? '💡 Idee' : '👥 Persone'}</button>
          ))}
        </div>

        {tab === 'idee' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' as const }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Cerca per titolo..." />
              <select value={sector} onChange={e => setSector(e.target.value)} style={{ ...inp, minWidth: 140 }}>
                {SECTORS.map(s => <option key={s} value={s}>{s || 'Tutti i settori'}</option>)}
              </select>
              <input value={city} onChange={e => setCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
                style={{ ...inp, minWidth: 120 }} placeholder="Città..." />
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); toggleSave(pr.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: savedIds.includes(pr.id) ? '#F59E0B' : '#2D3F5C', padding: '4px' }}>
                        {savedIds.includes(pr.id) ? '★' : '☆'}
                      </button>
                      {sentIds.includes(pr.id)
                        ? <span style={{ fontSize: 13, color: '#10B981' }}>✓ Richiesta inviata</span>
                        : user?.id !== pr.founder_id && <span style={{ fontSize: 12, color: '#7C3AED' }}>Clicca per vedere →</span>
                      }
                    </div>
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
          </>
        )}

        {tab === 'persone' && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' as const }}>
              <input value={peopleQuery} onChange={e => setPeopleQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchPeople()}
                style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Cerca per nome..." />
              <input value={peopleCity} onChange={e => setPeopleCity(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchPeople()}
                style={{ ...inp, minWidth: 120 }} placeholder="Città..." />
              <input value={peopleUniversity} onChange={e => setPeopleUniversity(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchPeople()}
                style={{ ...inp, minWidth: 160 }} placeholder="Università..." />
              <button onClick={searchPeople} style={btn}>Cerca</button>
            </div>
            <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>{people.length} founder</div>
            {loadingPeople && <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Caricamento...</div>}
            {!loadingPeople && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                {people.map(p => (
                  <a key={p.id} href={`/profile/${p.id}`} style={{ textDecoration: 'none' }}>
                    <div onMouseEnter={e => (e.currentTarget.style.border = '1px solid #F59E0B')}
                      onMouseLeave={e => (e.currentTarget.style.border = '1px solid #2D3F5C')}
                      style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', textAlign: 'center', cursor: 'pointer', transition: 'border 0.2s' }}>
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', overflow: 'hidden', margin: '0 auto 12px' }}>
                        {p.avatar_url
                          ? <img src={p.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : p.display_name?.[0]?.toUpperCase() ?? '?'
                        }
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{p.display_name}</div>
                      {p.university && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{p.university}</div>}
                      {p.city && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>📍 {p.city}</div>}
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
                        <div style={{ background: '#0F172A', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#F59E0B' }}>{p.total_projects}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Idee</div>
                        </div>
                        <div style={{ background: '#0F172A', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#10B981' }}>{p.completed_projects}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Completate</div>
                        </div>
                        <div style={{ background: '#0F172A', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#8B5CF6' }}>{p.followers}</div>
                          <div style={{ fontSize: 10, color: '#64748B' }}>Follower</div>
                        </div>
                      </div>
                      <button onClick={e => { e.preventDefault(); toggleSaveProfile(p.id) }} style={{
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 22,
                        color: savedProfileIds.includes(p.id) ? '#F59E0B' : '#2D3F5C',
                      }}>
                        {savedProfileIds.includes(p.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </a>
                ))}
              </div>
            )}
            {!loadingPeople && people.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                <p>Nessun founder trovato.</p>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}