import { useState, useMemo } from 'react'
import { useAuth } from '../../context/useAuth'
import { markFlashcardsReviewed } from '../../services/sheets'

function shuffle(arr) {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function ReviewSession({ deck, cards, onExit }) {
  const { spreadsheetId } = useAuth()
  const initial = useMemo(() => shuffle(cards), [cards])
  const [queue, setQueue] = useState(initial)
  const [flipped, setFlipped] = useState(false)
  const [seen, setSeen] = useState([]) // card ids answered "Got it" at least once
  const [againCount, setAgainCount] = useState(0)

  const current = queue[0]
  const done = queue.length === 0

  function handleAgain() {
    setAgainCount(c => c + 1)
    setQueue(q => (q.length > 1 ? [...q.slice(1), q[0]] : q))
    setFlipped(false)
  }

  function handleGotIt() {
    const card = queue[0]
    const nextSeen = seen.includes(card.id) ? seen : [...seen, card.id]
    const nextQueue = queue.slice(1)
    setSeen(nextSeen)
    setQueue(nextQueue)
    setFlipped(false)
    if (nextQueue.length === 0) {
      // Session finished — persist review stamps without blocking the summary screen.
      markFlashcardsReviewed(spreadsheetId, nextSeen).catch(e => console.error(e))
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 gap-4 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="text-white text-xl font-semibold">Deck complete</h2>
        <p className="text-gray-400 text-sm">
          {initial.length} card{initial.length === 1 ? '' : 's'} in {deck}
          {againCount > 0 && <> · {againCount} repeat{againCount === 1 ? '' : 's'}</>}
        </p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => { setQueue(shuffle(initial)); setSeen([]); setAgainCount(0); setFlipped(false) }}
            className="bg-amber-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
          >
            Review again
          </button>
          <button
            onClick={onExit}
            className="bg-gray-800 text-gray-300 text-sm font-medium px-5 py-2.5 rounded-xl active:scale-95 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  const remaining = queue.length
  const progress = ((initial.length - remaining) / initial.length) * 100

  return (
    <div className="flex flex-col px-4 py-4 min-h-[calc(100svh-140px)]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={onExit} className="text-gray-400 text-sm active:text-white">← Exit</button>
        <span className="text-gray-500 text-xs">{remaining} left</span>
      </div>

      <div className="h-1 bg-gray-800 rounded-full mb-5 overflow-hidden">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <button
        onClick={() => setFlipped(f => !f)}
        className="flex-1 w-full bg-gray-800 rounded-2xl px-5 py-8 flex flex-col items-center justify-center gap-3 active:bg-gray-700 transition-colors min-h-64"
      >
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${flipped ? 'text-amber-400' : 'text-gray-600'}`}>
          {flipped ? 'Back' : 'Front'}
        </span>
        <p className="text-white text-lg leading-relaxed text-center whitespace-pre-wrap">
          {flipped ? current.back : current.front}
        </p>
        {!flipped && <span className="text-gray-600 text-xs mt-2">Tap to reveal</span>}
      </button>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAgain}
          className="flex-1 bg-gray-800 text-gray-300 font-medium py-3.5 rounded-xl active:scale-95 transition-transform"
        >
          Again
        </button>
        <button
          onClick={handleGotIt}
          className="flex-1 bg-amber-600 text-white font-medium py-3.5 rounded-xl active:scale-95 transition-transform"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
