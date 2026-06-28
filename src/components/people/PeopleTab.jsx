import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import { getRows, appendRow, updateRow, deleteRow, softDeleteRow } from '../../services/sheets'
import { SHEETS } from '../../config'

function uid() { return Date.now().toString(36) }
function now() { return new Date().toISOString() }
function todayStr() { return new Date().toISOString().split('T')[0] }

const RELATIONSHIPS = ['Friend', 'Colleague', 'Family', 'Acquaintance', 'Mentor', 'Other']

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatBirthday(dateStr) {
  if (!dateStr) return null
  const [, month, day] = dateStr.split('-')
  return new Date(2000, parseInt(month) - 1, parseInt(day)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function upcomingBirthday(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  const [, month, day] = dateStr.split('-')
  const bday = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day))
  if (bday < today) bday.setFullYear(today.getFullYear() + 1)
  const diff = Math.ceil((bday - today) / (1000 * 60 * 60 * 24))
  if (diff <= 30) return diff === 0 ? 'Today!' : diff === 1 ? 'Tomorrow' : `In ${diff} days`
  return null
}

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-violet-600', 'bg-rose-600', 'bg-amber-600',
  'bg-emerald-600', 'bg-sky-600', 'bg-pink-600', 'bg-teal-600',
]
function avatarColor(name) {
  let n = 0
  for (const c of name) n += c.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ── Person detail view ──────────────────────────────────────────────────────

function PersonDetail({ person, onBack, spreadsheetId, onSaved }) {
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logEntry, setLogEntry] = useState({ date: todayStr(), summary: '' })
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ ...person })

  // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the viewed person changes
  useEffect(() => { loadInteractions() }, [person.id])

  async function loadInteractions() {
    setLoading(true)
    try {
      const all = await getRows(spreadsheetId, SHEETS.INTERACTIONS)
      setInteractions(all.filter(r => r.person_id === person.id).reverse())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleAddLog(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await appendRow(spreadsheetId, SHEETS.INTERACTIONS, [
        uid(), person.id, logEntry.date, logEntry.summary, now()
      ])
      setLogEntry({ date: todayStr(), summary: '' })
      setShowLogForm(false)
      await loadInteractions()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeletePerson() {
    if (!window.confirm(`Delete ${person.name} and all their interactions?`)) return
    try {
      // Delete all interactions for this person (reverse order to preserve indices)
      const allInteractions = await getRows(spreadsheetId, SHEETS.INTERACTIONS)
      const personInteractions = allInteractions
        .map((r, i) => ({ ...r, _idx: i }))
        .filter(r => r.person_id === person.id)
        .reverse()
      for (const r of personInteractions) {
        await deleteRow(spreadsheetId, SHEETS.INTERACTIONS, r._idx)
      }
      // Soft-delete the person (interactions are hard-deleted above since they're not independently restorable)
      const allPeople = await getRows(spreadsheetId, SHEETS.PEOPLE)
      const idx = allPeople.findIndex(r => r.id === person.id)
      if (idx !== -1) await softDeleteRow(spreadsheetId, SHEETS.PEOPLE, idx, allPeople[idx])
      onBack()
    } catch (e) { console.error(e) }
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const allPeople = await getRows(spreadsheetId, SHEETS.PEOPLE)
      const idx = allPeople.findIndex(r => r.id === person.id)
      if (idx !== -1) {
        await updateRow(spreadsheetId, SHEETS.PEOPLE, idx, [
          person.id, editForm.name, editForm.birthday, editForm.relationship,
          editForm.how_met, editForm.location, editForm.tags, editForm.notes,
          person.created_at, now()
        ])
      }
      setEditing(false)
      onSaved({ ...person, ...editForm })
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const bday = upcomingBirthday(person.birthday)

  if (editing) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setEditing(false)} className="text-gray-400 text-sm active:text-white">← Cancel</button>
          <button
            onClick={handleSaveEdit} disabled={saving}
            className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
        <div className="space-y-3">
          <input
            required placeholder="Full name"
            value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
          />
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Birthday</label>
            <input
              type="date"
              value={editForm.birthday} onChange={e => setEditForm(f => ({ ...f, birthday: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Relationship</label>
            <div className="flex gap-2 flex-wrap">
              {RELATIONSHIPS.map(r => (
                <button key={r} type="button"
                  onClick={() => setEditForm(f => ({ ...f, relationship: r }))}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${editForm.relationship === r ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                >{r}</button>
              ))}
            </div>
          </div>
          <input
            placeholder="How you met"
            value={editForm.how_met} onChange={e => setEditForm(f => ({ ...f, how_met: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
          />
          <input
            placeholder="Location (city / company)"
            value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
          />
          <input
            placeholder="Tags (comma separated)"
            value={editForm.tags} onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
          />
          <div>
            <label className="text-gray-500 text-xs mb-1 block">General notes</label>
            <textarea
              placeholder="Personality, interests, things to remember…"
              value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 text-sm active:text-white">← People</button>
        <div className="flex items-center gap-4">
          <button onClick={handleDeletePerson} className="text-gray-600 active:text-red-400 text-base">🗑</button>
          <button onClick={() => setEditing(true)} className="text-indigo-400 text-sm active:text-indigo-200">Edit</button>
        </div>
      </div>

      {/* Profile card */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${avatarColor(person.name)}`}>
            {initials(person.name)}
          </div>
          <div>
            <h2 className="text-white text-xl font-semibold">{person.name}</h2>
            {person.relationship && (
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{person.relationship}</span>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl divide-y divide-gray-700">
          {person.birthday && (
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🎂</span>
                <span className="text-gray-300 text-sm">{formatBirthday(person.birthday)}</span>
              </div>
              {bday && <span className="text-amber-400 text-xs font-medium">{bday}</span>}
            </div>
          )}
          {person.how_met && (
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-base">🤝</span>
              <span className="text-gray-300 text-sm">{person.how_met}</span>
            </div>
          )}
          {person.location && (
            <div className="flex items-center gap-2 px-4 py-3">
              <span className="text-base">📍</span>
              <span className="text-gray-300 text-sm">{person.location}</span>
            </div>
          )}
        </div>

        {person.tags && (
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {person.tags.split(',').map(t => t.trim()).filter(Boolean).map(t => (
              <span key={t} className="text-indigo-400 text-xs bg-indigo-900/30 px-2 py-0.5 rounded-full">#{t}</span>
            ))}
          </div>
        )}

        {person.notes && (
          <div className="mt-4 bg-gray-800/60 rounded-xl px-4 py-3">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Notes</p>
            <p className="text-gray-300 text-sm leading-relaxed">{person.notes}</p>
          </div>
        )}
      </div>

      {/* Interaction log */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Interactions</h3>
          <button
            onClick={() => setShowLogForm(true)}
            className="text-indigo-400 text-xs font-medium active:text-indigo-200"
          >
            + Log
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : interactions.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-6">No interactions logged yet.</p>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-700" />
            <div className="space-y-4 pl-8">
              {interactions.map(r => (
                <div key={r.id} className="relative">
                  <div className="absolute -left-5 top-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                  <div className="text-gray-500 text-xs mb-1">{r.date}</div>
                  <div className="text-gray-200 text-sm leading-relaxed">{r.summary}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Log interaction sheet */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setShowLogForm(false)}>
          <form
            onSubmit={handleAddLog}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3"
          >
            <h2 className="text-white font-semibold text-base">Log Interaction</h2>
            <input
              type="date" value={logEntry.date}
              onChange={e => setLogEntry(l => ({ ...l, date: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
            />
            <textarea
              required
              placeholder="What did you talk about? Any follow-ups?"
              value={logEntry.summary}
              onChange={e => setLogEntry(l => ({ ...l, summary: e.target.value }))}
              rows={4}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ── People list view ────────────────────────────────────────────────────────

export default function PeopleTab() {
  const { spreadsheetId } = useAuth()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', birthday: '', relationship: 'Friend', how_met: '', location: '', tags: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRel, setFilterRel] = useState('All')

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getRows(spreadsheetId, SHEETS.PEOPLE)
      setPeople(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await appendRow(spreadsheetId, SHEETS.PEOPLE, [
        uid(), form.name, form.birthday, form.relationship,
        form.how_met, form.location, form.tags, form.notes, now(), now()
      ])
      await load()
      setForm({ name: '', birthday: '', relationship: 'Friend', how_met: '', location: '', tags: '', notes: '' })
      setShowForm(false)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (selected) {
    return (
      <PersonDetail
        person={selected}
        spreadsheetId={spreadsheetId}
        onBack={() => setSelected(null)}
        onSaved={(updated) => {
          setPeople(prev => prev.map(p => p.id === updated.id ? updated : p))
          setSelected(updated)
        }}
      />
    )
  }

  const filtered = people.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase())
    const matchRel = filterRel === 'All' || p.relationship === filterRel
    return matchSearch && matchRel
  })

  const withBirthdays = people.filter(p => upcomingBirthday(p.birthday))

  return (
    <div className="px-4 py-4">
      {/* Upcoming birthdays banner */}
      {withBirthdays.length > 0 && (
        <div className="bg-amber-900/30 border border-amber-700/40 rounded-xl px-4 py-3 mb-4">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1.5">🎂 Upcoming Birthdays</p>
          {withBirthdays.map(p => (
            <div key={p.id} className="flex items-center justify-between">
              <span className="text-white text-sm">{p.name}</span>
              <span className="text-amber-400 text-xs">{upcomingBirthday(p.birthday)}</span>
            </div>
          ))}
        </div>
      )}

      <input
        placeholder="Search people…"
        value={search} onChange={e => setSearch(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-xl px-4 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500 mb-3"
      />

      {/* Relationship filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['All', ...RELATIONSHIPS].map(r => (
          <button
            key={r}
            onClick={() => setFilterRel(r)}
            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterRel === r ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-600 text-sm text-center py-12">
          {people.length === 0 ? 'No people yet. Tap + to add someone.' : 'No matches.'}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const bday = upcomingBirthday(p.birthday)
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3 active:bg-gray-700 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${avatarColor(p.name)}`}>
                  {initials(p.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{p.name}</span>
                    {bday && <span className="text-amber-400 text-xs">🎂 {bday}</span>}
                  </div>
                  <div className="flex gap-2 text-gray-500 text-xs mt-0.5">
                    {p.relationship && <span>{p.relationship}</span>}
                    {p.location && <span>· {p.location}</span>}
                  </div>
                </div>
                <span className="text-gray-600 text-lg">›</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Add person sheet */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleAdd}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto"
          >
            <h2 className="text-white font-semibold text-base">Add Person</h2>
            <input
              required placeholder="Full name"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Birthday (optional)</label>
              <input
                type="date"
                value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              />
            </div>
            <div>
              <label className="text-gray-500 text-xs mb-1 block">Relationship</label>
              <div className="flex gap-2 flex-wrap">
                {RELATIONSHIPS.map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, relationship: r }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${form.relationship === r ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
                  >{r}</button>
                ))}
              </div>
            </div>
            <input
              placeholder="How you met"
              value={form.how_met} onChange={e => setForm(f => ({ ...f, how_met: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <input
              placeholder="Location (city / company)"
              value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <input
              placeholder="Tags (comma separated)"
              value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <textarea
              placeholder="Notes about this person…"
              value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500 resize-none"
            />
            <button
              type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Person'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
