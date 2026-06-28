import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/useAuth'
import {
  getRows, createCalendarEvent, updateCalendarEvent, softDeleteRow,
  setCalendarEventStatus, markHabitDone, unmarkHabitDone, expandRecurringOccurrences,
} from '../../services/sheets'
import { SHEETS } from '../../config'
import ManageHabits from './ManageHabits'
import { CATEGORIES, CATEGORY_DOT, tileColorFor, DONE_COLOR } from './categories'
import { todayStr, addDays, weekDates, timeToMinutes, formatTimeLabel, formatTimeRange, formatDayLabel, layoutTiles } from './dateUtils'

const HOUR_HEIGHT = 60
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const EMPTY_EVENT_FORM = { title: '', start_time: '09:00', end_time: '10:00', category: '', description: '' }

export default function CalendarTab({ jumpDate, onJumpHandled }) {
  const { spreadsheetId } = useAuth()
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [events, setEvents] = useState([])
  const [templates, setTemplates] = useState([])
  const [completions, setCompletions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showManage, setShowManage] = useState(false)
  const [manageInitialId, setManageInitialId] = useState(null)
  const [formOpen, setFormOpen] = useState(null) // null | 'new' | event row
  const [form, setForm] = useState(EMPTY_EVENT_FORM)
  const [saving, setSaving] = useState(false)
  const [habitDetail, setHabitDetail] = useState(null) // occurrence object being viewed
  const [appliedJumpDate, setAppliedJumpDate] = useState(null)
  const scrollRef = useRef(null)

  // Adjust selectedDate during render when a new jumpDate prop arrives, rather than in an
  // effect — this is React's recommended pattern for "adjusting state when a prop changes".
  if (jumpDate && jumpDate !== appliedJumpDate) {
    setAppliedJumpDate(jumpDate)
    setSelectedDate(jumpDate)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const [ev, tmpl, comp] = await Promise.all([
        getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS),
        getRows(spreadsheetId, SHEETS.RECURRING_TEMPLATES),
        getRows(spreadsheetId, SHEETS.HABIT_COMPLETIONS),
      ])
      setEvents(ev)
      setTemplates(tmpl)
      setCompletions(comp)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    if (jumpDate) onJumpHandled?.()
  }, [jumpDate, onJumpHandled])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = Math.max(0, 5 * HOUR_HEIGHT - 40)
  }, [loading])

  const dayEvents = events.filter(e => e.date === selectedDate)
  const dayOccurrences = expandRecurringOccurrences(templates, completions, selectedDate, selectedDate)
  const week = weekDates(selectedDate)

  const tiles = layoutTiles([
    ...dayOccurrences.map(occ => ({
      key: `${occ.templateId}-${occ.date}`, title: occ.title, start_time: occ.start_time, end_time: occ.end_time,
      done: occ.done, category: occ.category, isHabit: true,
      onToggleDone: () => toggleOccurrenceDone(occ), onClick: () => setHabitDetail(occ),
    })),
    ...dayEvents.map(ev => ({
      key: ev.id, title: ev.title, start_time: ev.start_time, end_time: ev.end_time,
      done: ev.status === 'done', category: ev.category, isHabit: false,
      onToggleDone: () => toggleEventDone(ev), onClick: () => openEditForm(ev),
    })),
  ])

  function openNewForm() {
    setForm(EMPTY_EVENT_FORM)
    setFormOpen('new')
  }

  function openEditForm(ev) {
    setForm({ title: ev.title, start_time: ev.start_time, end_time: ev.end_time, category: ev.category || '', description: ev.description || '' })
    setFormOpen(ev)
  }

  async function handleSaveForm(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (formOpen === 'new') {
        await createCalendarEvent(spreadsheetId, { ...form, date: selectedDate })
      } else {
        const all = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
        const idx = all.findIndex(r => r.id === formOpen.id)
        if (idx !== -1) await updateCalendarEvent(spreadsheetId, idx, { ...formOpen, ...form })
      }
      setFormOpen(null)
      await load()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeleteEvent() {
    if (!formOpen || formOpen === 'new') return
    if (!window.confirm('Delete this event?')) return
    try {
      const all = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
      const idx = all.findIndex(r => r.id === formOpen.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.CALENDAR_EVENTS, idx, all[idx])
      setFormOpen(null)
      await load()
    } catch (e) { console.error(e) }
  }

  async function toggleEventDone(ev) {
    try {
      const all = await getRows(spreadsheetId, SHEETS.CALENDAR_EVENTS)
      const idx = all.findIndex(r => r.id === ev.id)
      if (idx !== -1) await setCalendarEventStatus(spreadsheetId, idx, all[idx], ev.status === 'done' ? 'pending' : 'done')
      await load()
    } catch (e) { console.error(e) }
  }

  async function toggleOccurrenceDone(occ) {
    try {
      if (occ.done) await unmarkHabitDone(spreadsheetId, occ.templateId, occ.date)
      else await markHabitDone(spreadsheetId, occ.templateId, occ.date)
      await load()
    } catch (e) { console.error(e) }
  }

  function openManageFromHabitDetail() {
    setManageInitialId(habitDetail.templateId)
    setHabitDetail(null)
    setShowManage(true)
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectedDate(addDays(selectedDate, -7))} className="text-gray-400 active:text-white px-1">‹</button>
          <span className="text-white text-sm font-medium">{formatDayLabel(selectedDate)}</span>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 7))} className="text-gray-400 active:text-white px-1">›</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedDate(todayStr())} className="text-indigo-400 text-xs font-medium">Today</button>
          <button onClick={() => { setManageInitialId(null); setShowManage(true) }} className="text-gray-400 text-xs">⚙ Habits</button>
        </div>
      </div>

      <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
        {week.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDate(d)}
            className={`shrink-0 w-11 py-1.5 rounded-xl text-center transition-colors ${
              d === selectedDate ? 'bg-indigo-600 text-white' : d === todayStr() ? 'bg-gray-800 text-indigo-400' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <div className="text-[10px]">{new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })}</div>
            <div className="text-sm font-medium">{new Date(d + 'T00:00:00').getDate()}</div>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={scrollRef} className="overflow-y-auto px-4" style={{ maxHeight: 'calc(100svh - 280px)' }}>
          <div className="relative" style={{ height: 24 * HOUR_HEIGHT }}>
            {HOURS.map(h => (
              <div key={h} className="absolute left-0 right-0 border-t border-gray-800 text-gray-600 text-[10px]" style={{ top: h * HOUR_HEIGHT }}>
                <span className="absolute -top-2 -left-0">{formatTimeLabel(h)}</span>
              </div>
            ))}
            <div className="absolute left-10 right-0 top-0 bottom-0">
              {tiles.map(t => (
                <Tile
                  key={t.key}
                  title={t.title}
                  start={t.start_time}
                  end={t.end_time}
                  done={t.done}
                  category={t.category}
                  onToggleDone={t.onToggleDone}
                  onClick={t.onClick}
                  col={t._col}
                  cols={t._cols}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={openNewForm}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>

      {formOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setFormOpen(null)}>
          <form onSubmit={handleSaveForm} onClick={e => e.stopPropagation()} className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto">
            <h2 className="text-white font-semibold text-base mb-1">{formOpen === 'new' ? 'New Event' : 'Edit Event'}</h2>
            <input
              required placeholder="Title"
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-gray-500 text-xs mb-1">Start time</p>
                <input type="time" required value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700" />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">End time</p>
                <input type="time" required value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700" />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Category</p>
              <div className="flex gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat} type="button"
                    onClick={() => setForm(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.category === cat ? 'bg-gray-700 text-white ring-1 ring-white/30' : 'bg-gray-800 text-gray-400'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${CATEGORY_DOT[cat]}`} />
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500 resize-none"
            />
            {formOpen !== 'new' && formOpen.todo_id && (
              <p className="text-gray-500 text-xs">Linked to a todo — manage the link from the Todos tab.</p>
            )}
            <div className="flex gap-2 pt-1">
              {formOpen !== 'new' && (
                <button type="button" onClick={handleDeleteEvent} className="px-4 bg-gray-800 text-red-400 rounded-xl text-sm font-medium">
                  Delete
                </button>
              )}
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {habitDetail && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setHabitDetail(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              {habitDetail.category && <span className={`w-2 h-2 rounded-full ${CATEGORY_DOT[habitDetail.category] || 'bg-gray-500'}`} />}
              <h2 className="text-white font-semibold text-base">{habitDetail.title}</h2>
            </div>
            <p className="text-gray-400 text-sm">
              {formatTimeRange(habitDetail.start_time, habitDetail.end_time)}
              {habitDetail.category ? ` · ${habitDetail.category}` : ''}
              {habitDetail.done ? ' · Done ✓' : ''}
            </p>
            {habitDetail.description && <p className="text-gray-300 text-sm leading-relaxed">{habitDetail.description}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setHabitDetail(null)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
                Close
              </button>
              <button onClick={openManageFromHabitDetail} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium">
                Edit habit
              </button>
            </div>
          </div>
        </div>
      )}

      {showManage && (
        <ManageHabits templates={templates} initialEditTemplateId={manageInitialId} onClose={() => setShowManage(false)} onChanged={load} />
      )}
    </div>
  )
}

