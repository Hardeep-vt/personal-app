import { createContext, useContext, useEffect, useState } from 'react'
import { GOOGLE_CLIENT_ID, SCOPES, SPREADSHEET_NAME } from '../config'
import { getOrCreateSpreadsheet } from '../services/sheets'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading') // loading | unauthenticated | authenticated
  const [spreadsheetId, setSpreadsheetId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const existing = sessionStorage.getItem('gtoken')
    if (existing) {
      initSpreadsheet()
    } else {
      setStatus('unauthenticated')
    }
  }, [])

  async function initSpreadsheet() {
    try {
      setStatus('loading')
      const id = await getOrCreateSpreadsheet(SPREADSHEET_NAME)
      setSpreadsheetId(id)
      setStatus('authenticated')
    } catch (e) {
      setError(e.message)
      setStatus('unauthenticated')
    }
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
    <AuthContext.Provider value={{ status, spreadsheetId, signIn, signOut, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
