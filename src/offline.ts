const CACHE_NAME = 'wavebox-shell-v1'

async function primeOfflineCache() {
  if (!('caches' in window)) return

  const cache = await caches.open(CACHE_NAME)
  const urls = new Set<string>(['/', '/manifest.webmanifest', '/favicon.svg'])

  performance.getEntriesByType('resource').forEach((entry) => {
    if (!('name' in entry) || typeof entry.name !== 'string') return

    try {
      const url = new URL(entry.name)
      if (url.origin !== window.location.origin) return
      urls.add(`${url.pathname}${url.search}`)
    } catch {}
  })

  await Promise.all(
    [...urls].map((url) =>
      cache.add(url).catch(() => undefined)
    )
  )
}

export function registerOfflineSupport() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => primeOfflineCache())
      .catch(() => undefined)
  })
}
