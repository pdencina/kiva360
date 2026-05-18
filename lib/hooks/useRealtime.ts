'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions<T> {
  table:    string
  filter?:  string
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
}

// Hook genérico para suscribirse a cambios en tiempo real de Supabase
export function useRealtime<T>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`realtime-${table}-${filter ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table,
          filter,
        },
        payload => {
          if (payload.eventType === 'INSERT' && onInsert)
            onInsert(payload.new as T)
          if (payload.eventType === 'UPDATE' && onUpdate)
            onUpdate(payload.new as T)
          if (payload.eventType === 'DELETE' && onDelete)
            onDelete(payload.old as T)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, onInsert, onUpdate, onDelete])
}
