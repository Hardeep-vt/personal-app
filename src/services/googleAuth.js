import { GOOGLE_CLIENT_ID, SCOPES } from '../config'

// Access tokens are kept in localStorage (not sessionStorage) so that closing and
// reopening the home-screen app reuses the existing token instead of forcing a new
// sign-in. Only the short-lived access token is ever stored — never a refresh token —
// so no long-lived credential to this Google account exists outside Google itself.
//
// Google's browser token model has no silent renewal: requestAccessToken() opens a
// popup, and a popup without a user gesture behind it is blocked by every browser.
// So once the token lapses, reconnecting needs one tap. `prompt: ''` below is what
// keeps that tap cheap — no account picker, no consent screen.
const TOKEN_KEY = 'gtoken'
const EXPIRY_KEY = 'gtoken_expiry'

// Treat a token as stale slightly before it really expires, so a request never goes
// out with a token that lapses mid-flight.
const EXPIRY_SKEW_MS = 2 * 60 * 1000

export function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = parseInt(localStorage.getItem(EXPIRY_KEY) || '0', 10)
  if (!token || Date.now() > expiry - EXPIRY_SKEW_MS) return null
  return token
}

function storeToken(res) {
  const lifetimeSec = parseInt(res.expires_in, 10) || 3600
  localStorage.setItem(TOKEN_KEY, res.access_token)
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + lifetimeSec * 1000))
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRY_KEY)
}

// True once the user has connected at least once on this device, so the reconnect
// screen can say "resume" rather than presenting itself as a first-time setup.
export function hasConnectedBefore() {
  return !!localStorage.getItem('spreadsheet_id') || !!localStorage.getItem(EXPIRY_KEY)
}

// The GIS script is loaded with async/defer, so it may not be ready when a tap lands.
export function waitForGoogle(timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return }
    const start = Date.now()
    const poll = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(poll)
        resolve()
      } else if (Date.now() - start > timeoutMs) {
        clearInterval(poll)
        reject(new Error('Google sign-in failed to load. Please refresh.'))
      }
    }, 100)
  })
}

let tokenClient = null

function getClient() {
  if (tokenClient) return tokenClient
  if (!window.google?.accounts?.oauth2) return null
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    // '' prompts only the first time access is granted. The default
    // ('select_account') would force an account picker on every reconnect.
    prompt: '',
    callback: () => {},
  })
  return tokenClient
}

let inFlight = null

// Must be called from a user gesture — the underlying popup is blocked otherwise.
export function requestToken() {
  if (inFlight) return inFlight

  const pending = new Promise((resolve, reject) => {
    const client = getClient()
    if (!client) {
      reject(new Error('Google sign-in not loaded yet. Please refresh.'))
      return
    }
    client.callback = (res) => {
      if (res.error) {
        reject(new Error(res.error_description || res.error))
        return
      }
      storeToken(res)
      resolve(res.access_token)
    }
    client.error_callback = (err) => {
      reject(new Error(err?.type === 'popup_closed'
        ? 'Sign-in was closed before it finished.'
        : (err?.type || 'Sign-in failed.')))
    }
    client.requestAccessToken()
  })

  inFlight = pending.finally(() => { inFlight = null })
  return inFlight
}

// Lets the data layer tell the app that the stored token is no longer usable, so the
// UI can drop to the reconnect screen instead of failing request after request.
let authLostHandler = null

export function setAuthLostHandler(fn) {
  authLostHandler = fn
}

export function notifyAuthLost() {
  clearToken()
  if (authLostHandler) authLostHandler()
}

export function revokeToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token)
  }
  clearToken()
  tokenClient = null
}
