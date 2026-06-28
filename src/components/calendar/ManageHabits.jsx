import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, createRecurringTemplate, updateRecurringTemplate, softDeleteRow } from '../../services/sheets'
import { SHEETS, DAYS_OF_WEEK } from '../../config'

const EMPTY_FORM = { title: '', days_of_week: [], start_time: '07:00', end_time: '08:00', category: '' }

export default function ManageHabits({ templates, onClose, onChanged }) {
  const { spreadsheetId } = useAuth()
  const [editing, setEditing] = useState(null) // null | 'new' | template row
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function startNew() {
    setForm(EMPTY_FORM)
    setEditing('new')
  }

  function startEdit(tmpl) {
    setForm({
      title: tmpl.title,
      days_of_week: (tmpl.days_of_week || '').split(',').map(d => d.trim()).filter(Boolean),
      start_time: tmpl.start_time,
      end_time: tmpl.end_time,
      category: tmpl.category || '',
    })
    setEditing(tmpl)
  }

  function toggleDay(day) {
    setForm(f => ({
      ...f,
      days_of_week: f.days_of_week.includes(day) ? f.days_of_week.filter(d => d !== day) : [...f.days_of_week, day],
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (form.days_of_week.length === 0) return
    setSaving(true)
    try {
      if (editing === 'new') {
        await createRecurringTemplate(spreadsheetId, form)
      } else {
        const all = await getRows(spreadsheetId, SHEETS.RECURRING_TEMPLATES)
        const idx = all.findIndex(r => r.id === editing.id)
        if (idx !== -1) await updateRecurringTemplate(spreadsheetId, idx, { ...editing, ...form, active: editing.active !== 'false' })
      }
      setEditing(null)
      await onChanged()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(tmpl) {
    if (!window.confirm(`Delete habit "${tmpl.title}"?`)) return
    try {
      const all = await getRows(spreadsheetId, SHEETS.RECURRING_TEMPLATES)
      const idx = all.findIndex(r => r.id === tmpl.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.RECURRING_TEMPLATES, idx, all[idx])
      await onChanged()
    } catch (e) { console.error(e) }
  }

  async function toggleActive(tmpl) {
    try {
      const all = await getRows(spreadsheetId, SHEETS.RECURRING_TEMPLATES)
      const idx = all.findIndex(r => r.id === tmpl.id)
      if (idx !== -1) await updateRecurringTemplate(spreadsheetId, idx, { ...tmpl, active: tmpl.active === 'false' })
      await onChanged()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={onClose} className="text-gray-400 text-sm active:text-white">← Back</button>
        <span className="text-white font-semibold text-base">Manage Habits</span>
        <div className="w-12" />
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="px-4 py-4 space-y-3 overflow-y-auto">
          <input
            required placeholder="Habit name (e.g. Morning jog)"
            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
          />
          <div>
            <p className="text-gray-500 text-xs mb-1.5">Days</p>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day} type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.days_of_week.includes(day) ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-gray-500 text-xs mb-1">Start time</p>
              <input
                type="time" required value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              />
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">End time</p>
              <input
                type="time" required value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              />
            </div>
          </div>
          <input
            placeholder="Category (optional, e.g. Health, Work)"
            value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-emerald-500"
          />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          {templates.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-12">No habits yet. Tap + to add one, e.g. "5am wake", "Jog/gym", "Work hours".</p>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id} className={`bg-gray-800 rounded-xl px-4 py-3 ${t.active === 'false' ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => startEdit(t)} className="text-left flex-1 min-w-0">
                      <div className="text-white text-sm font-medium">{t.title}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {t.days_of_week} · {t.start_time}–{t.end_time}{t.category ? ` · ${t.category}` : ''}
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleActive(t)} className="text-gray-400 text-xs active:text-white">
                        {t.active === 'false' ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => handleDelete(t)} className="text-gray-600 active:text-red-400 text-base">🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!editing && (
        <button
          onClick={startNew}
          className="fixed bottom-6 right-4 w-12 h-12 bg-emerald-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
      )}
    </div>
  )
}
