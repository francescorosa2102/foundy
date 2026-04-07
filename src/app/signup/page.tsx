'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const SKILLS_OPTIONS = ['React', 'Node.js', 'Python', 'Design', 'Marketing', 'Finance', 'Legal', 'AI/ML', 'iOS', 'Android', 'DevOps', 'Sales', 'Product', 'Data']

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState({
    display_name: '',
    first_name: '',
    last_name: '',
    university: '',
    degree_course: '',
    bio: '',
    city: '',
    skills: [] as string[],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }
  const btn: React.CSSProperties = { width: '100%', padding: '11px', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 500, cursor: 'pointer' }
  const label: React.CSSProperties = { display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }

  function toggleSkill(skill: string) {
    setProfile(p => ({
      ...p,
      skills: p.skills.includes(skill)
        ? p.skills.filter(s => s !== skill)
        : [...p.skills, skill]
    }))
  }

  async function handleSignup() {
    setError(''); setLoading(true)
    if (!email || !password) { setError('Email e password obbligatorie'); setLoading(false); return }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: profile.display_name || profile.first_name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    setStep(2)
  }

  async function handleProfile() {
    setError(''); setLoading(true)
    if (!profile.display_name || !profile.university) {
      setError('Nome visualizzato e università sono obbligatori')
      setLoading(false); return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Errore utente'); setLoading(false); return }
    const { error } = await supabase.from('profiles').update(profile).eq('id', user.id)
    if (error) { setError(error.message); setLoading(false); return }
    setLoading(false)
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <img src="/foundy.png" alt="Foundy" style={{ height: 48, width: 'auto', marginBottom: 8 }} />
          <div style={{ fontSize: 13, color: '#94A3B8' }}>
            {step === 1 ? 'Crea il tuo account' : 'Completa il tuo profilo'}
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
            <div style={{ width: 32, height: 4, borderRadius: 999, background: '#7C3AED' }} />
            <div style={{ width: 32, height: 4, borderRadius: 999, background: step === 2 ? '#7C3AED' : '#2D3F5C' }} />
          </div>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>{error}</div>}

        {step === 1 && (
          <>
            <label style={label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="tua@email.com" />
            <label style={label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, marginBottom: 20 }} placeholder="Min. 6 caratteri" onKeyDown={e => e.key === 'Enter' && handleSignup()} />
            <button onClick={handleSignup} disabled={loading} style={btn}>{loading ? 'Registrazione...' : 'Continua →'}</button>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#94A3B8' }}>
              Hai già un account? <a href="/login" style={{ color: '#F59E0B' }}>Accedi</a>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 0 }}>
              <div>
                <label style={label}>Nome</label>
                <input value={profile.first_name} onChange={e => setProfile({ ...profile, first_name: e.target.value })} style={inp} placeholder="Mario" />
              </div>
              <div>
                <label style={label}>Cognome</label>
                <input value={profile.last_name} onChange={e => setProfile({ ...profile, last_name: e.target.value })} style={inp} placeholder="Rossi" />
              </div>
            </div>
            <label style={label}>Nome visualizzato *</label>
            <input value={profile.display_name} onChange={e => setProfile({ ...profile, display_name: e.target.value })} style={inp} placeholder="Come vuoi essere chiamato?" />
            <label style={label}>Università *</label>
            <input value={profile.university} onChange={e => setProfile({ ...profile, university: e.target.value })} style={inp} placeholder="Es. Politecnico di Milano" />
            <label style={label}>Corso di studi</label>
            <input value={profile.degree_course} onChange={e => setProfile({ ...profile, degree_course: e.target.value })} style={inp} placeholder="Es. Ingegneria Informatica" />
            <label style={label}>Città</label>
            <input value={profile.city} onChange={e => setProfile({ ...profile, city: e.target.value })} style={inp} placeholder="Es. Milano" />
            <label style={label}>Bio</label>
            <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
              style={{ ...inp, minHeight: 80, resize: 'vertical' as const }} placeholder="Raccontati in poche righe..." />
            <label style={{ ...label, marginBottom: 10 }}>Competenze</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 20 }}>
              {SKILLS_OPTIONS.map(skill => (
                <button key={skill} onClick={() => toggleSkill(skill)} style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
                  background: profile.skills.includes(skill) ? 'rgba(124,58,237,0.2)' : 'none',
                  border: profile.skills.includes(skill) ? '1px solid rgba(124,58,237,0.5)' : '1px solid #2D3F5C',
                  color: profile.skills.includes(skill) ? '#8B5CF6' : '#94A3B8',
                }}>{profile.skills.includes(skill) ? '✓ ' : ''}{skill}</button>
              ))}
            </div>
            <button onClick={handleProfile} disabled={loading} style={btn}>{loading ? 'Salvataggio...' : 'Entra in Foundy →'}</button>
          </>
        )}
      </div>
    </div>
  )
}