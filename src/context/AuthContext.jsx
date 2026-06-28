import { useEffect, useState } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES, SPREADSHEET_NAME, SANDBOX_SPREADSHEET_NAME } from '../config'
import { getOrCreateSpreadsheet, maybeRunDailyBackup } from '../services/sheets'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const hasToken = !!sessionStorage.getItem('gtoken')
  const [status, setStatus] = useState(hasToken ? 'loading' : 'unauthenticated')
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [error, setError] = useState(null)
  const [sandboxMode, setSandboxMode] = useState(localStorage.getItem('sandbox_mode') === 'true')

  useEffect(() => {
    if (hasToken) initSpreadsheet(sandboxMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount only

  async function initSpreadsheet(useSandbox = sandboxMode) {
    try {
      setStatus('loading')
      const name = useSandbox ? SANDBOX_SPREADSHEET_NAME : SPREADSHEET_NAME
      const storageKey = useSandbox ? 'spreadsheet_id_sandbox' : 'spreadsheet_id'
      const id = await getOrCreateSpreadsheet(name, storageKey)
      setSpreadsheetId(id)
      setStatus('authenticated')
      if (!useSandbox) maybeRunDailyBackup(id, name)
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
