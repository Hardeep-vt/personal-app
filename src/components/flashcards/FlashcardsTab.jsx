import { useState, useEffect } from 'react'
import { useAuth } from '../../context/useAuth'
import {
  getFlashcards, createFlashcard, createFlashcards, updateFlashcard,
  deleteFlashcard, renameFlashcardDeck, deleteFlashcardDeck, getRows,
} from '../../services/sheets'
import { SHEETS } from '../../config'
import ReviewSession from './ReviewSession'

export default function FlashcardsTab() {
  const { spreadsheetId } = useAuth()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openDeck, setOpenDeck] = useState(null)
  const [reviewing, setReviewing] = useState(false)
  const [editing, setEditing] = useState(null) // null | { id, deck, front, back }
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkDeck, setBulkDeck] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once on mount
  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      setCards(await getFlashcards(spreadsheetId))
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const decks = [...new Set(cards.map(c => c.deck).filter(Boolean))].sort()
  const deckCards = openDeck ? cards.filter(c => c.deck === openDeck) : []

  async function handleSaveCard() {
    if (!editing?.front?.trim() || !editing?.deck?.trim()) return
    setSaving(true)
    try {
      if (editing.id === 'new') {
        await createFlashcard(spreadsheetId, {
          deck: editing.deck.trim(), front: editing.front.trim(), back: (editing.back || '').trim(),
        })
      } else {
        const all = await getRows(spreadsheetId, SHEETS.FLASHCARDS)
        const idx = all.findIndex(r => r.id === editing.id)
        if (idx !== -1) {
          await updateFlashcard(spreadsheetId, idx, {
            ...all[idx], deck: editing.deck.trim(), front: editing.front.trim(), back: (editing.back || '').trim(),
          })
        }
      }
      await load()
      setEditing(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeleteCard(id) {
    if (!window.confirm('Delete this card?')) return
    try {
      await deleteFlashcard(spreadsheetId, id)
      await load()
      setEditing(null)
    } catch (e) { console.error(e) }
  }

  // Parses pasted lines of "front | back" into cards.
  async function handleBulkAdd() {
    const deck = bulkDeck.trim()
    if (!deck) return
    const parsed = bulkText.split('\n').map(line => {
      const [front, ...rest] = line.split('|')
      return { deck, front: (front || '').trim(), back: rest.join('|').trim() }
    }).filter(c => c.front)
    if (parsed.length === 0) return
    setSaving(true)
    try {
      await createFlashcards(spreadsheetId, parsed)
      await load()
      setBulkOpen(false)
      setBulkText('')
      setOpenDeck(deck)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleRenameDeck() {
    const next = window.prompt('Rename deck to:', openDeck)
    if (!next || !next.trim() || next.trim() === openDeck) return
    setSaving(true)
    try {
      await renameFlashcardDeck(spreadsheetId, openDeck, next.trim())
      await load()
      setOpenDeck(next.trim())
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDeleteDeck() {
    if (!window.confirm(`Delete the "${openDeck}" deck and all ${deckCards.length} of its cards?`)) return
    setSaving(true)
    try {
      await deleteFlashcardDeck(spreadsheetId, openDeck)
      await load()
      setOpenDeck(null)
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // --- review mode ---
  if (reviewing && openDeck && deckCards.length > 0) {
    return <ReviewSession deck={openDeck} cards={deckCards} onExit={() => { setReviewing(false); load() }} />
  }

  // --- card editor ---
  if (editing) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setEditing(null)} className="text-gray-400 text-sm active:text-white">← Back</button>
          <div className="flex items-center gap-3">
            {editing.id !== 'new' && (
              <button onClick={() => handleDeleteCard(editing.id)} className="text-gray-600 active:text-red-400 text-base">🗑</button>
            )}
            <button
              onClick={handleSaveCard}
              disabled={saving || !editing.front?.trim() || !editing.deck?.trim()}
              className="bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        <label className="block text-gray-500 text-xs mb-1.5">Deck</label>
        <input
          list="deck-options"
          placeholder="e.g. Spanish verbs"
          value={editing.deck || ''}
          onChange={e => setEditing(ed => ({ ...ed, deck: e.target.value }))}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 outline-none focus:border-amber-500 mb-4"
        />
        <datalist id="deck-options">
          {decks.map(d => <option key={d} value={d} />)}
        </datalist>

        <label className="block text-gray-500 text-xs mb-1.5">Front</label>
        <textarea
          placeholder="Question or prompt"
          value={editing.front || ''}
          onChange={e => setEditing(ed => ({ ...ed, front: e.target.value }))}
          rows={3}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 outline-none focus:border-amber-500 resize-none mb-4"
        />

        <label className="block text-gray-500 text-xs mb-1.5">Back</label>
        <textarea
          placeholder="Answer"
          value={editing.back || ''}
          onChange={e => setEditing(ed => ({ ...ed, back: e.target.value }))}
          rows={5}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 outline-none focus:border-amber-500 resize-none"
        />
      </div>
    )
  }

  // --- bulk add ---
  if (bulkOpen) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setBulkOpen(false)} className="text-gray-400 text-sm active:text-white">← Back</button>
          <button
            onClick={handleBulkAdd}
            disabled={saving || !bulkDeck.trim() || !bulkText.trim()}
            className="bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Adding…' : 'Add cards'}
          </button>
        </div>

        <label className="block text-gray-500 text-xs mb-1.5">Deck</label>
        <input
          list="deck-options"
          placeholder="e.g. Spanish verbs"
          value={bulkDeck}
          onChange={e => setBulkDeck(e.target.value)}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 outline-none focus:border-amber-500 mb-4"
        />
        <datalist id="deck-options">
          {decks.map(d => <option key={d} value={d} />)}
        </datalist>

        <label className="block text-gray-500 text-xs mb-1.5">
          One card per line — <span className="text-amber-400">front | back</span>
        </label>
        <textarea
          placeholder={'hablar | to speak\ncomer | to eat\nvivir | to live'}
          value={bulkText}
          onChange={e => setBulkText(e.target.value)}
          rows={14}
          className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2.5 border border-gray-700 outline-none focus:border-amber-500 resize-none font-mono"
        />
        <p className="text-gray-600 text-xs mt-2">
          {bulkText.split('\n').filter(l => l.split('|')[0]?.trim()).length} card(s) will be added.
        </p>
      </div>
    )
  }

  // --- deck detail ---
  if (openDeck) {
    return (
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-1">
          <button onClick={() => setOpenDeck(null)} className="text-gray-400 text-sm active:text-white">← Decks</button>
          <div className="flex items-center gap-3">
            <button onClick={handleRenameDeck} className="text-gray-500 text-xs active:text-gray-300">Rename</button>
            <button onClick={handleDeleteDeck} className="text-gray-600 text-xs active:text-red-400">Delete deck</button>
          </div>
        </div>

        <h2 className="text-white text-xl font-semibold mt-2">{openDeck}</h2>
        <p className="text-gray-500 text-xs mb-4">{deckCards.length} card{deckCards.length === 1 ? '' : 's'}</p>

        {deckCards.length > 0 && (
          <button
            onClick={() => setReviewing(true)}
            className="w-full bg-amber-600 text-white font-medium py-3 rounded-xl mb-4 active:scale-95 transition-transform"
          >
            Review {deckCards.length} card{deckCards.length === 1 ? '' : 's'}
          </button>
        )}

        <div className="space-y-2">
          {deckCards.map(c => (
            <button
              key={c.id}
              onClick={() => setEditing({ id: c.id, deck: c.deck, front: c.front, back: c.back })}
              className="w-full text-left bg-gray-800 rounded-xl px-4 py-3 active:bg-gray-700 transition-colors"
            >
              <div className="text-white text-sm font-medium line-clamp-2">{c.front}</div>
              <div className="text-gray-500 text-xs mt-0.5 line-clamp-2">{c.back}</div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setEditing({ id: 'new', deck: openDeck, front: '', back: '' })}
          className="fixed bottom-6 right-4 w-12 h-12 bg-amber-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          +
        </button>
      </div>
    )
  }

  // --- deck list ---
  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-lg font-semibold">Decks</h2>
        <button
          onClick={() => { setBulkDeck(''); setBulkOpen(true) }}
          className="text-amber-400 text-xs font-medium active:text-amber-300"
        >
          Paste a deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🗂️</div>
          <p className="text-gray-500 text-sm mb-1">No decks yet</p>
          <p className="text-gray-600 text-xs">Tap + to add a card, or paste a whole deck at once.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {decks.map(deck => {
            const count = cards.filter(c => c.deck === deck).length
            const reviewed = cards.filter(c => c.deck === deck && c.last_reviewed).length
            return (
              <button
                key={deck}
                onClick={() => setOpenDeck(deck)}
                className="w-full text-left bg-gray-800 rounded-xl px-4 py-3.5 active:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-white text-sm font-medium">{deck}</div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {count} card{count === 1 ? '' : 's'}
                    {reviewed > 0 && <> · {reviewed} reviewed</>}
                  </div>
                </div>
                <span className="text-gray-600 text-lg">›</span>
              </button>
            )
          })}
        </div>
      )}

      <button
        onClick={() => setEditing({ id: 'new', deck: '', front: '', back: '' })}
        className="fixed bottom-6 right-4 w-12 h-12 bg-amber-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
