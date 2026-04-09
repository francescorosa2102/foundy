'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'


export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [profile, setProfile] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    university: '',
    degree_course: '',
    bio: '',
    city: '',
    contact_email: '',
    skills: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      if (p) {
        setProfile({
          display_name: p.display_name ?? '',
          first_name: p.first_name ?? '',
          last_name: p.last_name ?? '',
          university: p.university ?? '',
          degree_course: p.degree_course ?? '',
          bio: p.bio ?? '',
          city: p.city ?? '',
          contact_email: p.contact_email ?? '',
          skills: p.skills ?? [],
        })
        setAvatarUrl(p.avatar_url ?? '')
      }
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

  async function uploadAvatar(file: File) {
    if (!user) return
    setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    const { error } = await supabase.storage.from('project-images').upload(path, file, { upsert: true })
    if (error) { showToast('Errore upload foto'); setUploadingAvatar(false); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(path)
    setAvatarUrl(data.publicUrl)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    setUploadingAvatar(false)
    showToast('Foto profilo aggiornata! ✅')
  }

  async function save() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase.from('profiles').update({ ...profile, avatar_url: avatarUrl }).eq('id', user.id)
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

        {/* Foto profilo */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Foto profilo</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff' }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile.display_name?.[0]?.toUpperCase() ?? '?'
              }
            </div>
            <div>
              <label style={{ ...label, marginBottom: 8 }}>Carica una foto (opzionale)</label>
              <input type="file" accept="image/*" onChange={async e => {
                const file = e.target.files?.[0]
                if (file) await uploadAvatar(file)
              }} style={{ fontSize: 13, color: '#94A3B8', cursor: 'pointer' }} />
              {uploadingAvatar && <div style={{ fontSize: 12, color: '#F59E0B', marginTop: 6 }}>Caricamento...</div>}
            </div>
          </div>
        </div>

        {/* Informazioni base */}
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
              <label style={label}>Università / Esperienza lavorativa</label>
<input value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} style={inp} placeholder="Es. Polimi/Unito/Sviluppatore/Imprenditore..." />
            </div>
            <div>
              <label style={label}>Corso di studi / Ruolo professionale</label>
<input value={profile.degree_course} onChange={e => setProfile({ ...profile, degree_course: e.target.value })} style={inp} placeholder="Es. Ingegneria/CEO/Marketing Manager..." />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Città</label>
            <input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} style={inp} placeholder="Milano" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={label}>Email di contatto pubblica (opzionale)</label>
            <input value={profile.contact_email} onChange={e => setProfile({ ...profile, contact_email: e.target.value })} style={inp} placeholder="mario@email.com" />
          </div>

          <div>
            <label style={label}>Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
              style={{ ...inp, minHeight: 100, resize: 'vertical' as const }}
              placeholder="Raccontati in poche righe..." />
          </div>
        </div>

        {/* Competenze */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 6 }}>Competenze</h2>
          <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Seleziona le tue competenze principali.</p>
          <input
  value={profile.skills.join(', ')}
  onChange={e => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
  style={{ width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
  placeholder="Es. Cuoco, Barman, Commercialista, Dev, Designer..."
/>
<div style={{ fontSize: 12, color: '#64748B', marginTop: 6 }}>Separa le competenze con una virgola</div>
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