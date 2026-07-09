import { useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, createJournalMetric, updateJournalMetric, softDeleteRow } from '../../services/sheets'
import { SHEETS } from '../../config'
import { METRIC_TYPES, METRIC_TYPE_LABELS, sortMetrics } from './metricTypes'

const EMPTY_FORM = { name: '', type: 'number', unit: '' }

export default function ManageJournalMetrics({ metrics, onClose, onChanged }) {
  const { spreadsheetId } = useAuth()
  const [editing, setEditing] = useState(null) // null | 'new' | metric row
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function startNew() {
    setForm(EMPTY_FORM)
    setEditing('new')
  }

  function startEdit(metric) {
    setForm({ name: metric.name, type: metric.type, unit: metric.unit || '' })
    setEditing(metric)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing === 'new') {
        const maxOrder = metrics.reduce((max, m) => Math.max(max, Number(m.sort_order) || 0), 0)
        await createJournalMetric(spreadsheetId, { ...form, sort_order: maxOrder + 1 })
      } else {
        const all = await getRows(spreadsheetId, SHEETS.JOURNAL_METRICS)
        const idx = all.findIndex(r => r.id === editing.id)
        if (idx !== -1) await updateJournalMetric(spreadsheetId, idx, { ...editing, ...form, active: editing.active !== 'false' })
      }
      setEditing(null)
      await onChanged()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(metric) {
    if (!window.confirm(`Delete tracker "${metric.name}"? Past entries for it will remain in trash.`)) return
    try {
      const all = await getRows(spreadsheetId, SHEETS.JOURNAL_METRICS)
      const idx = all.findIndex(r => r.id === metric.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.JOURNAL_METRICS, idx, all[idx])
      await onChanged()
    } catch (e) { console.error(e) }
  }

  async function toggleActive(metric) {
    try {
      const all = await getRows(spreadsheetId, SHEETS.JOURNAL_METRICS)
      const idx = all.findIndex(r => r.id === metric.id)
      if (idx !== -1) await updateJournalMetric(spreadsheetId, idx, { ...metric, active: metric.active === 'false' })
      await onChanged()
    } catch (e) { console.error(e) }
  }

  const sorted = sortMetrics(metrics)

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <button onClick={onClose} className="text-gray-400 text-sm active:text-white">← Back</button>
        <span className="text-white font-semibold text-base">Manage Journal Trackers</span>
        <div className="w-12" />
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="px-4 py-4 space-y-3 overflow-y-auto">
          <input
            required placeholder="Tracker name (e.g. Phone pickups)"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-teal-500"
          />
          <div>
            <p className="text-gray-500 text-xs mb-1.5">Type</p>
            <div className="grid grid-cols-2 gap-1.5">
              {METRIC_TYPES.map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${form.type === t ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >
                  {METRIC_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          {form.type === 'number' && (
            <input
              placeholder="Unit (optional, e.g. min, times)"
              value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-teal-500"
            />
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-gray-800 text-gray-300 py-2.5 rounded-xl text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <div className="px-4 py-4 flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-12">
              No trackers yet. Tap + to add one, e.g. "Social media (min)", "Phone pickups", "Today's notes".
            </p>
          ) : (
            <div className="space-y-2">
              {sorted.map(m => (
                <div key={m.id} className={`bg-gray-800 rounded-xl px-4 py-3 ${m.active === 'false' ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <button onClick={() => startEdit(m)} className="text-left flex-1 min-w-0">
                      <span className="text-white text-sm font-medium">{m.name}</span>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {METRIC_TYPE_LABELS[m.type] || m.type}{m.unit ? ` · ${m.unit}` : ''}
                      </div>
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleActive(m)} className="text-gray-400 text-xs active:text-white">
                        {m.active === 'false' ? 'Enable' : 'Disable'}
                      </button>
                      <button onClick={() => handleDelete(m)} className="text-gray-600 active:text-red-400 text-base">🗑</button>
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
          className="fixed bottom-6 right-4 w-12 h-12 bg-teal-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
      )}
    </div>
  )
}
