'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'

type Project = {
  id: string
  title: string
  description: string
  category: string | null
  required_roles: string[]
  image_url: string | null
  founder_id: string
  profiles: { display_name: string; avatar_url: string | null } | null
}

const SECTORS = ['Blockchain & Crypto', 'Crescita personale', 'Cybersecurity', 'Data & Analytics', 'Design & UX/UI', 'E-commerce & Marketplace', 'Educazione & Formazione', 'Energia & Smart cities', 'Finanza personale & Investimenti', 'Fintech', 'Fitness & Sport', 'Intelligenza Artificiale', 'Marketing & Vendite', 'Media & Intrattenimento', 'Mobilità & Trasporti', 'Produttività & Automazione', 'Risorse umane & Recruiting', 'Ristorazione & Food', 'SaaS & Software', 'Salute & Benessere', 'Social & Creator economy', 'Startup & PMI', 'Sostenibilità & Ambiente', 'Tecnologia', 'Turismo & Viaggi']

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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [joinModal, setJoinModal] = useState<Project | null>(null)
  const [joinMsg, setJoinMsg] = useState('')
  const [sentIds, setSentIds] = useState<string[]>([])
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [np, setNp] = useState({ title: '', description: '', category: 'Tecnologia', required_roles: '', image_url: '', city: '', accepted: false })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user)
      if (data.user) {
        const { data: sent } = await supabase.from('join_requests').select('project_id').eq('applicant_id', data.user.id)
        if (sent) setSentIds(sent.map(r => r.project_id))
        const { data: saved } = await supabase.from('saved_projects').select('project_id').eq('profile_id', data.user.id)
        if (saved) setSavedIds(saved.map(r => r.project_id))
      }
    })
    supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const { data } = await supabase.from('projects').select('*, profiles:founder_id(display_name, avatar_url)').eq('status', 'active').order('created_at', { ascending: false })
    setProjects(data ?? [])
    const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true })
    setTotalCount(count ?? 0)
    setLoading(false)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

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

  async function sendJoin() {
    if (!user || !joinModal) return
    if (!joinMsg.trim()) { showToast('Scrivi un messaggio di motivazione! 📝'); return }
    const { error } = await supabase.from('join_requests').insert({ project_id: joinModal.id, applicant_id: user.id, message: joinMsg, status: 'pending' })
    if (error?.code === '23505') { showToast('Richiesta già inviata!'); setJoinModal(null); return }
    if (error) { showToast('Errore: ' + error.message); return }
    setSentIds(p => [...p, joinModal.id])
    setJoinModal(null); setJoinMsg('')
    showToast('Richiesta inviata! 🚀')
  }

  async function uploadImage(file: File) {
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('project-images').upload(path, file)
    if (error) { showToast('Errore upload immagine'); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    setNp(prev => ({ ...prev, image_url: data.publicUrl }))
    showToast('Immagine caricata! ✅')
  }

  async function createProject() {
    if (!np.title || !np.description) { showToast('Titolo e descrizione obbligatori'); return }
    if (!np.accepted) { showToast('Devi accettare i termini per pubblicare! ☝️'); return }
    const roles = np.required_roles.split(',').map(r => r.trim()).filter(Boolean)
    const { error } = await supabase.from('projects').insert({
      founder_id: user.id, title: np.title, description: np.description,
      category: np.category, required_roles: roles, status: 'active', image_url: np.image_url || null, city: np.city || null,
    })
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Progetto creato! 🎉')
    setShowNew(false)
    setNp({ title: '', description: '', category: 'Tecnologia', required_roles: '', image_url: '', city: '', accepted: false })
    loadProjects()
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#0D111D', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
  const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#0D111D' }}>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '5rem 1rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <img src="/foundy.png" alt="Foundy" style={{ height: 320, width: 'auto' }} />
        </div>
        <p style={{ fontSize: 18, color: '#94A3B8', marginBottom: 36 }}>Condividi idee. Trova talenti. Costruisci insieme.</p>

        {user ? (
          <button onClick={() => setShowNew(true)} style={{ ...btn, padding: '11px 28px', fontSize: 15 }}>+ Pubblica la tua idea</button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 'clamp(2.5rem,8vw,5rem)', fontWeight: 800, color: '#F59E0B', letterSpacing: '-2px', lineHeight: 1 }}>
                {totalCount.toLocaleString('it-IT')}
              </div>
              <div style={{ fontSize: 16, color: '#94A3B8', maxWidth: 460, textAlign: 'center', lineHeight: 1.6 }}>
                idee e startup ti aspettano — sei a un passo dal trovare il co-founder giusto
              </div>
            </div>

            {/* Come funziona */}
            <div style={{ width: '100%', maxWidth: 700, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
              {[
                { emoji: '💡', title: 'Pubblica la tua idea', desc: 'Carica il tuo progetto in pochi minuti e inizia a costruire il team.' },
                { emoji: '🤝', title: 'Trova il co-founder', desc: 'Cerca persone con le competenze che ti mancano: dev, designer, marketer.' },
                { emoji: '🚀', title: 'Costruisci insieme', desc: 'Workspace privato con chat, task e materiali solo per il tuo team.' },
                { emoji: '🏆', title: 'Vai in vetrina', desc: 'Team completo? La tua startup appare agli investitori.' },
              ].map((item, i) => (
                <div key={i} onMouseEnter={e => (e.currentTarget.style.border = '1px solid #F59E0B')} onMouseLeave={e => (e.currentTarget.style.border = '1px solid #2D3F5C')} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', textAlign: 'center', transition: 'border 0.2s' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{item.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Perché Foundy */}
            <div style={{ width: '100%', maxWidth: 700, background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', textAlign: 'left' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', marginBottom: 16, textAlign: 'center' }}>
                Perché scegliere Foundy? 🇮🇹
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '✅ Completamente gratuito — nessun abbonamento, nessuna sorpresa',
                  '✅ Solo per italiani — community locale, connessioni reali',
                  '✅ Workspace privato — chat e task solo per il tuo team',
                  '✅ Vetrina investitori — quando il team è pronto, la tua startup brilla',
                  '✅ Idee protette — ogni pubblicazione richiede accettazione dei termini',
                  '✅ Semplice e veloce — profilo in 2 minuti, idea pubblicata subito',
                ].map((point, i) => (
                  <div key={i} onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #F59E0B')} onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')} style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.6, padding: '8px 12px', background: '#0F172A', borderRadius: 8, cursor: 'default' }}>
                    {point}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
              <a href="/signup" style={{ ...btn, display: 'inline-block', padding: '12px 28px', fontSize: 15 }}>Pubblica la tua idea →</a>
              <a href="/login" style={{ display: 'inline-block', padding: '12px 28px', fontSize: 15, borderRadius: 9, border: '1px solid #2D3F5C', color: '#94A3B8' }}>Accedi</a>
            </div>
          </div>
        )}
      </div>

      {/* FEED — solo per utenti loggati */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 1rem 4rem', display: user ? 'block' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>Idee aperte</h2>
          <span style={{ fontSize: 13, color: '#94A3B8' }}>{projects.length} progetti</span>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>Caricamento...</div>}

        {!loading && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
            <p style={{ marginBottom: 20 }}>Nessuna idea ancora — sii il primo!</p>
            <button onClick={() => setShowNew(true)} style={btn}>+ Pubblica idea</button>
          </div>
        )}

        {!loading && projects.map(pr => (
          <div key={pr.id} onClick={() => window.location.href = `/projects/${pr.id}`} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, overflow: 'hidden', marginBottom: 20, cursor: 'pointer' }}>
            {pr.image_url
              ? <img src={pr.image_url} alt={pr.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              : <div style={{ height: 160, background: getCategoryGradient(pr.category), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/foundy.png" alt="Foundy" style={{ height: 80, width: 'auto', opacity: 0.7 }} />
                </div>
            }
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{pr.category}</span>}
                {(pr.required_roles || []).slice(0, 3).map(r => (
                  <span key={r} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{r}</span>
                ))}
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>{pr.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
  {pr.profiles?.avatar_url
    ? <img src={pr.profiles.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : pr.profiles?.display_name?.[0] ?? '?'
  }
</div>
                  <div>
                    <a href={`/profile/${pr.founder_id}`} style={{ fontSize: 13, fontWeight: 500, color: '#F1F5F9', textDecoration: 'none' }}>{pr.profiles?.display_name ?? 'Founder'}</a>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>Founder</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
  <button onClick={e => { e.stopPropagation(); toggleSave(pr.id) }} style={{
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 20,
    color: savedIds.includes(pr.id) ? '#F59E0B' : '#2D3F5C',
    padding: '4px'
  }}>
    {savedIds.includes(pr.id) ? '★' : '☆'}
  </button>
  {user?.id === pr.founder_id
    ? <span style={{ fontSize: 12, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(245,158,11,0.25)' }}>Tua idea</span>
    : sentIds.includes(pr.id)
      ? <span style={{ color: '#10B981', fontSize: 13 }}>✓ Richiesta inviata</span>
      : <button onClick={e => { e.stopPropagation(); setJoinModal(pr) }} style={btn}>Partecipa →</button>
  }
</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL JOIN */}
      {joinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 16 }}>Candidati a "{joinModal.title}"</h3>
            <textarea value={joinMsg} onChange={e => setJoinMsg(e.target.value)}
              style={{ ...inp, minHeight: 110, resize: 'vertical' as const, marginBottom: 16 }}
              placeholder="Ciao! Sono interessato perché..." />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setJoinModal(null)} style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid #2D3F5C', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={sendJoin} style={btn}>Invia candidatura</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUOVO PROGETTO */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Pubblica la tua idea</h3>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Titolo</label>
            <input value={np.title} onChange={e => setNp({ ...np, title: e.target.value })} style={{ ...inp, marginBottom: 14 }} placeholder="Nome della startup" />
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Descrizione</label>
            <textarea value={np.description} onChange={e => setNp({ ...np, description: e.target.value })} style={{ ...inp, minHeight: 90, resize: 'vertical' as const, marginBottom: 14 }} placeholder="Di cosa si tratta?" />
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Settore</label>
            <select value={np.category} onChange={e => setNp({ ...np, category: e.target.value })} style={{ ...inp, marginBottom: 14 }}>
              {SECTORS.map(s => <option key={s}>{s}</option>)}
            </select>
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Ruoli cercati (separati da virgola)</label>
            <input value={np.required_roles} onChange={e => setNp({ ...np, required_roles: e.target.value })} style={{ ...inp, marginBottom: 14 }} placeholder="Dev, Designer, Marketing..." />
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Città</label>
            <input value={np.city} onChange={e => setNp({ ...np, city: e.target.value })} style={{ ...inp, marginBottom: 14 }} placeholder="Es. Milano, Roma, Torino..." />
            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Immagine progetto (opzionale)</label>
            <input type="file" accept="image/*" onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) await uploadImage(file)
            }} style={{ ...inp, marginBottom: 14, cursor: 'pointer' }} />
            {np.image_url && <img src={np.image_url} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, background: '#0F172A', padding: '12px 14px', borderRadius: 9, border: '1px solid #2D3F5C' }}>
              <input type="checkbox" id="accept" checked={np.accepted} onChange={e => setNp({ ...np, accepted: e.target.checked })} style={{ marginTop: 3, cursor: 'pointer', width: 16, height: 16, flexShrink: 0 }} />
              <label htmlFor="accept" style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, cursor: 'pointer' }}>
                Confermo di essere a conoscenza che l'idea che sto pubblicando sarà visibile pubblicamente. Foundy è una piattaforma di connessione e non è responsabile per il contenuto pubblicato dagli utenti né per eventuali furti di idee tra utenti. Pubblicando accetto questi termini.
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowNew(false)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #2D3F5C', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={createProject} style={{ ...btn, flex: 1, padding: '10px' }}>Pubblica</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}