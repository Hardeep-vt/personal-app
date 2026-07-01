import { WHOOP_CLIENT_ID, WHOOP_REDIRECT_URI, WHOOP_TOKEN_PROXY_URL } from '../config'

const AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth'
const API_BASE = 'https://api.prod.whoop.com/developer/v1'

const SCOPES = 'read:workout read:recovery read:sleep read:profile offline'

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function base64url(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generatePKCE() {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)))
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  const challenge = base64url(hash)
  return { verifier, challenge }
}

// ── Token storage ─────────────────────────────────────────────────────────────

export function getWhoopToken() {
  const raw = localStorage.getItem('whoop_token')
  if (!raw) return null
  try {
    const t = JSON.parse(raw)
    // Consider expired 60s early
    if (t.expires_at && Date.now() > t.expires_at - 60_000) return null
    return t.access_token
  } catch { return null }
}

export function isWhoopConnected() {
  const raw = localStorage.getItem('whoop_token')
  if (!raw) return false
  try {
    const t = JSON.parse(raw)
    return !!(t.access_token)
  } catch { return false }
}

export function disconnectWhoop() {
  localStorage.removeItem('whoop_token')
  localStorage.removeItem('whoop_pkce_verifier')
  localStorage.removeItem('whoop_oauth_state')
}

// ── OAuth flow ────────────────────────────────────────────────────────────────

export async function startWhoopAuth() {
  const { verifier, challenge } = await generatePKCE()
  const state = base64url(crypto.getRandomValues(new Uint8Array(16)))

  localStorage.setItem('whoop_pkce_verifier', verifier)
  localStorage.setItem('whoop_oauth_state', state)

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: WHOOP_CLIENT_ID,
    redirect_uri: WHOOP_REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.href = `${AUTH_URL}?${params}`
}

// Called on app load — checks if URL has ?code= from Whoop redirect
export async function handleWhoopCallback() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')

  if (!code) return false

  const savedState = localStorage.getItem('whoop_oauth_state')
  const verifier = localStorage.getItem('whoop_pkce_verifier')

  if (state !== savedState) {
    console.error('Whoop OAuth: state mismatch')
    return false
  }

  const res = await fetch(WHOOP_TOKEN_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier, redirect_uri: WHOOP_REDIRECT_URI }),
  })

  if (!res.ok) {
    console.error('Whoop token exchange failed', await res.text())
    return false
  }

  const token = await res.json()
  localStorage.setItem('whoop_token', JSON.stringify({
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    expires_at: Date.now() + token.expires_in * 1000,
  }))

  localStorage.removeItem('whoop_pkce_verifier')
  localStorage.removeItem('whoop_oauth_state')

  // Clean ?code= from URL without reloading
  window.history.replaceState({}, '', window.location.pathname)
  return true
}

// ── API calls ─────────────────────────────────────────────────────────────────

async function whoopFetch(path, params = {}) {
  const token = getWhoopToken()
  if (!token) throw new Error('Not connected to Whoop')

  const url = new URL(`${API_BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Whoop API error ${res.status}`)
  return res.json()
}

// Returns workouts for a given date (YYYY-MM-DD)
export async function fetchWhoopWorkouts(date) {
  const start = `${date}T00:00:00.000Z`
  const end = `${date}T23:59:59.999Z`
  const data = await whoopFetch('/activity/workout', { start, end, limit: 25 })
  return (data.records || []).map(w => ({
    id: `whoop-${w.id}`,
    source: 'whoop',
    date,
    exercise_type: w.sport_name || 'Workout',
    duration_min: w.score ? Math.round(w.score.strain / 100) : Math.round((w.end - w.start) / 60000),
    strain: w.score?.strain?.toFixed(1),
    calories: w.score?.kilojoule ? Math.round(w.score.kilojoule * 0.239) : null,
    avg_hr: w.score?.average_heart_rate,
    notes: `Whoop · strain ${w.score?.strain?.toFixed(1) ?? '—'}`,
  }))
}

// Returns today's recovery
export async function fetchWhoopRecovery(date) {
  const start = `${date}T00:00:00.000Z`
  const end = `${date}T23:59:59.999Z`
  try {
    const data = await whoopFetch('/recovery', { start, end, limit: 1 })
    const r = data.records?.[0]
    if (!r) return null
    return {
      score: r.score?.recovery_score,
      hrv: r.score?.hrv_rmssd_milli ? Math.round(r.score.hrv_rmssd_milli) : null,
      rhr: r.score?.resting_heart_rate ? Math.round(r.score.resting_heart_rate) : null,
    }
  } catch { return null }
}

// Returns today's sleep
export async function fetchWhoopSleep(date) {
  const start = `${date}T00:00:00.000Z`
  const end = `${date}T23:59:59.999Z`
  try {
    const data = await whoopFetch('/activity/sleep', { start, end, limit: 1 })
    const s = data.records?.[0]
    if (!s) return null
    return {
      score: s.score?.sleep_performance_percentage,
      total_hours: s.score?.total_in_bed_time_milli
        ? (s.score.total_in_bed_time_milli / 3_600_000).toFixed(1)
        : null,
    }
  } catch { return null }
}
