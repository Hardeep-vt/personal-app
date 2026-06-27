import { createContext, useContext, useEffect, useState } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES, SPREADSHEET_NAME, SANDBOX_SPREADSHEET_NAME } from '../config'
import { getOrCreateSpreadsheet } from '../services/sheets'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | unauthenticated | authenticated
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [error, setError] = useState(null)
  const [sandboxMode, setSandboxMode] = useState(localStorage.getItem('sandbox_mode') === 'true')

  useEffect(() => {
    const existing = sessionStorage.getItem('gtoken')
    if (existing) {
      initSpreadsheet(sandboxMode)
    } else {
      setStatus('unauthenticated')
    }
  }, [])

  async function initSpreadsheet(useSandbox = sandboxMode) {
    try {
      setStatus('loading')
      const name = useSandbox ? SANDBOX_SPREADSHEET_NAME : SPREADSHEET_NAME
      const storageKey = useSandbox ? 'spreadsheet_id_sandbox' : 'spreadsheet_id'
      const id = await getOrCreateSpreadsheet(name, storageKey)
      setSpreadsheetId(id)
      setStatus('authenticated')
    } catch (e) {
      setError(e.message)
      setStatus('unauthenticated')
    }
  }

  async function toggleSandbox() {
    const next = !sandboxMode
    localStorage.setItem('sandbox_mode', String(next))
    setSandboxMode(next)
    await initSpreadsheet(next)
  }

  function signIn() {
    if (!window.google) {
      setError('Google sign-in not loaded yet. Please refresh.')
      return
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) {
          setError(response.error)
          return
        }
        sessionStorage.setItem('gtoken', response.access_token)
        await initSpreadsheet()
      },
    })
    client.requestAccessToken()
  }

  function signOut() {
    const token = sessionStorage.getItem('gtoken')
    if (token && window.google) {
      window.google.accounts.oauth2.revoke(token)
    }
    sessionStorage.removeItem('gtoken')
    localStorage.removeItem('spreadsheet_id')
    setSpreadsheetId(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ status, spreadsheetId, signIn, signOut, error, sandboxMode, toggleSandbox }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
