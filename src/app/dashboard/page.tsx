'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

type Tab = 'ricevute' | 'inviate' | 'mie-idee'

function Avatar({ url, name, size = 40 }: { url?: string | null, name?: string, size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size / 3, fontWeight: 600, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
      {url
        ? <img src={url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : name?.[0]?.toUpperCase() ?? '?'
      }
    </div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tab, setTab] = useState<Tab>('ricevute')
  const [received, setReceived] = useState<any[]>([])
  const [sent, setSent] = useState<any[]>([])
  const [myProjects, setMyProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editProject, setEditProject] = useState<any>(null)
  const [editData, setEditData] = useState({ title: '', description: '', category: '', required_roles: '', image_url: '' })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p)
      await loadAll(data.user.id)
    })
  }, [])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function loadAll(uid: string) {
    setLoading(true)
    const myProjectIds = (await supabase.from('projects').select('id').eq('founder_id', uid)).data?.map(p => p.id) ?? []

    const [recvRes, sentRes, myRes] = await Promise.all([
      myProjectIds.length > 0
        ? supabase.from('join_requests')
            .select('*, profiles:applicant_id(id, display_name, avatar_url, skills, university, bio, city, degree_course), projects:project_id(title, founder_id)')
            .in('project_id', myProjectIds)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
        : { data: [] },
      supabase.from('join_requests')
        .select('*, projects:project_id(title, category, id, profiles:founder_id(id, display_name, avatar_url))')
        .eq('applicant_id', uid)
        .order('created_at', { ascending: false }),
      supabase.from('projects')
        .select('*, project_members(profile_id, profiles:profile_id(display_name, avatar_url))')
        .eq('founder_id', uid)
        .order('created_at', { ascending: false }),
    ])

    setReceived(recvRes.data ?? [])
    setSent(sentRes.data ?? [])
    setMyProjects(myRes.data ?? [])
    setLoading(false)
  }

  async function acceptRequest(reqId: string, projectId: string, applicantId: string) {
    const { error: e1 } = await supabase.from('join_requests').update({ status: 'accepted', decision_at: new Date().toISOString() }).eq('id', reqId)
    const { error: e2 } = await supabase.from('project_members').upsert({ project_id: projectId, profile_id: applicantId })
    if (e1 || e2) { showToast('Errore: ' + (e1?.message || e2?.message)); return }
    showToast('Richiesta accettata! ✅')
    if (user) loadAll(user.id)
  }

  async function rejectRequest(reqId: string) {
    await supabase.from('join_requests').update({ status: 'rejected', decision_at: new Date().toISOString() }).eq('id', reqId)
    showToast('Richiesta rifiutata.')
    if (user) loadAll(user.id)
  }

  async function removeMember(projectId: string, profileId: string) {
    await supabase.from('project_members').delete().eq('project_id', projectId).eq('profile_id', profileId)
    await supabase.from('join_requests').update({ status: 'rejected' }).eq('project_id', projectId).eq('applicant_id', profileId)
    showToast('Membro rimosso.')
    if (user) loadAll(user.id)
  }

  async function leaveProject(projectId: string) {
    if (!user) return
    await supabase.from('project_members').delete().eq('project_id', projectId).eq('profile_id', user.id)
    await supabase.from('join_requests').update({ status: 'rejected' }).eq('project_id', projectId).eq('applicant_id', user.id)
    showToast('Hai lasciato il progetto.')
    if (user) loadAll(user.id)
  }

  async function deleteProject(projectId: string) {
    await supabase.from('projects').delete().eq('id', projectId)
    setConfirmDelete(null)
    showToast('Progetto eliminato.')
    if (user) loadAll(user.id)
  }

  async function saveEdit() {
  if (!editProject) return
  const roles = editData.required_roles.split(',').map(r => r.trim()).filter(Boolean)
  const { error } = await supabase.from('projects').update({
    title: editData.title,
    description: editData.description,
    category: editData.category,
    required_roles: roles,
    image_url: editData.image_url || null,
  }).eq('id', editProject.id)
  if (error) { showToast('Errore nel salvataggio'); return }
  setEditProject(null)
  showToast('Idea aggiornata! ✅')
  if (user) loadAll(user.id)
}

