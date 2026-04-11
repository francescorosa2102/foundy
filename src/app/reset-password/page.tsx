'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleReset() {
    if (!password || password.length < 6) { showToast('La password deve essere di almeno 6 caratteri'); return }
    if (password !== confirm) { showToast('Le password non coincidono'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { showToast('Errore: ' + error.message); return }
    showToast('Password aggiornata! ✅')
    setTimeout(() => window.location.href = '/profile', 2000)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '11px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', marginBottom: 8 }}>Nuova password</h2>
        <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>Scegli una nuova password sicura.</p>
        <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Nuova password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inp} placeholder="Min. 6 caratteri" />
        <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Conferma password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inp} placeholder="Ripeti la password" />
        <button onClick={handleReset} disabled={loading} style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
          {loading ? 'Aggiornamento...' : 'Aggiorna password'}
        </button>
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}