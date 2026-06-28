import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, appendRow, deleteRow } from '../../services/sheets'
import { SHEETS } from '../../config'

const EXERCISE_TYPES = ['Weights', 'Cardio', 'Yoga', 'Sports', 'Walk/Run', 'Other']

function today() {
  return new Date().toISOString().split('T')[0]
}

function uid() {
  return Date.now().toString(36)
}

export default function ExerciseTab() {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercise_type: 'Weights', duration_min: '', sets: '', reps: '', weight_kg: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getRows(spreadsheetId, SHEETS.EXERCISE)
      setRows(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return
    try {
      const allRows = await getRows(spreadsheetId, SHEETS.EXERCISE)
      const idx = allRows.findIndex(r => r.id === id)
      if (idx !== -1) await deleteRow(spreadsheetId, SHEETS.EXERCISE, idx)
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (e) { console.error(e) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const row = [uid(), selectedDate, form.exercise_type, form.duration_min, form.sets, form.reps, form.weight_kg, form.notes]
      await appendRow(spreadsheetId, SHEETS.EXERCISE, row)
      await load()
      setForm({ exercise_type: 'Weights', duration_min: '', sets: '', reps: '', weight_kg: '', notes: '' })
      setShowForm(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const todayRows = rows.filter(r => r.date === selectedDate)
  const totalMinutes = todayRows.reduce((s, r) => s + (parseFloat(r.duration_min) || 0), 0)

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <input
          type="date" value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700"
        />
        <div className="text-right">
          <div className="text-2xl font-bold text-emerald-400">{totalMinutes}</div>
          <div className="text-gray-500 text-xs">min today</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : todayRows.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">No workouts logged for this day</p>
      ) : (
        <div className="space-y-2">
          {todayRows.map(r => (
            <div key={r.id} className="bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">{r.exercise_type}</span>
                <div className="flex items-center gap-2">
                  {r.duration_min && <span className="text-emerald-400 text-sm">{r.duration_min} min</span>}
                  <button onClick={() => handleDelete(r.id)} className="text-gray-600 active:text-red-400 text-base px-1">🗑</button>
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-gray-400 text-xs">
                {r.sets && <span>{r.sets} sets</span>}
                {r.reps && <span>{r.reps} reps</span>}
                {r.weight_kg && <span>{r.weight_kg} kg</span>}
                {r.notes && <span className="text-gray-500">{r.notes}</span>}
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
            <h2 className="text-white font-semibold text-base mb-1">Log Workout</h2>
            <div className="flex gap-2 flex-wrap">
              {EXERCISE_TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, exercise_type: t }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.exercise_type === t ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Duration (min)" type="number"
                value={form.duration_min} onChange={e => setForm(f => ({ ...f, duration_min: e.target.value }))}
                className="bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Weight (kg)" type="number"
                value={form.weight_kg} onChange={e => setForm(f => ({ ...f, weight_kg: e.target.value }))}
                className="bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Sets" type="number"
                value={form.sets} onChange={e => setForm(f => ({ ...f, sets: e.target.value }))}
                className="bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
              />
              <input
                placeholder="Reps" type="number"
                value={form.reps} onChange={e => setForm(f => ({ ...f, reps: e.target.value }))}
                className="bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
              />
            </div>
            <input
              placeholder="Notes (optional)"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
            />
            <button
              type="submit" disabled={saving}
              className="w-full bg-emerald-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Workout'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-emerald-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