async function uploadEditImage(file: File) {
  if (!user) return
  const ext = file.name.split('.').pop()
  const path = `${user.id}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('project-images').upload(path, file)
  if (error) { showToast('Errore upload immagine'); return }
  const { data } = supabase.storage.from('project-images').getPublicUrl(path)
  setEditData(prev => ({ ...prev, image_url: data.publicUrl }))
  showToast('Immagine caricata! ✅')
}

  const statusBadge = (s: string): React.CSSProperties => {
    const map: Record<string, React.CSSProperties> = {
      pending: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
      accepted: { background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
      rejected: { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
    }
    return { ...(map[s] ?? map.pending), fontSize: 11, padding: '3px 10px', borderRadius: 999, fontWeight: 500 }
  }

  const btn: React.CSSProperties = { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }
  const btnDanger: React.CSSProperties = { background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer' }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>
          Ciao, {profile?.display_name ?? '—'} 👋
        </h1>
        <p style={{ fontSize: 15, color: '#94A3B8', marginBottom: 28 }}>Gestisci le tue idee e le richieste di collaborazione.</p>

        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2D3F5C', marginBottom: 28 }}>
          {([['ricevute', 'Richieste ricevute'], ['inviate', 'Richieste inviate'], ['mie-idee', 'Le mie idee']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              color: tab === t ? '#F59E0B' : '#94A3B8',
              borderBottom: tab === t ? '2px solid #F59E0B' : '2px solid transparent',
              fontWeight: tab === t ? 500 : 400, marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Caricamento...</div>}

        {!loading && tab === 'ricevute' && (
          <div>
            {received.length === 0
              ? <Empty text="Nessuna richiesta ricevuta" />
              : received.map(r => (
                <div key={r.id} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <a href={`/profile/${r.applicant_id}`} style={{ textDecoration: 'none' }}>
                        <Avatar url={r.profiles?.avatar_url} name={r.profiles?.display_name} size={40} />
                      </a>
                      <div>
                        <a href={`/profile/${r.applicant_id}`} style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', textDecoration: 'none' }}>{r.profiles?.display_name ?? 'Utente'}</a>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{r.profiles?.university ?? ''} {r.profiles?.degree_course ? `· ${r.profiles.degree_course}` : ''}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: '#94A3B8', background: '#0F172A', padding: '3px 10px', borderRadius: 999 }}>
                      {r.projects?.title}
                    </span>
                  </div>
                  {r.profiles?.city && <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>📍 {r.profiles.city}</div>}
                  {r.profiles?.skills?.length > 0 && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                      {r.profiles.skills.map((s: string) => (
                        <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, border: '1px solid #2D3F5C', color: '#94A3B8' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {r.profiles?.bio && <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.5, marginBottom: 10 }}>{r.profiles.bio}</p>}
                  {r.message && (
                    <div style={{ background: '#0F172A', borderRadius: 8, padding: '10px 14px', marginBottom: 14, borderLeft: '3px solid #7C3AED' }}>
                      <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>Messaggio di motivazione</div>
                      <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', lineHeight: 1.5 }}>"{r.message}"</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => acceptRequest(r.id, r.project_id, r.applicant_id)} style={btn}>✓ Accetta</button>
                    <button onClick={() => rejectRequest(r.id)} style={btnDanger}>✕ Rifiuta</button>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {!loading && tab === 'inviate' && (
          <div>
            {sent.length === 0
              ? <Empty text="Non hai ancora inviato richieste" />
              : sent.map(r => (
                <div key={r.id} style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 14, padding: '1.25rem', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <a href={`/profile/${r.projects?.profiles?.id}`} style={{ textDecoration: 'none' }}>
                        <Avatar url={r.projects?.profiles?.avatar_url} name={r.projects?.profiles?.display_name} size={36} />
                      </a>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9' }}>{r.projects?.title ?? '—'}</div>
                        <a href={`/profile/${r.projects?.profiles?.id}`} style={{ fontSize: 12, color: '#64748B', textDecoration: 'none' }}>
                          Founder: {r.projects?.profiles?.display_name ?? '—'}
                        </a>
                      </div>
                    </div>
                    <span style={statusBadge(r.status)}>
                      {r.status === 'pending' ? 'In attesa' : r.status === 'accepted' ? 'Accettato ✓' : 'Lasciato/Rifiutato'}
                    </span>
                  </div>
                  {r.message && <p style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic', marginBottom: 10 }}>"{r.message}"</p>}
                  {r.status === 'accepted' && r.projects?.id && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`/projects/${r.projects.id}/workspace`} style={{ ...btn, display: 'inline-block', textDecoration: 'none', fontSize: 13 }}>
                        💬 Apri workspace →
                      </a>
                      <button onClick={() => leaveProject(r.projects.id)} style={btnDanger}>
                        Lascia progetto
                      </button>
                    </div>
                  )}
                </div>
              ))
            }
          </div>
        )}

        {!loading && tab === 'mie-idee' && (
          <div>
            {myProjects.length === 0
              ? <Empty text="Non hai ancora pubblicato idee" />
              : myProjects.map(pr => {
                const members = pr.project_members ?? []
                const totalRoles = (pr.required_roles ?? []).length
                const filled = members.length
                const isComplete = totalRoles > 0 && filled >= totalRoles
                return (
                  <div key={pr.id} style={{ background: '#1E293B', border: `1px solid ${isComplete ? 'rgba(16,185,129,0.4)' : '#2D3F5C'}`, borderRadius: 14, padding: '1.25rem', marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9' }}>{pr.title}</div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{pr.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={statusBadge(isComplete ? 'accepted' : 'pending')}>
                          {isComplete ? '🎉 Team completo' : `${filled}/${totalRoles} co-founder`}
                        </span>
                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{filled} su {totalRoles} ruoli coperti</div>
                      </div>
                    </div>

                    <div style={{ background: '#0F172A', borderRadius: 999, height: 6, marginBottom: 12, overflow: 'hidden' }}>
                      <div style={{ background: isComplete ? '#10B981' : '#7C3AED', height: '100%', width: `${totalRoles > 0 ? (filled / totalRoles) * 100 : 0}%`, borderRadius: 999, transition: 'width 0.3s' }} />
                    </div>

                    {members.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>Team attuale:</div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                          {members.map((m: any) => (
                            <div key={m.profile_id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <a href={`/profile/${m.profile_id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
                                <Avatar url={m.profiles?.avatar_url} name={m.profiles?.display_name} size={24} />
                                <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#8B5CF6' }}>
                                  {m.profiles?.display_name ?? 'Membro'}
                                </span>
                              </a>
                              <button onClick={() => removeMember(pr.id, m.profile_id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, padding: '2px 4px' }} title="Rimuovi membro">✕</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 14 }}>
                      {(pr.required_roles ?? []).map((role: string, i: number) => (
                        <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, border: `1px solid ${i < filled ? 'rgba(16,185,129,0.4)' : '#2D3F5C'}`, color: i < filled ? '#10B981' : '#94A3B8', background: i < filled ? 'rgba(16,185,129,0.08)' : 'none' }}>
                          {i < filled ? '✓ ' : '○ '}{role}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      <a href={`/projects/${pr.id}/workspace`} style={{ ...btn, display: 'inline-block', textDecoration: 'none', fontSize: 13 }}>
                        💬 Apri workspace →
                      </a>
                      <button onClick={() => {
  setEditProject(pr)
  setEditData({
    title: pr.title,
    description: pr.description,
    category: pr.category ?? '',
    required_roles: (pr.required_roles ?? []).join(', '),
    image_url: pr.image_url ?? '',
  })
}} style={{ ...btn, background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
  ✏️ Modifica
</button>
                      <button onClick={() => setConfirmDelete(pr.id)} style={btnDanger}>
                        🗑 Elimina progetto
                      </button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>

      {editProject && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
    <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>✏️ Modifica idea</h3>
      
      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Titolo</label>
      <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })}
        style={{ width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }}
        placeholder="Nome dell'idea" />

      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Descrizione</label>
      <textarea value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })}
        style={{ width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14, minHeight: 90, resize: 'vertical' as const }}
        placeholder="Di cosa si tratta?" />

      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Settore</label>
      <input value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })}
        style={{ width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }}
        placeholder="Es. Fintech, AI, SaaS..." />

      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Ruoli cercati (separati da virgola)</label>
      <input value={editData.required_roles} onChange={e => setEditData({ ...editData, required_roles: e.target.value })}
        style={{ width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 14 }}
        placeholder="Dev, Designer, Marketing..." />

      <label style={{ display: 'block', fontSize: 13, color: '#94A3B8', marginBottom: 6 }}>Immagine (opzionale)</label>
      <input type="file" accept="image/*" onChange={async e => {
        const file = e.target.files?.[0]
        if (file) await uploadEditImage(file)
      }} style={{ width: '100%', padding: '10px 14px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 9, color: '#F1F5F9', fontSize: 14, cursor: 'pointer', marginBottom: 14 }} />
      {editData.image_url && <img src={editData.image_url} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 14 }} />}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setEditProject(null)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #2D3F5C', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>Annulla</button>
        <button onClick={saveEdit} style={{ flex: 1, padding: '10px', borderRadius: 9, background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Salva modifiche</button>
      </div>
    </div>
  </div>
)}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#1E293B', border: '1px solid #2D3F5C', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9', marginBottom: 8 }}>Elimina progetto</h3>
            <p style={{ fontSize: 14, color: '#94A3B8', marginBottom: 24 }}>Questa azione è irreversibile. Il progetto e tutti i suoi dati verranno eliminati definitivamente.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid #2D3F5C', background: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>Annulla</button>
              <button onClick={() => deleteProject(confirmDelete)} style={{ flex: 1, padding: '10px', borderRadius: 9, background: '#EF4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>Elimina</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1E293B', border: '1px solid #2D3F5C', color: '#F1F5F9', padding: '12px 24px', borderRadius: 12, fontSize: 14, zIndex: 300 }}>{toast}</div>}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8', border: '1px dashed #2D3F5C', borderRadius: 14 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
      <p>{text}</p>
    </div>
  )
}