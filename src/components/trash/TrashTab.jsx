import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTrash, restoreTrashRow, purgeTrashRow, purgeOldTrash } from '../../services/sheets'

const LABELS = { notes: 'Note', todos: 'Todo', people: 'Person' }

function describe(trashRow) {
  try {
    const data = JSON.parse(trashRow.data)
    return data.title || data.name || data.id || 'item'
  } catch {
    return 'item'
  }
}

export default function TrashTab() {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      await purgeOldTrash(spreadsheetId)
      const data = await getTrash(spreadsheetId)
      setRows(data.reverse())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleRestore(row) {
    setBusyId(row.id)
    try {
      const all = await getTrash(spreadsheetId)
      const idx = all.findIndex(r => r.id === row.id)
      if (idx !== -1) await restoreTrashRow(spreadsheetId, idx, all[idx])
      await load()
    } catch (e) { console.error(e) }
    setBusyId(null)
  }

  async function handlePurge(row) {
    if (!window.confirm('Permanently delete this item? This cannot be undone.')) return
    setBusyId(row.id)
    try {
      const all = await getTrash(spreadsheetId)
      const idx = all.findIndex(r => r.id === row.id)
      if (idx !== -1) await purgeTrashRow(spreadsheetId, idx)
      await load()
    } catch (e) { console.error(e) }
    setBusyId(null)
  }

  return (
    <div className="px-4 py-4">
      <p className="text-gray-500 text-xs mb-3">Deleted items are kept here for 30 days before being permanently removed.</p>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">Trash is empty.</p>
      ) : (
        <div className="space-y-2">
          {rows.map(r => (
            <div key={r.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{describe(r)}</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {LABELS[r.sheet] || r.sheet} · deleted {new Date(r.deleted_at).toLocaleDateString()}
                </div>
              </div>
              <button
                disabled={busyId === r.id}
                onClick={() => handleRestore(r)}
                className="text-sky-400 active:text-sky-300 text-xs font-medium px-2 py-1 disabled:opacity-50"
              >
                Restore
              </button>
              <button
                disabled={busyId === r.id}
                onClick={() => handlePurge(r)}
                className="text-gray-600 active:text-red-400 text-base disabled:opacity-50"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
