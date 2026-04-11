'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

export default function PublicProfile() {
  const params = useParams()
  const id = params.id as string
  const [profile, setProfile] = useState<any>(null)
  const [openProjects, setOpenProjects] = useState<any[]>([])
  const [closedProjects, setClosedProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [followers, setFollowers] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
      setProfile(p)
      const { data: open } = await supabase.from('projects').select('*').eq('founder_id', id).eq('status', 'active')
      setOpenProjects(open ?? [])
      const { data: closed } = await supabase.from('projects').select('*').eq('founder_id', id).eq('status', 'closed')
      setClosedProjects(closed ?? [])
      setLoading(false)
      const { data: u } = await supabase.auth.getUser()
      setCurrentUser(u.user)
      const { count: f } = await supabase.from('saved_profiles').select('*', { count: 'exact', head: true }).eq('saved_profile_id', id)
      setFollowers(f ?? 0)
      if (u.user) {
      const { data: fol } = await supabase.from('saved_profiles').select('id').eq('profile_id', u.user.id).eq('saved_profile_id', id).single()
      if (fol) setIsFollowing(true)
}
    }
    load()
  }, [id])

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Caricamento...</div>
  if (!profile) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Profilo non trovato</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Card profilo */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '2rem', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile.display_name?.[0]?.toUpperCase() ?? '?'
              }
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>{profile.display_name}</div>
              {profile.university && <div style={{ fontSize: 14, color: '#94A3B8' }}>{profile.university}{profile.degree_course ? ` · ${profile.degree_course}` : ''}</div>}
              {profile.city && <div style={{ fontSize: 13, color: '#64748B' }}>📍 {profile.city}</div>}
            </div>
          </div>

          {/* Statistiche */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, background: '#0F172A', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F59E0B' }}>{openProjects.length + closedProjects.length}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Idee pubblicate</div>
            </div>
            <div style={{ flex: 1, background: '#0F172A', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#10B981' }}>{closedProjects.length}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Team completati</div>
            </div>
            <div style={{ flex: 1, background: '#0F172A', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
  <div style={{ fontSize: 22, fontWeight: 700, color: '#8B5CF6' }}>{followers}</div>
  <div style={{ fontSize: 11, color: '#64748B' }}>Follower</div>
</div>
          </div>

          {currentUser && currentUser.id !== id && (
  <button onClick={async () => {
    if (isFollowing) {
      await supabase.from('saved_profiles').delete().eq('profile_id', currentUser.id).eq('saved_profile_id', id)
      setIsFollowing(false)
      setFollowers(f => f - 1)
    } else {
      await supabase.from('saved_profiles').insert({ profile_id: currentUser.id, saved_profile_id: id })
      setIsFollowing(true)
      setFollowers(f => f + 1)
    }
  }} style={{
    padding: '8px 20px', borderRadius: 9, fontSize: 13, cursor: 'pointer', marginBottom: 16,
    background: isFollowing ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
    border: isFollowing ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(124,58,237,0.3)',
    color: isFollowing ? '#EF4444' : '#8B5CF6',
  }}>
    {isFollowing ? '★ Smetti di seguire' : '☆ Segui'}
  </button>
)}

          {profile.bio && <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>}

          {profile.skills?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
              {profile.skills.map((s: string) => (
                <span key={s} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#8B5CF6' }}>{s}</span>
              ))}
            </div>
          )}

          {profile.contact_email && (
            <a href={`mailto:${profile.contact_email}`} style={{ fontSize: 13, color: '#F59E0B', textDecoration: 'none' }}>✉️ {profile.contact_email}</a>
          )}
        </div>

        {/* Idee aperte */}
        {openProjects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}>💡 Idee aperte</h2>
            {openProjects.map(pr => (
              <a key={pr.id} href={`/projects/${pr.id}`} style={{ textDecoration: 'none' }}>
                <div onMouseEnter={e => (e.currentTarget.style.border = '1px solid #F59E0B')}
                  onMouseLeave={e => (e.currentTarget.style.border = '1px solid #2D3F5C')}
                  style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 12, transition: 'border 0.2s' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{pr.title}</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>{pr.description}</div>
                  {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{pr.category}</span>}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Idee completate */}
        {closedProjects.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}>🏆 Team completati</h2>
            {closedProjects.map(pr => (
              <div key={pr.id} style={{ background: '#1E293B', border: '1px solid rgba(16,185,129,0.4)', borderRadius: 14, padding: '1.25rem', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{pr.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>{pr.description}</div>
                {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981' }}>{pr.category}</span>}
              </div>
            ))}
          </div>
        )}

        {openProjects.length === 0 && closedProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💡</div>
            <p>Nessuna idea pubblicata ancora.</p>
          </div>
        )}
      </div>
    </div>
  )
}