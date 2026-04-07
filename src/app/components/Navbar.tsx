'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [initials, setInitials] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', data.user.id)
          .single()
        if (profile?.display_name) {
          setInitials(profile.display_name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase())
        }
        const myProjects = await supabase.from('projects').select('id').eq('founder_id', data.user.id)
        const ids = myProjects.data?.map(p => p.id) ?? []
        if (ids.length > 0) {
  const { count } = await supabase
    .from('join_requests')
    .select('*', { count: 'exact', head: true })
    .in('project_id', ids)
    .eq('status', 'pending')
  setPendingCount(count ?? 0)
}

const { count: acceptedCount } = await supabase
  .from('join_requests')
  .select('*', { count: 'exact', head: true })
  .eq('applicant_id', data.user.id)
  .eq('status', 'accepted')
  .gt('decision_at', new Date(Date.now() - 86400000).toISOString())

setPendingCount(prev => prev + (acceptedCount ?? 0))
      }
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) { setInitials(''); setPendingCount(0) }
    })
  }, [])

  const links = [
    { href: '/', label: 'Feed', badge: 0 },
    { href: '/search', label: 'Cerca', badge: 0 },
    { href: '/dashboard', label: 'Gestione', badge: pendingCount },
    { href: '/showcase', label: 'Vetrina', badge: 0 },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #2D3F5C',
      padding: '0 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      height: 60,
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src="/foundy.png" alt="Foundy" style={{ height: 120, width: 'auto' }} />
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 14,
            color: pathname === l.href ? '#F59E0B' : '#94A3B8',
            background: pathname === l.href ? 'rgba(245,158,11,0.1)' : 'none',
            fontWeight: pathname === l.href ? 500 : 400,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {l.label}
            {l.badge > 0 && (
              <span style={{
                background: '#EF4444', color: '#fff',
                borderRadius: 999, fontSize: 10, fontWeight: 700,
                padding: '1px 6px', minWidth: 18, textAlign: 'center'
              }}>{l.badge}</span>
            )}
          </Link>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        {user ? (
          <div onClick={() => setMenuOpen(!menuOpen)} style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
          }}>
            {initials || '?'}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/login" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 14, border: '1px solid #2D3F5C', color: '#94A3B8' }}>Accedi</Link>
            <Link href="/signup" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 14, background: '#7C3AED', color: '#fff', fontWeight: 500 }}>Registrati</Link>
          </div>
        )}

        {menuOpen && user && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            background: '#1E293B', border: '1px solid #2D3F5C',
            borderRadius: 10, padding: 8, minWidth: 160, zIndex: 200,
          }}>
            <Link href="/profile" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 12px', fontSize: 14, color: '#F1F5F9', borderRadius: 6 }}>
              Il mio profilo
            </Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '8px 12px', fontSize: 14, color: '#F1F5F9', borderRadius: 6 }}>
              Dashboard
            </Link>
            <div style={{ height: 1, background: '#2D3F5C', margin: '4px 0' }} />
            <button onClick={async () => { await supabase.auth.signOut(); setMenuOpen(false); window.location.href = '/' }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 14, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6 }}>
              Esci
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}