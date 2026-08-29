import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/useAuth'
import { recordFlashcardSwipe } from '../../services/sheets'
import { parseBack, labelTone, TONES, deckAccent } from './cardFormat'
import { cardWeight, nextWeight, pickNext, SWIPES } from './shuffle'
import SwipeCard from './SwipeCard'

export default function ReviewSession({ deck, cards, onExit }) {
  const { spreadsheetId } = useAuth()
  const accent = deckAccent(deck)

  // Snapshot the deck once — the parent hands a fresh array on every render.
  const [sessionCards] = useState(cards)
  const [seed] = useState(() => {
    const w = Object.fromEntries(sessionCards.map(c => [c.id, cardWeight(c)]))
    return { weights: w, first: pickNext(sessionCards, c => w[c.id]) }
  })
  // Live draw weights. Mutated only inside handleSwipe (an event handler) so the
  // picker always sees the latest values without re-rendering on every swipe.
  const weights = useRef(seed.weights)
  const recent = useRef([]) // last couple of card ids, to avoid immediate repeats

  const [current, setCurrent] = useState(seed.first)
  const [flipped, setFlipped] = useState(false)
  const [count, setCount] = useState(0)
  const [lastDir, setLastDir] = useState(null)

  const blocks = useMemo(() => parseBack(current.back), [current.back])

  const handleSwipe = useCallback((dir) => {
    setCurrent(card => {
      const w = nextWeight(dir, weights.current[card.id] ?? 1)
      weights.current = { ...weights.current, [card.id]: w }
      const flagged = dir === 'down' ? '1' : (card.flagged || '')

      recordFlashcardSwipe(spreadsheetId, card.id, {
        weight: w,
        flagged: dir === 'down' ? true : null,
      }).catch(e => console.error(e))

      recent.current = [card.id, ...recent.current].slice(0, 2)
      const next = pickNext(sessionCards, c => weights.current[c.id], recent.current)
      return { ...next, flagged: next.id === card.id ? flagged : next.flagged }
    })
    setLastDir(dir)
    setCount(n => n + 1)
    setFlipped(false)
  }, [sessionCards, spreadsheetId])

  // Desktop / accessibility: arrow keys mirror the swipes, space/enter flips.
  useEffect(() => {
    function onKey(e) {
      const map = { ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down' }
      if (map[e.key]) { e.preventDefault(); handleSwipe(map[e.key]) }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(f => !f) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleSwipe])

  return (
    <div className="flex flex-col px-4 py-4 h-[calc(100svh-110px)]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onExit} className="text-gray-400 text-sm active:text-white">← Exit</button>
        <span className="text-gray-500 text-xs">
          {count} reviewed
          {lastDir && <span className={`ml-2 ${SWIPES[lastDir].tone}`}>{SWIPES[lastDir].glyph} {SWIPES[lastDir].label}</span>}
        </span>
      </div>

      <SwipeCard key={current.id} accent={accent} flipped={flipped} onSwipe={handleSwipe} onTap={() => setFlipped(f => !f)}>
        {flipped ? (
          <div className="w-full space-y-3.5">
            {blocks.map((block, i) => {
              const tone = block.label ? TONES[labelTone(block.label)] : null
              return (
                <div key={i} className={tone ? `border-l-2 ${tone.bar} pl-3` : ''}>
                  {block.label && (
                    <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${tone.label}`}>
                      {block.label}
                    </div>
                  )}
                  <p className={`whitespace-pre-wrap leading-relaxed ${
                    i === 0 && !block.label
                      ? 'text-white text-[17px] font-medium'
                      : 'text-gray-300 text-[15px]'
                  }`}>
                    {block.body}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${accent.text}`}>
              {deck}
              {current.flagged === '1' && <span className="text-slate-400"> · flagged for redo</span>}
            </span>
            <p className="text-white text-2xl font-semibold leading-snug whitespace-pre-wrap">
              {current.front}
            </p>
            <span className="text-gray-600 text-xs mt-1">Tap to reveal</span>
          </>
        )}
      </SwipeCard>

      {/* Legend doubles as buttons — needed for up/down on long, scrollable answers,
          and for anyone not using touch. */}
      <div className="grid grid-cols-4 gap-2 mt-4 shrink-0">
        {['left', 'up', 'down', 'right'].map(dir => (
          <button
            key={dir}
            onClick={() => handleSwipe(dir)}
            className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border bg-gray-800/60 active:scale-95 transition-transform ${SWIPES[dir].ring}`}
          >
            <span className={`text-lg leading-none ${SWIPES[dir].tone}`}>{SWIPES[dir].glyph}</span>
            <span className={`text-[11px] font-semibold ${SWIPES[dir].tone}`}>{SWIPES[dir].label}</span>
            <span className="text-[9px] text-gray-500">{SWIPES[dir].hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
