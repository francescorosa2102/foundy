'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }
  const btn: React.CSSProperties = { width: '100%', padding: '11px', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 15, fontWeight: 500, cursor: 'pointer' }

  async function login() {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError('Email o password errati'); return }
    window.location.href = '/'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', fontFamily: 'Georgia, serif' }}>found<span style={{ color: '#F59E0B' }}>y</span></div>
          <div style={{ fontSize: 14, color: '#94A3B8', marginTop: 6 }}>Bentornato</div>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>{error}</div>}
        <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inp} placeholder="tua@email.com" />
        <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inp, marginBottom: 20 }} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && login()} />
        <button onClick={login} disabled={loading} style={btn}>{loading ? 'Accesso...' : 'Accedi'}</button>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#94A3B8' }}>
          Non hai un account? <a href="/signup" style={{ color: '#F59E0B' }}>Registrati</a>
        </div>
      </div>
    </div>
  )
}