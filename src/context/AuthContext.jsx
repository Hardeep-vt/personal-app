import { useEffect, useState } from 'react'
import { SPREADSHEET_NAME, SANDBOX_SPREADSHEET_NAME } from '../config'
import { getOrCreateSpreadsheet, maybeRunDailyBackup } from '../services/sheets'
import {
  getStoredToken, requestToken, revokeToken, waitForGoogle,
  hasConnectedBefore, setAuthLostHandler,
} from '../services/googleAuth'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  // A stored token that is still valid means this launch needs no interaction at all,
  // so start in 'loading' only in that case and avoid a spinner otherwise.
  const [status, setStatus] = useState(() => (getStoredToken() ? 'loading' : 'unauthenticated'))
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [error, setError] = useState(null)
  const [sandboxMode, setSandboxMode] = useState(localStorage.getItem('sandbox_mode') === 'true')
  const returning = hasConnectedBefore()

  useEffect(() => {
    if (getStoredToken()) initSpreadsheet(sandboxMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentionally run once on mount only

  // If the data layer hits a 401 mid-session, drop straight to the reconnect screen.
  useEffect(() => {
    setAuthLostHandler(() => {
      setSpreadsheetId(null)
      setStatus('unauthenticated')
      setError('Your session expired. Tap reconnect to continue.')
    })
    return () => setAuthLostHandler(null)
  }, [])

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

  async function signIn() {
    setError(null)
    try {
      await waitForGoogle()
      await requestToken()
      await initSpreadsheet()
    } catch (e) {
      setError(e.message)
    }
  }

  function signOut() {
    revokeToken()
    localStorage.removeItem('spreadsheet_id')
    setSpreadsheetId(null)
    setStatus('unauthenticated')
  }

  return (
    <AuthContext.Provider value={{ status, spreadsheetId, signIn, signOut, error, sandboxMode, toggleSandbox, returning }}>
      {children}
    </AuthContext.Provider>
  )
}
