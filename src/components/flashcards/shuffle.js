// Weighted-shuffle model for the review session. Each card carries a `weight` — its
// relative chance of being drawn next, like a music shuffle that leans toward the
// tracks you haven't skipped. Swipes nudge the weight; it is persisted per swipe so
// it survives the session being closed.

export const WEIGHT_MIN = 0.05
export const WEIGHT_MAX = 4
export const WEIGHT_DEFAULT = 1

// Empty / malformed cells (older cards, freshly migrated sheets) read as the default.
export function cardWeight(c) {
  const w = parseFloat(c?.weight)
  return Number.isFinite(w) && w > 0 ? w : WEIGHT_DEFAULT
}

// The new weight after a swipe. Right (I know it) decays fast; left (I don't) jumps
// back up; up (50-50) stays high; down (bad explanation) leaves frequency alone.
export function nextWeight(dir, w) {
  switch (dir) {
    case 'right': return Math.max(w * 0.4, WEIGHT_MIN)
    case 'left': return Math.min(Math.max(w, 1) * 1.8, WEIGHT_MAX)
    case 'up': return Math.min(Math.max(w, 0.8) * 1.1, 2)
    default: return w // 'down'
  }
}

// Weighted random draw, skipping the most recent cards so nothing repeats
// back-to-back. Falls back to the full set for tiny decks.
export function pickNext(cards, weightOf, exclude = []) {
  const pool = cards.filter(c => !exclude.includes(c.id))
  const list = pool.length ? pool : cards
  const total = list.reduce((s, c) => s + weightOf(c), 0)
  if (total <= 0) return list[Math.floor(Math.random() * list.length)]
  let r = Math.random() * total
  for (const c of list) {
    r -= weightOf(c)
    if (r <= 0) return c
  }
  return list[list.length - 1]
}

export const SWIPES = {
  right: { label: 'Know it', hint: 'less often', tone: 'text-emerald-400', ring: 'border-emerald-500/60', glyph: '→' },
  left: { label: "Don't know", hint: 'keep frequent', tone: 'text-rose-400', ring: 'border-rose-500/60', glyph: '←' },
  up: { label: '50-50', hint: 'keep frequent', tone: 'text-amber-400', ring: 'border-amber-500/60', glyph: '↑' },
  down: { label: 'Redo this', hint: 'flag for rewrite', tone: 'text-slate-300', ring: 'border-slate-400/60', glyph: '↓' },
}
