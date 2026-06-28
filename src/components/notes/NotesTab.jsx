import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, appendRow, updateRow, softDeleteRow } from '../../services/sheets'
import { SHEETS } from '../../config'

function uid() { return Date.now().toString(36) }
function now() { return new Date().toISOString() }

export default function NotesTab() {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null | { id, title, body, tags } | 'new'
  const [saving, setSaving] = useState(false)
  const [filterTag, setFilterTag] = useState('')
  const [search, setSearch] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getRows(spreadsheetId, SHEETS.NOTES)
      setRows(data.reverse())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function allTags() {
    const tags = rows.flatMap(r => r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [])
    return [...new Set(tags)]
  }

  async function handleDelete() {
    if (!editing || editing.id === 'new') return
    if (!window.confirm('Delete this note?')) return
    try {
      const allRows = await getRows(spreadsheetId, SHEETS.NOTES)
      const idx = allRows.findIndex(r => r.id === editing.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.NOTES, idx, allRows[idx])
      setRows(prev => prev.filter(r => r.id !== editing.id))
      setEditing(null)
    } catch (e) { console.error(e) }
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    try {
      const tagsStr = (editing.tags || '').trim()
      if (editing.id === 'new') {
        const row = [uid(), editing.title, editing.body, tagsStr, now(), now()]
        await appendRow(spreadsheetId, SHEETS.NOTES, row)
      } else {
        const allRows = await getRows(spreadsheetId, SHEETS.NOTES)
        const idx = allRows.findIndex(r => r.id === editing.id)
        if (idx !== -1) {
          const existing = allRows[idx]
          const row = [existing.id, editing.title, editing.body, tagsStr, existing.created_at, now()]
          await updateRow(spreadsheetId, SHEETS.NOTES, idx, row)
        }
      }
      await load()
      setEditing(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const filtered = rows.filter(r => {
    const matchTag = !filterTag || r.tags?.includes(filterTag)
    const matchSearch = !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.body?.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  if (editing !== null) {
    return (
      <div className="flex flex-col h-full px-4 py-4 min-h-[calc(100svh-120px)]">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setEditing(null)} className="text-gray-400 text-sm active:text-white">← Back</button>
          <div className="flex items-center gap-3">
            {editing.id !== 'new' && (
              <button onClick={handleDelete} className="text-gray-600 active:text-red-400 text-base">🗑</button>
            )}
            <button
              onClick={handleSave} disabled={saving}
              className="bg-violet-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
        <input
          placeholder="Title"
          value={editing.title || ''}
          onChange={e => setEditing(ed => ({ ...ed, title: e.target.value }))}
          className="w-full bg-transparent text-white text-xl font-semibold border-b border-gray-800 pb-2 mb-3 outline-none"
        />
        <textarea
          placeholder="Write your note…"
          value={editing.body || ''}
          onChange={e => setEditing(ed => ({ ...ed, body: e.target.value }))}
          className="flex-1 w-full bg-transparent text-gray-200 text-sm leading-relaxed outline-none resize-none min-h-48"
          rows={12}
        />
        <div className="mt-3">
          <input
            placeholder="Tags (comma separated, e.g. ideas, work)"
            value={editing.tags || ''}
            onChange={e => setEditing(ed => ({ ...ed, tags: e.target.value }))}
            className="w-full bg-gray-800 text-gray-300 text-xs rounded-lg px-3 py-2 border border-gray-700 outline-none focus:border-violet-500"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <input
        placeholder="Search notes…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 outline-none focus:border-violet-500 mb-3"
      />

      {allTags().length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => setFilterTag('')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${!filterTag ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            All
          </button>
          {allTags().map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTag(filterTag === tag ? '' : tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterTag === tag ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">No notes yet. Tap + to create one.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => setEditing({ id: r.id, title: r.title, body: r.body, tags: r.tags })}
              className="w-full text-left bg-gray-800 rounded-xl px-4 py-3 active:bg-gray-700 transition-colors"
            >
              <div className="text-white text-sm font-medium truncate">{r.title || 'Untitled'}</div>
              <div className="text-gray-500 text-xs mt-0.5 line-clamp-2">{r.body}</div>
              {r.tags && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {r.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="text-violet-400 text-xs">#{t}</span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setEditing({ id: 'new', title: '', body: '', tags: '' })}
        className="fixed bottom-20 right-4 w-12 h-12 bg-violet-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
