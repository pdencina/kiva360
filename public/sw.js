// Kiva360 Service Worker — PWA offline support
const CACHE = 'kiva360-v1'
const OFFLINE_URL = '/offline'

const PRECACHE = [
  '/',
  '/dashboard',
  '/movil/asistencia',
  '/offline',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  if (!e.request.url.startsWith(self.location.origin)) return

  // Para navegación — network first, fallback a offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Para assets estáticos — cache first
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})

// Sincronización en background (asistencia offline)
self.addEventListener('sync', e => {
  if (e.tag === 'sync-asistencia') {
    e.waitUntil(sincronizarAsistencia())
  }
})

async function sincronizarAsistencia() {
  const db = await abrirDB()
  const pendientes = await obtenerPendientes(db)
  for (const item of pendientes) {
    try {
      await fetch('/api/asistencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })
      await eliminarPendiente(db, item.id)
    } catch {}
  }
}

function abrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('kiva360', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('asistencia_pendiente', { keyPath: 'id', autoIncrement: true })
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = reject
  })
}

function obtenerPendientes(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('asistencia_pendiente', 'readonly')
    const req = tx.objectStore('asistencia_pendiente').getAll()
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = reject
  })
}

function eliminarPendiente(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('asistencia_pendiente', 'readwrite')
    tx.objectStore('asistencia_pendiente').delete(id)
    tx.oncomplete = resolve
    tx.onerror = reject
  })
}
