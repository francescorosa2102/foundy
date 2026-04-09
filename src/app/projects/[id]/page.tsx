'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

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

export default function ProjectDetail() {
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [joinModal, setJoinModal] = useState(false)
  const [joinMsg, setJoinMsg] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [alreadySent, setAlreadySent] = useState(false)
  const [toast, setToast] = useState('')
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: u } = await supabase.auth.getUser()
      setUser(u.user)

      const { data: pr } = await supabase
        .from('projects')
        .select('*, profiles:founder_id(id, display_name, avatar_url, university, city)')
        .eq('id', id)
        .single()
      setProject(pr)

      const { data: mem } = await supabase
        .from('project_members')
        .select('profile_id, profiles:profile_id(display_name, avatar_url)')
        .eq('project_id', id)
      setMembers(mem ?? [])

      if (u.user) {
        const { data: req } = await supabase
          .from('join_requests')
          .select('id')
          .eq('project_id', id)
          .eq('applicant_id', u.user.id)
          .single()
        if (req) setAlreadySent(true)
      }

      setLoading(false)
    }
    load()
  }, [id])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function sendJoin() {
    if (!user || !project) return
    if (!joinMsg.trim()) { showToast('Scrivi un messaggio! 📝'); return }
    if (!selectedRole) { showToast('Seleziona il ruolo che vuoi ricoprire! 👆'); return }
    const { error } = await supabase.from('join_requests').insert({
      project_id: id,
      applicant_id: user.id,
      message: `[${selectedRole}] ${joinMsg}`,
      status: 'pending'
    })
    if (error?.code === '23505') { showToast('Richiesta già inviata!'); setJoinModal(false); return }
    if (error) { showToast('Errore: ' + error.message); return }
    setAlreadySent(true)
    setJoinModal(false)
    showToast('Richiesta inviata! 🚀')
  }

  const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer' }
  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Caricamento...</div>
  if (!project) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Progetto non trovato</div>

  const isFounder = user?.id === project.founder_id
  const totalRoles = (project.required_roles ?? []).length
  const filled = members.length

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Immagine */}
        {project.image_url
          ? <img src={project.image_url} alt={project.title} style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }} />
          : <div style={{ height: 200, background: getCategoryGradient(project.category), borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/foundy.png" alt="Foundy" style={{ height: 80, opacity: 0.7 }} />
            </div>
        }

        {/* Header */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 12 }}>
          {project.category && <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{project.category}</span>}
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F1F5F9', marginBottom: 12 }}>{project.title}</h1>
        <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, marginBottom: 24 }}>{project.description}</p>

        {/* Founder */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Founder</div>
          <a href={`/profile/${project.founder_id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
              {project.profiles?.avatar_url
                ? <img src={project.profiles.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : project.profiles?.display_name?.[0] ?? '?'
              }
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{project.profiles?.display_name}</div>
              {project.profiles?.university && <div style={{ fontSize: 12, color: '#64748B' }}>{project.profiles.university}</div>}
              {project.profiles?.city && <div style={{ fontSize: 12, color: '#64748B' }}>📍 {project.profiles.city}</div>}
            </div>
          </a>
        </div>

        {/* Ruoli cercati */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Ruoli cercati ({filled}/{totalRoles} coperti)</div>
          <div style={{ background: '#0F172A', borderRadius: 999, height: 6, marginBottom: 14, overflow: 'hidden' }}>
            <div style={{ background: filled >= totalRoles ? '#10B981' : '#7C3AED', height: '100%', width: `${totalRoles > 0 ? (filled / totalRoles) * 100 : 0}%`, borderRadius: 999 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {(project.required_roles ?? []).map((role: string, i: number) => (
              <span key={i} style={{ fontSize: 13, padding: '5px 14px', borderRadius: 999, border: `1px solid ${i < filled ? 'rgba(16,185,129,0.4)' : '#2D3F5C'}`, color: i < filled ? '#10B981' : '#94A3B8', background: i < filled ? 'rgba(16,185,129,0.08)' : 'none' }}>
                {i < filled ? '✓ ' : '○ '}{role}
              </span>
            ))}
          </div>
        </div>

        {/* Team attuale */}
        {members.length > 0 && (
          <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Team attuale</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {members.map((m: any) => (
                <a key={m.profile_id} href={`/profile/${m.profile_id}`} style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', background: '#0F172A', padding: '6px 12px', borderRadius: 999, border: '1px solid #2D3F5C' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                    {m.profiles?.avatar_url
                      ? <img src={m.profiles.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : m.profiles?.display_name?.[0] ?? '?'
                    }
                  </div>
                  <span style={{ fontSize: 13, color: '#F1F5F9' }}>{m.profiles?.display_name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {!isFounder && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            {alreadySent
              ? <span style={{ fontSize: 15, color: '#10B981' }}>✓ Richiesta già inviata</span>
              : <button onClick={() => setJoinModal(true)} style={{ ...btn, width: '100%', padding: '14px' }}>
                  Chiedi di partecipare →
                </button>
            }
          </div>
        )}

        {isFounder && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <span style={{ fontSize: 14, color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(245,158,11,0.25)' }}>Questa è la tua idea</span>
          </div>
        )}
      </div>

      {/* Modal partecipa */}
      {joinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 480 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Candidati a "{project.title}"</h3>

            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Ruolo che vuoi ricoprire *</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 16 }}>
              {(project.required_roles ?? []).map((role: string, i: number) => {
  const isTaken = i < filled
  return (
    <button key={role} onClick={() => !isTaken && setSelectedRole(role)} style={{
      padding: '6px 14px', borderRadius: 999, fontSize: 13,
      cursor: isTaken ? 'not-allowed' : 'pointer',
      background: isTaken ? 'rgba(16,185,129,0.08)' : selectedRole === role ? 'rgba(124,58,237,0.2)' : 'none',
      border: isTaken ? '1px solid rgba(16,185,129,0.3)' : selectedRole === role ? '1px solid rgba(124,58,237,0.5)' : '1px solid #2D3F5C',
      color: isTaken ? '#10B981' : selectedRole === role ? '#8B5CF6' : '#94A3B8',
      opacity: isTaken ? 0.6 : 1,
    }}>
      {isTaken ? '✓ occupato' : selectedRole === role ? '✓ ' : ''}{role}
    </button>
  )
})}
            </div>

            <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>Perché vuoi unirti? *</label>
            <textarea value={joinMsg} onChange={e => setJoinMsg(e.target.value)}
              style={{ ...inp, minHeight: 110, resize: 'vertical' as const, marginBottom: 16 }}
              placeholder="Racconta la tua esperienza e perché sei la persona giusta..." />

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setJoinModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #2D3F5C', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={sendJoin} style={{ flex: 1, padding: '10px', borderRadius: 9, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Invia candidatura</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}
