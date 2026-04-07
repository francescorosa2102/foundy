'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '../../../lib/supabaseClient'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
  profiles: { display_name: string } | null
}

export default function WorkspacePage({ params: rawParams }: { params: Promise<{ id: string }> }) {
  const params = React.use(rawParams)
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { window.location.href = '/login'; return }
      setUser(data.user)
      await loadAll(data.user.id)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`messages:${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${params.id}`
      }, (payload) => {
        loadMessages()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [params.id])

  async function loadAll(uid: string) {
    setLoading(true)
    const { data: proj } = await supabase
      .from('projects')
      .select('*, profiles:founder_id(display_name)')
      .eq('id', params.id)
      .single()
    setProject(proj)

    
     const memberCheck = await supabase.from('project_members').select('id').eq('project_id', params.id).eq('profile_id', uid)
     const isMember = proj?.founder_id === uid || (memberCheck.data?.length ?? 0) > 0

    if (!isMember) { setAuthorized(false); setLoading(false); return }
    setAuthorized(true)

    const { data: msgs } = await supabase
      .from('messages')
      .select('*, profiles:sender_id(display_name)')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })
    setMessages(msgs ?? [])

    const { data: mem } = await supabase
      .from('project_members')
      .select('*, profiles:profile_id(display_name)')
      .eq('project_id', params.id)
    setMembers(mem ?? [])

    setLoading(false)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles:sender_id(display_name)')
      .eq('project_id', params.id)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
  }

  async function sendMessage() {
    if (!text.trim() || !user) return
    await supabase.from('messages').insert({
      project_id: params.id,
      sender_id: user.id,
      content: text.trim()
    })
    setText('')
  }

  function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Caricamento...</div>

  if (!authorized) return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <p style={{ color: '#94A3B8', fontSize: 16 }}>Non sei autorizzato ad accedere a questo workspace.</p>
      <a href="/" style={{ color: '#F59E0B', fontSize: 14 }}>Torna al feed</a>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: '#1E293B', borderBottom: '1px solid #2D3F5C', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/dashboard" style={{ color: '#94A3B8', fontSize: 13 }}>← Dashboard</a>
            <span style={{ color: '#2D3F5C' }}>|</span>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#F1F5F9' }}>{project?.title}</h1>
          </div>
          <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 2 }}>Workspace del team</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff' }}>
            {project?.profiles?.display_name?.[0] ?? '?'}
          </div>
          {members.map((m: any) => (
            <div key={m.profile_id} style={{ width: 32, height: 32, borderRadius: '50%', background: '#2D3F5C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
              {m.profiles?.display_name?.[0] ?? '?'}
            </div>
          ))}
        </div>
      </div>

      {/* Membri */}
      <div style={{ background: '#1E293B', borderBottom: '1px solid #2D3F5C', padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: '#64748B' }}>Team:</span>
        <span style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', color: '#8B5CF6' }}>
          👑 {project?.profiles?.display_name ?? 'Founder'}
        </span>
        {members.map((m: any) => (
          <span key={m.profile_id} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
            {m.profiles?.display_name ?? 'Membro'}
          </span>
        ))}
      </div>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
            <p>Nessun messaggio ancora. Inizia la conversazione!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#7C3AED,#F59E0B)' : '#2D3F5C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                {msg.profiles?.display_name?.[0] ?? '?'}
              </div>
              <div style={{ maxWidth: '68%' }}>
                <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
                  {msg.profiles?.display_name ?? 'Utente'} · {formatTime(msg.created_at)}
                </div>
                <div style={{
                  background: isMe ? 'linear-gradient(135deg,#7C3AED,#6D28D9)' : '#1E293B',
                  border: isMe ? 'none' : '1px solid #2D3F5C',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px', fontSize: 14, color: '#F1F5F9', lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: '#1E293B', borderTop: '1px solid #2D3F5C', padding: '1rem 1.5rem', display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Scrivi un messaggio..."
          style={{ flex: 1, padding: '11px 16px', background: '#0F172A', border: '1px solid #2D3F5C', borderRadius: 10, color: '#F1F5F9', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
        />
        <button onClick={sendMessage} style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', border: 'none', padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Invia →
        </button>
      </div>
    </div>
  )
}