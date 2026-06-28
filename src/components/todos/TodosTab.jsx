import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, appendRow, updateRow, softDeleteRow, createCalendarEvent } from '../../services/sheets'
import { SHEETS } from '../../config'
import { todayStr } from '../calendar/dateUtils'

function uid() { return Date.now().toString(36) }
function now() { return new Date().toISOString() }

const HORIZONS = ['Short-term', 'Long-term']
const CONTEXTS = ['Personal', 'Professional']
const PRIORITIES = ['High', 'Medium', 'Low']

export default function TodosTab({ onJumpToCalendar }) {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', horizon: 'Short-term', context: 'Personal', priority: 'Medium', due_date: '' })
  const [saving, setSaving] = useState(false)
  const [filterHorizon, setFilterHorizon] = useState('All')
  const [filterContext, setFilterContext] = useState('All')
  const [showDone, setShowDone] = useState(false)
  const [scheduling, setScheduling] = useState(null) // todo row being scheduled
  const [scheduleForm, setScheduleForm] = useState({ date: todayStr(), start_time: '09:00', end_time: '10:00' })
  const [schedSaving, setSchedSaving] = useState(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [data, events] = await Promise.all([
        getRows(spreadsheetId, SHEETS.TODOS),
        getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS),
      ])
      setRows(data)
      setCalendarEvents(events)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function sessionsFor(todoId) {
    return calendarEvents.filter(e => e.todo_id === todoId)
  }

  function openSchedule(todo) {
    setScheduleForm({ date: todayStr(), start_time: '09:00', end_time: '10:00' })
    setScheduling(todo)
  }

  async function handleAddSession(e) {
    e.preventDefault()
    setSchedSaving(true)
    try {
      await createCalendarEvent(spreadsheetId, { title: scheduling.title, ...scheduleForm, todo_id: scheduling.id })
      const events = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
      setCalendarEvents(events)
    } catch (e) { console.error(e) }
    setSchedSaving(false)
  }

  async function handleUnlinkSession(ev) {
    try {
      const all = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
      const idx = all.findIndex(r => r.id === ev.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.CALENDAR_EVENTS, idx, all[idx])
      const events = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
      setCalendarEvents(events)
    } catch (e) { console.error(e) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const row = [uid(), form.title, form.description, form.horizon, form.context, form.priority, form.due_date, 'active', now()]
      await appendRow(spreadsheetId, SHEETS.TODOS, row)
      await load()
      setForm({ title: '', description: '', horizon: 'Short-term', context: 'Personal', priority: 'Medium', due_date: '' })
      setShowForm(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this todo?')) return
    try {
      const allRows = await getRows(spreadsheetId, SHEETS.TODOS)
      const idx = allRows.findIndex(r => r.id === id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.TODOS, idx, allRows[idx])
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (e) { console.error(e) }
  }

  async function toggleDone(todo) {
    const newStatus = todo.status === 'done' ? 'active' : 'done'
    try {
      const allRows = await getRows(spreadsheetId, SHEETS.TODOS)
      const sheetIdx = allRows.findIndex(r => r.id === todo.id)
      if (sheetIdx !== -1) {
        const r = allRows[sheetIdx]
        await updateRow(spreadsheetId, SHEETS.TODOS, sheetIdx, [r.id, r.title, r.description, r.horizon, r.context, r.priority, r.due_date, newStatus, r.created_at])
      }
      setRows(prev => prev.map(r => r.id === todo.id ? { ...r, status: newStatus } : r))
    } catch (e) { console.error(e) }
  }

  const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

  const filtered = rows
    .filter(r => {
      if (!showDone && r.status === 'done') return false
      if (showDone && r.status !== 'done') return false
      if (filterHorizon !== 'All' && r.horizon !== filterHorizon) return false
      if (filterContext !== 'All' && r.context !== filterContext) return false
      return true
    })
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))

  const activeCounts = rows.filter(r => r.status !== 'done').length
  const doneCounts = rows.filter(r => r.status === 'done').length

  const priorityColor = { High: 'text-red-400', Medium: 'text-amber-400', Low: 'text-gray-500' }
  const priorityDot = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-gray-600' }

  return (
    <div className="px-4 py-4">
      {/* Active / Done toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowDone(false)}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${!showDone ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Active ({activeCounts})
        </button>
        <button
          onClick={() => setShowDone(true)}
          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${showDone ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'}`}
        >
          Done ({doneCounts})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {['All', ...HORIZONS].map(h => (
          <button
            key={h}
            onClick={() => setFilterHorizon(h)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterHorizon === h ? 'bg-sky-700 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {h}
          </button>
        ))}
        <div className="w-px bg-gray-700 mx-1" />
        {['All', ...CONTEXTS].map(c => (
          <button
            key={c}
            onClick={() => setFilterContext(c)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterContext === c ? 'bg-sky-700 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">
          {showDone ? 'No completed todos.' : 'No todos. Tap + to add one.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div
              key={r.id}
              className={`flex items-start gap-3 bg-gray-800 rounded-xl px-4 py-3 ${r.status === 'done' ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => toggleDone(r)}
                className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  r.status === 'done' ? 'bg-sky-600 border-sky-600' : 'border-gray-600'
                }`}
              >
                {r.status === 'done' && <span className="text-white text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${r.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                  {r.title}
                </div>
                {r.description && <div className="text-gray-500 text-xs mt-0.5">{r.description}</div>}
                <div className="flex gap-2 mt-1.5 flex-wrap">
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{r.horizon}</span>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{r.context}</span>
                  {r.due_date && <span className="text-gray-500 text-xs">{r.due_date}</span>}
                </div>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${priorityColor[r.priority]}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[r.priority]}`} />
                    <span className="text-xs">{r.priority}</span>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="text-gray-600 active:text-red-400 text-base px-1">🗑</button>
                </div>
                <button
                  onClick={() => openSchedule(r)}
                  className="text-[11px] font-medium text-indigo-400 active:text-indigo-300"
                >
                  {sessionsFor(r.id).length > 0 ? `🗓 ${sessionsFor(r.id).length} session${sessionsFor(r.id).length > 1 ? 's' : ''}` : '🗓 Schedule'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleAdd}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3"
          >
            <h2 className="text-white font-semibold text-base mb-1">New Todo</h2>
            <input
              required placeholder="What needs to be done?"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-sky-500"
            />
            <input
              placeholder="Description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-sky-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 text-xs mb-1">Horizon</p>
                <div className="flex flex-col gap-1">
                  {HORIZONS.map(h => (
                    <button key={h} type="button"
                      onClick={() => setForm(f => ({ ...f, horizon: h }))}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${form.horizon === h ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >{h}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Context</p>
                <div className="flex flex-col gap-1">
                  {CONTEXTS.map(c => (
                    <button key={c} type="button"
                      onClick={() => setForm(f => ({ ...f, context: c }))}
                      className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${form.context === c ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">Priority</p>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.priority === p ? 'bg-sky-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >{p}</button>
                ))}
              </div>
            </div>
            <input
              type="date" placeholder="Due date (optional)"
              value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
            />
            <button
              type="submit" disabled={saving}
              className="w-full bg-sky-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Todo'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-sky-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>

      {scheduling && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setScheduling(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3">
            <h2 className="text-white font-semibold text-base mb-1">Schedule "{scheduling.title}"</h2>

            {sessionsFor(scheduling.id).length > 0 && (
              <div className="space-y-1.5">
                {sessionsFor(scheduling.id).map(ev => (
                  <div key={ev.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                    <button onClick={() => onJumpToCalendar?.(ev.date)} className="text-left text-sm text-gray-200">
                      {ev.date} · {ev.start_time}–{ev.end_time}
                      {ev.status === 'done' && <span className="text-emerald-400 ml-1">✓</span>}
                    </button>
                    <button onClick={() => handleUnlinkSession(ev)} className="text-gray-600 active:text-red-400 text-sm px-1">✕</button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddSession} className="space-y-2 pt-1">
              <input
                type="date" required value={scheduleForm.date}
                onChange={e => setScheduleForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time" required value={scheduleForm.start_time}
                  onChange={e => setScheduleForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
                />
                <input
                  type="time" required value={scheduleForm.end_time}
                  onChange={e => setScheduleForm(f => ({ ...f, end_time: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
                />
              </div>
              <button
                type="submit" disabled={schedSaving}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                {schedSaving ? 'Adding…' : 'Add session'}
              </button>
            </form>
            <button onClick={() => setScheduling(null)} className="w-full text-gray-500 text-xs py-1">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
