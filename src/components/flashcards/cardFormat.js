// Turns the plain-text card backs into structured, colour-coded blocks.
// Backs are written as paragraphs, most of which open with a short "Label: body"
// lead-in ("Under the hood:", "Gotcha:", "Example:"). Rather than enumerate every
// label used across the decks, the label is detected generically and its colour is
// chosen by keyword, so new cards get formatting for free.

// Tailwind scans for complete class strings, so every class here is written out in
// full — never assembled from fragments at runtime.
export const TONES = {
  mechanism: { label: 'text-amber-400', bar: 'border-amber-500/50' },
  danger: { label: 'text-rose-400', bar: 'border-rose-500/50' },
  example: { label: 'text-sky-400', bar: 'border-sky-500/50' },
  fix: { label: 'text-emerald-400', bar: 'border-emerald-500/50' },
  detect: { label: 'text-violet-400', bar: 'border-violet-500/50' },
  neutral: { label: 'text-gray-400', bar: 'border-gray-600' },
}

// Checked in order — the first matching group wins, so warnings beat generic words.
const TONE_RULES = [
  ['danger', ['pitfall', 'gotcha', 'trap', 'mistake', 'harm', 'problem', 'weakness', 'limit', 'caveat', 'risk', 'worse', 'tension', 'break', 'fail', 'watch', 'cost', 'not a metric', 'it is not', 'critical rule', 'dying', 'curse']],
  ['fix', ['fix', 'mitigat', 'correct', 'solution', 'handling', 'defence', 'defense', 'practice', 'tactic', 'strateg', 'avoid', 'prevent', 'control', 'treatment', 'guardrail', 'requirement', 'alternativ', 'strength', 'advantage', 'benefit', 'payoff', 'gain', 'use ', 'use:']],
  ['example', ['example', 'classic', 'canonical', 'e.g.']],
  ['detect', ['detect', 'measure', 'diagnos', 'symptom', 'monitor', 'tell-tale', 'sign', 'test', 'check', 'verify']],
  ['mechanism', ['under the hood', 'why', 'how', 'insight', 'reason', 'intuition', 'mechanism', 'analytic', 'geometric', 'key', 'crucial', 'critical', 'the hard part', 'deeper', 'implication', 'consequence', 'framing', 'interpretation']],
]

export function labelTone(label) {
  const l = label.toLowerCase()
  for (const [tone, keywords] of TONE_RULES) {
    if (keywords.some(k => l.includes(k))) return tone
  }
  return 'neutral'
}

// Once a label becomes its own heading, the body that followed the colon reads as a
// sentence and should start with a capital. Skipped when the body opens with a single
// lowercase letter other than "a", which is a maths variable (n, k, d…) not a word.
function capitaliseBody(body) {
  if (/^[b-z][\s<>=),.]/.test(body)) return body
  return body.charAt(0).toUpperCase() + body.slice(1)
}

// Pulls "- " / "• " / "* " lines out of a block into a bullet list, keeping any
// text before the first bullet as a lead-in. A line that is indented or does not
// start with a marker is treated as a continuation of the previous bullet.
function splitBullets(text) {
  const lines = text.split('\n')
  const marker = /^\s*[-•*]\s+/
  if (!lines.some(l => marker.test(l))) return { body: text, lead: null, bullets: null }
  const lead = []
  const bullets = []
  for (const line of lines) {
    const t = line.trim()
    if (!t) continue
    if (marker.test(line)) bullets.push(t.replace(marker, ''))
    else if (bullets.length === 0) lead.push(t)
    else bullets[bullets.length - 1] += ' ' + t
  }
  return { body: text, lead: lead.join(' ') || null, bullets }
}

// Splits a back into blocks. A label is a short capitalised lead-in ending in a
// colon; anything else is plain body text. Each block also carries { lead, bullets }
// when its body is written as a "- " bullet list.
export function parseBack(back) {
  return (back || '')
    .split('\n\n')
    .map(p => p.trim())
    .filter(Boolean)
    .map(para => {
      const m = para.match(/^([A-Z][^:\n]{1,44}):\s+([\s\S]+)$/)
      const label = m ? m[1] : null
      const raw = m ? capitaliseBody(m[2]) : para
      return { label, ...splitBullets(raw) }
    })
}

// Per-deck accent, so the deck list reads as distinct subjects rather than one grey
// list. Starter decks are assigned deliberately; user decks get a stable colour
// derived from the name.
const DECK_ACCENTS = {
  sky: { text: 'text-sky-400', chipBg: 'bg-sky-500/15', dot: 'bg-sky-500', bar: 'bg-sky-500', ring: 'border-sky-500/30' },
  violet: { text: 'text-violet-400', chipBg: 'bg-violet-500/15', dot: 'bg-violet-500', bar: 'bg-violet-500', ring: 'border-violet-500/30' },
  emerald: { text: 'text-emerald-400', chipBg: 'bg-emerald-500/15', dot: 'bg-emerald-500', bar: 'bg-emerald-500', ring: 'border-emerald-500/30' },
  rose: { text: 'text-rose-400', chipBg: 'bg-rose-500/15', dot: 'bg-rose-500', bar: 'bg-rose-500', ring: 'border-rose-500/30' },
  amber: { text: 'text-amber-400', chipBg: 'bg-amber-500/15', dot: 'bg-amber-500', bar: 'bg-amber-500', ring: 'border-amber-500/30' },
}

const NAMED_DECKS = {
  'Statistics for ML': 'sky',
  'ML Algorithms': 'violet',
  'ML Deployment (MLOps)': 'emerald',
  'Recommendation Systems': 'rose',
}

const CYCLE = ['amber', 'sky', 'violet', 'emerald', 'rose']

export function deckAccent(deck = '') {
  const named = NAMED_DECKS[deck]
  if (named) return DECK_ACCENTS[named]
  let hash = 0
  for (let i = 0; i < deck.length; i++) hash = (hash * 31 + deck.charCodeAt(i)) >>> 0
  return DECK_ACCENTS[CYCLE[hash % CYCLE.length]]
}
