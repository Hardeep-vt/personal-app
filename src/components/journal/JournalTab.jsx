import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, setJournalEntry } from '../../services/sheets'
import { SHEETS } from '../../config'
import { todayStr, addDays, formatDayLabel } from '../calendar/dateUtils'
import ManageJournalMetrics from './ManageJournalMetrics'
import { sortMetrics } from './metricTypes'

const SCALE_VALUES = ['1', '2', '3', '4', '5']

export default function JournalTab() {
  const { spreadsheetId } = useAuth()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [metrics, setMetrics] = useState([])
  const [entries, setEntries] = useState([])
  const [edits, setEdits] = useState({})
  const [appliedDate, setAppliedDate] = useState(todayStr())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showManage, setShowManage] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  // Reset in-progress edits when the selected date changes, adjusted during render
  // (React's recommended pattern) rather than in an effect.
  if (selectedDate !== appliedDate) {
    setAppliedDate(selectedDate)
    setEdits({})
    setSaved(false)
  }

  const savedValues = Object.fromEntries(
    entries.filter(e => e.date === selectedDate).map(e => [e.metric_id, e.value])
  )
  const values = { ...savedValues, ...edits }

  async function load() {
    setLoading(true)
    try {
      const [m, e] = await Promise.all([
        getRows(spreadsheetId, SHEETS.JOURNAL_METRICS),
        getRows(spreadsheetId, SHEETS.JOURNAL_ENTRIES),
      ])
      setMetrics(m)
      setEntries(e)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const activeMetrics = sortMetrics(metrics.filter(m => m.active !== 'false'))

  function setValue(metricId, value) {
    setEdits(v => ({ ...v, [metricId]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const m of activeMetrics) {
        await setJournalEntry(spreadsheetId, m.id, selectedDate, values[m.id] ?? '')
      }
      const e = await getRows(spreadsheetId, SHEETS.JOURNAL_ENTRIES)
      setEntries(e)
      setSaved(true)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div className="flex flex-col px-4 py-4 pb-28">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} className="text-gray-400 active:text-white px-1">‹</button>
          <span className="text-white text-sm font-medium">{formatDayLabel(selectedDate)}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} className="text-gray-400 active:text-white px-1">›</button>
        </div>
        <div className="flex items-center gap-3">
          {selectedDate !== todayStr() && (
            <button onClick={() => setSelectedDate(todayStr())} className="text-teal-400 text-xs font-medium">Today</button>
          )}
          <button onClick={() => setShowManage(true)} className="text-gray-400 text-xs">⚙ Trackers</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeMetrics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-sm mb-3">
            No trackers set up yet. Add ones like "Social media (min)", "Phone pickups", or "Today's notes".
          </p>
          <button onClick={() => setShowManage(true)} className="text-teal-400 text-sm font-medium">
            + Add a tracker
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {activeMetrics.map(m => (
            <div key={m.id} className="bg-gray-800 rounded-xl px-4 py-3">
              <p className="text-white text-sm font-medium mb-2">{m.name}</p>
              <MetricInput metric={m} value={values[m.id] ?? ''} onChange={v => setValue(m.id, v)} />
            </div>
          ))}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 mt-1"
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      )}

      {showManage && (
        <ManageJournalMetrics metrics={metrics} onClose={() => setShowManage(false)} onChanged={load} />
      )}
    </div>
  )
}

function MetricInput({ metric, value, onChange }) {
  if (metric.type === 'boolean') {
    return (
      <div className="flex gap-2">
        <button
          type="button" onClick={() => onChange(value === 'yes' ? '' : 'yes')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${value === 'yes' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
          Yes
        </button>
        <button
          type="button" onClick={() => onChange(value === 'no' ? '' : 'no')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${value === 'no' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400'}`}
        >
          No
        </button>
      </div>
    )
  }

  if (metric.type === 'scale') {
    return (
      <div className="flex gap-1.5">
        {SCALE_VALUES.map(n => (
          <button
            key={n} type="button" onClick={() => onChange(value === n ? '' : n)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${value === n ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400'}`}
          >
            {n}
          </button>
        ))}
      </div>
    )
  }

  if (metric.type === 'text') {
    return (
      <textarea
        value={value} onChange={e => onChange(e.target.value)}
        rows={3} placeholder="Write something…"
        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500 resize-none"
      />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)}
        placeholder="0"
        className="flex-1 bg-gray-700 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-teal-500"
      />
      {metric.unit && <span className="text-gray-500 text-xs shrink-0">{metric.unit}</span>}
    </div>
  )
}
