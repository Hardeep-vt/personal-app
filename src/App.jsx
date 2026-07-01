import { useState, useCallback, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { handleWhoopCallback } from './services/whoop'
import { useAuth } from './context/useAuth'
import FoodTab from './components/food/FoodTab'
import ExerciseTab from './components/exercise/ExerciseTab'
import LifeTab from './components/life/LifeTab'
import CalendarTab from './components/calendar/CalendarTab'
import usePullToRefresh from './hooks/usePullToRefresh'

const TABS = [
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'food', label: 'Food', icon: '🥗' },
  { id: 'exercise', label: 'Exercise', icon: '💪' },
  { id: 'life', label: 'Life', icon: '📋' },
]

function AppInner() {
  const { status, signIn, signOut, error, sandboxMode, toggleSandbox } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')

  // Handle redirect back from Whoop OAuth
  useEffect(() => {
    if (window.location.search.includes('code=')) {
      handleWhoopCallback().then(ok => {
        if (ok) setActiveTab('exercise')
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [calendarJumpDate, setCalendarJumpDate] = useState(null)

  const jumpToCalendar = useCallback((date) => {
    setCalendarJumpDate(date)
    setActiveTab('calendar')
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setRefreshKey(k => k + 1)
    setTimeout(() => setRefreshing(false), 600)
  }, [])

  usePullToRefresh(handleRefresh)

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Connecting…</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-6">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-semibold text-white mb-2">MyApp</h1>
          <p className="text-gray-400 text-sm">Your personal tracker — food, exercise, life & calendar</p>
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          onClick={signIn}
          className="flex items-center gap-3 bg-white text-gray-800 font-medium px-6 py-3 rounded-xl text-sm shadow-lg active:scale-95 transition-transform"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          Connect with Google
        </button>
        <p className="text-gray-600 text-xs text-center max-w-xs">
          Your data is stored only in your own Google Sheets. No third-party servers.
        </p>
      </div>
    )
  }

  const tabContent = {
    food: <FoodTab key={refreshKey} />,
    exercise: <ExerciseTab key={refreshKey} />,
    life: <LifeTab key={refreshKey} onJumpToCalendar={jumpToCalendar} />,
    calendar: <CalendarTab key={refreshKey} jumpDate={calendarJumpDate} onJumpHandled={() => setCalendarJumpDate(null)} />,
  }

  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-lg">MyApp</span>
          {sandboxMode && (
            <span className="bg-amber-500/20 text-amber-400 text-[10px] font-semibold px-1.5 py-0.5 rounded">SANDBOX</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (window.confirm(sandboxMode
                ? 'Switch back to your live data?'
                : 'Switch to a separate sandbox spreadsheet for testing? Your live data will not be touched.')) {
                toggleSandbox()
              }
            }}
            className={`text-xs px-1.5 py-0.5 rounded ${sandboxMode ? 'text-amber-400' : 'text-gray-500 active:text-gray-300'}`}
          >
            {sandboxMode ? 'Use live data' : 'Sandbox'}
          </button>
          <button
            onClick={handleRefresh}
            className={`text-gray-400 active:text-white text-lg transition-transform ${refreshing ? 'animate-spin' : ''}`}
          >
            ↻
          </button>
          <button onClick={signOut} className="text-gray-500 text-xs active:text-gray-300">
            Sign out
          </button>
        </div>
      </header>

      {refreshing && (
        <div className="flex justify-center py-1">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <main className="flex-1 overflow-y-auto overscroll-contain pb-24">
        {tabContent[activeTab]}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex safe-area-inset-bottom">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-sm transition-colors ${
              activeTab === tab.id ? 'text-indigo-400' : 'text-gray-500'
            }`}
          >
            <span className="text-3xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
