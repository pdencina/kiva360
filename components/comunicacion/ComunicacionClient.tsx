'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { getMensajes, enviarMensaje } from '@/lib/actions/comunicacion'
import { createClient } from '@/lib/supabase/client'

const ROL_LABEL: Record<string, string> = {
  director: 'Director/a', utp: 'UTP', profesor: 'Profesor/a',
  apoderado: 'Apoderado/a', alumno: 'Alumno/a',
}

const AVATAR_COLOR = (nombre: string) => {
  const colores = ['#1976D2','#00897B','#7B1FA2','#E53935','#E65100','#1565C0']
  return colores[nombre.charCodeAt(0) % colores.length]
}

const iniciales = (nombre: string) =>
  nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

interface Conversacion {
  usuario_id: string
  nombre:     string
  rol:        string
  ultimo_msg: string
  enviado_en: string
  no_leidos:  number
}

interface Usuario {
  id:     string
  nombre: string
  rol:    string
}

interface Mensaje {
  id:            string
  de_usuario_id: string
  contenido:     string
  enviado_en:    string
  leido:         boolean
}

interface Props {
  conversaciones:   Conversacion[]
  usuarios:         Usuario[]
  usuarioActualId:  string
}

export function ComunicacionClient({ conversaciones: inicial, usuarios, usuarioActualId }: Props) {
  const [conversaciones, setConversaciones] = useState(inicial)
  const [seleccionado,   setSeleccionado]   = useState<string | null>(null)
  const [mensajes,       setMensajes]       = useState<Mensaje[]>([])
  const [texto,          setTexto]          = useState('')
  const [cargando,       setCargando]       = useState(false)
  const [enviando,       setEnviando]       = useState(false)
  const [mostrarNuevo,   setMostrarNuevo]   = useState(false)
  const [, startTransition]                 = useTransition()
  const chatRef                             = useRef<HTMLDivElement>(null)
  const inputRef                            = useRef<HTMLInputElement>(null)

  const usuarioSeleccionado = seleccionado
    ? (usuarios.find(u => u.id === seleccionado) ?? conversaciones.find(c => c.usuario_id === seleccionado))
    : null

  // Cargar mensajes al seleccionar conversación
  useEffect(() => {
    if (!seleccionado) return
    setCargando(true)
    getMensajes(seleccionado).then(msgs => {
      setMensajes(msgs as Mensaje[])
      setCargando(false)
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100)
    })
  }, [seleccionado])

  // Realtime — nuevos mensajes
  useEffect(() => {
    if (!seleccionado) return
    const supabase = createClient()
    const channel = supabase
      .channel(`chat-${seleccionado}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'mensajes',
        filter: `de_usuario_id=eq.${seleccionado}`,
      }, payload => {
        setMensajes(prev => [...prev, payload.new as Mensaje])
        setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [seleccionado])

  const handleEnviar = async () => {
    if (!seleccionado || !texto.trim() || enviando) return
    const textoEnviado = texto.trim()
    setTexto('')
    setEnviando(true)

    // Optimistic update
    const msgOptimista: Mensaje = {
      id:            `temp-${Date.now()}`,
      de_usuario_id: usuarioActualId,
      contenido:     textoEnviado,
      enviado_en:    new Date().toISOString(),
      leido:         false,
    }
    setMensajes(prev => [...prev, msgOptimista])
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 50)

    await enviarMensaje(seleccionado, textoEnviado)
    setEnviando(false)
    inputRef.current?.focus()
  }

  const formatHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })

  const formatFechaRelativa = (fecha: string) => {
    const diff = Date.now() - new Date(fecha).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Ahora'
    if (mins < 60) return `Hace ${mins} min`
    if (mins < 1440) return `Hace ${Math.floor(mins/60)}h`
    return new Date(fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', height: '100%' }}>

      {/* Lista de conversaciones */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '0.8rem', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>Mensajes</span>
            <button onClick={() => setMostrarNuevo(true)} style={{ width: '28px', height: '28px', background: '#1976D2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
          </div>
          <input placeholder="🔍 Buscar..." style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0.4rem 0.7rem', fontSize: '0.78rem', outline: 'none', fontFamily: 'system-ui' }} />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversaciones.length === 0 && !mostrarNuevo ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
              Sin conversaciones.<br />Inicia una nueva con el botón +
            </div>
          ) : (
            conversaciones.map(conv => (
              <div key={conv.usuario_id} onClick={() => setSeleccionado(conv.usuario_id)} style={{
                display: 'flex', gap: '0.7rem', padding: '0.7rem 0.8rem', cursor: 'pointer',
                background: seleccionado === conv.usuario_id ? '#EFF6FF' : 'white',
                borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s',
              }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: AVATAR_COLOR(conv.nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                  {iniciales(conv.nombre)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>{conv.nombre}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{formatFechaRelativa(conv.enviado_en)}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.ultimo_msg}</div>
                </div>
                {conv.no_leidos > 0 && (
                  <div style={{ width: '18px', height: '18px', background: '#1976D2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0 }}>
                    {conv.no_leidos}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Nueva conversación */}
          {mostrarNuevo && (
            <div style={{ padding: '0.8rem', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0F172A', marginBottom: '0.5rem' }}>Nueva conversación</div>
              {usuarios.map(u => (
                <div key={u.id} onClick={() => { setSeleccionado(u.id); setMostrarNuevo(false); if (!conversaciones.find(c => c.usuario_id === u.id)) { setConversaciones(prev => [{ usuario_id: u.id, nombre: u.nombre, rol: u.rol, ultimo_msg: '', enviado_en: new Date().toISOString(), no_leidos: 0 }, ...prev]) } }} style={{
                  display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
                }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: AVATAR_COLOR(u.nombre), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.68rem', fontWeight: 700 }}>
                    {iniciales(u.nombre)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>{u.nombre}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{ROL_LABEL[u.rol] ?? u.rol}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!seleccionado ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94A3B8', gap: '0.5rem' }}>
            <div style={{ fontSize: '3rem' }}>💬</div>
            <div style={{ fontWeight: 600 }}>Selecciona una conversación</div>
            <div style={{ fontSize: '0.82rem' }}>o inicia una nueva con el botón +</div>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: AVATAR_COLOR((usuarioSeleccionado as any)?.nombre ?? ''), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>
                {iniciales((usuarioSeleccionado as any)?.nombre ?? '?')}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{(usuarioSeleccionado as any)?.nombre ?? '—'}</div>
                <div style={{ fontSize: '0.7rem', color: '#00897B' }}>● {ROL_LABEL[(usuarioSeleccionado as any)?.rol ?? ''] ?? 'Usuario'}</div>
              </div>
            </div>

            {/* Mensajes */}
            <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {cargando ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>Cargando...</div>
              ) : mensajes.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem', fontSize: '0.82rem' }}>
                  No hay mensajes aún. ¡Envía el primero!
                </div>
              ) : (
                mensajes.map(msg => {
                  const esMio = msg.de_usuario_id === usuarioActualId
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: esMio ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '68%', padding: '0.6rem 0.9rem', borderRadius: '12px',
                        background: esMio ? '#1976D2' : '#F1F5F9',
                        color:      esMio ? 'white'   : '#0F172A',
                        borderBottomRightRadius: esMio ? '3px' : '12px',
                        borderBottomLeftRadius:  esMio ? '12px' : '3px',
                        fontSize: '0.82rem', lineHeight: 1.5,
                      }}>
                        {msg.contenido}
                        <div style={{ fontSize: '0.6rem', opacity: 0.65, textAlign: 'right', marginTop: '0.2rem' }}>
                          {formatHora(msg.enviado_en)}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input */}
            <div style={{ padding: '0.8rem 1.2rem', borderTop: '1px solid #F1F5F9', display: 'flex', gap: '0.6rem' }}>
              <input
                ref={inputRef}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviar() } }}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, border: '1.5px solid #E2E8F0', borderRadius: '10px', padding: '0.5rem 0.9rem', fontSize: '0.85rem', outline: 'none', fontFamily: 'system-ui', transition: 'border-color 0.15s' }}
              />
              <button onClick={handleEnviar} disabled={enviando || !texto.trim()} style={{
                width: '38px', height: '38px', background: texto.trim() ? '#1976D2' : '#F1F5F9',
                color: texto.trim() ? 'white' : '#94A3B8',
                border: 'none', borderRadius: '10px', cursor: texto.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                transition: 'all 0.15s', flexShrink: 0,
              }}>
                ➤
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
