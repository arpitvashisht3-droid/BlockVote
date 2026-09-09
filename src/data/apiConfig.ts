/**
 * Centralized API Base URL resolver.
 * Supports VITE_API_URL environment variable for production deployment on Render Static Sites,
 * with automatic fallback to relative /api for Vite dev proxy or local backend.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    let cleaned = envUrl.trim().replace(/\/+$/, '')
    if (!cleaned.endsWith('/api')) {
      cleaned = `${cleaned}/api`
    }
    return cleaned
  }

  // In local browser development on port 5173, use relative /api path (proxied by Vite)
  if (typeof window !== 'undefined' && window.location.port === '5173') {
    return '/api'
  }

  return 'http://localhost:5000/api'
}