function Tile({ title, start, end, done, category, onToggleDone, onClick, col = 0, cols = 1 }) {
  const top = timeToMinutes(start)
  const height = Math.max(timeToMinutes(end) - timeToMinutes(start), 16)
  const compact = height < 34
  const widthPct = 100 / cols
  const colors = done ? DONE_COLOR : tileColorFor(category)

  return (
    <div
      onClick={onClick}
      className={`absolute rounded-lg overflow-hidden flex ${compact ? 'items-center px-1.5 py-0' : 'items-start justify-between gap-1 px-2 py-1'} ${colors} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ top, height, left: `${col * widthPct}%`, width: `calc(${widthPct}% - 4px)` }}
    >
      {compact ? (
        <div className="flex items-center justify-between gap-1 w-full">
          <span className="text-[10px] font-medium truncate">{title}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDone() }}
            className={`shrink-0 w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${done ? 'bg-white/30 border-white' : 'border-white/50'}`}
          >
            {done ? '✓' : ''}
          </button>
        </div>
      ) : (
        <>
          <div className="min-w-0">
            <div className="text-xs font-medium truncate leading-tight">{title}</div>
            <div className="text-[10px] opacity-80 leading-tight truncate">{formatTimeRange(start, end)}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleDone() }}
            className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${done ? 'bg-white/20 border-white' : 'border-white/50'}`}
          >
            {done ? '✓' : ''}
          </button>
        </>
      )}
    </div>
  )
}
