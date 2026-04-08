'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function PublicProfile({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', params.id).single()
      setProfile(p)
      const { data: pr } = await supabase.from('projects').select('*').eq('founder_id', params.id).eq('status', 'active')
      setProjects(pr ?? [])
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Caricamento...</div>
  if (!profile) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Profilo non trovato</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* Card profilo */}
        <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '2rem', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {profile.display_name?.[0] ?? '?'}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9' }}>{profile.display_name}</div>
              {profile.university && <div style={{ fontSize: 14, color: '#94A3B8' }}>{profile.university}{profile.degree_course ? ` · ${profile.degree_course}` : ''}</div>}
              {profile.city && <div style={{ fontSize: 13, color: '#64748B' }}>📍 {profile.city}</div>}
            </div>
          </div>

          {profile.bio && (
            <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>
          )}

          {profile.skills?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
              {profile.skills.map((s: string) => (
                <span key={s} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#8B5CF6' }}>{s}</span>
              ))}
            </div>
          )}

          {profile.contact_email && (
            <a href={`mailto:${profile.contact_email}`} style={{ fontSize: 13, color: '#F59E0B', textDecoration: 'none' }}>
              ✉️ {profile.contact_email}
            </a>
          )}
        </div>

        {/* Idee pubblicate */}
        {projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 14 }}>Idee pubblicate</h2>
            {projects.map(pr => (
              <div key={pr.id} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 12 }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{pr.title}</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 8 }}>{pr.description}</div>
                {pr.category && <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>{pr.category}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}