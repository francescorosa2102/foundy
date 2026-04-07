'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SKILLS_OPTIONS = ['React', 'Node.js', 'Python', 'Design', 'Marketing', 'Finance', 'Legal', 'AI/ML', 'iOS', 'Android', 'DevOps', 'Sales', 'Product', 'Data']

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [profile, setProfile] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    university: '',
    degree_course: '',
    bio: '',
    city: '',
    skills: [] as string[],
    interests: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p) setProfile({
        display_name: p.display_name ?? '',
        first_name: p.first_name ?? '',
        last_name: p.last_name ?? '',
        university: p.university ?? '',
        degree_course: p.degree_course ?? '',
        bio: p.bio ?? '',
        city: p.city ?? '',
        skills: p.skills ?? [],
        interests: p.interests ?? [],
      })
      setLoading(false)
    })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function toggleSkill(skill: string) {
    setProfile(p => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...p.skills, skill]
    }))
  }

  async function save() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id)
    setSaving(false)
    if (error) { showToast('Errore nel salvataggio'); return }
    showToast('Profilo salvato! ✅')
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }
  const label: React.CSSProperties = { display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Caricamento...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>Il tuo profilo</h1>
        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 28 }}>Le informazioni che gli altri founder vedranno.</p>

        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Informazioni base</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={label}>Nome</label>
              <input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} style={inp} placeholder="Mario" />
            </div>
            <div>
              <label style={label}>Cognome</label>
              <input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} style={inp} placeholder="Rossi" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Nome visualizzato</label>
            <input value={profile.display_name} onChange={e => setProfile({ ...profile, display_name: e.target.value })} style={inp} placeholder="Come ti chiamano?" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={label}>Università</label>
              <input value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} style={inp} placeholder="Politecnico di Milano" />
            </div>
            <div>
              <label style={label}>Corso di studi</label>
              <input value={profile.degree_course} onChange={e => setProfile({ ...profile, degree_course: e.target.value })} style={inp} placeholder="Ingegneria Informatica" />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Città</label>
            <input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} style={inp} placeholder="Milano" />
          </div>

          <div>
            <label style={label}>Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
              style={{ ...inp, minHeight: 100, resize: 'vertical' as const }}
              placeholder="Raccontati in poche righe..." />
          </div>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>Competenze</h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Seleziona le tue competenze principali.</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            {SKILLS_OPTIONS.map(skill => (
              <button key={skill} onClick={() => toggleSkill(skill)} style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                background: profile.skills.includes(skill) ? 'rgba(124,58,237,0.2)' : 'none',
                border: profile.skills.includes(skill) ? '1px solid rgba(124,58,237,0.5)' : '1px solid #2D3F5C',
                color: profile.skills.includes(skill) ? '#8B5CF6' : '#94A3B8',
              }}>{profile.skills.includes(skill) ? '✓ ' : ''}{skill}</button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{
          width: '100%', padding: '13px', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)',
          color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer'
        }}>
          {saving ? 'Salvataggio...' : 'Salva profilo'}
        </button>
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}