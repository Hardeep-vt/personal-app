import { useRef, useState, useEffect, useCallback } from 'react'
import { SWIPES } from './shuffle'

// A draggable flashcard face. Follows the pointer, rotates with horizontal drag,
// and fires onSwipe('left'|'right'|'up'|'down') once a drag passes the commit
// threshold or is flicked. A near-motionless press is treated as onTap (flip).
//
// Long answers scroll natively: when the inner content overflows, touch-action is
// pan-y so vertical drags scroll the text, and up/down is done from the legend
// buttons instead. Short faces (every question, short answers) swipe all four ways.

const AXIS_LOCK = 10   // px of travel before the gesture commits to an axis
const COMMIT_X = 0.28  // fraction of card width to count as a horizontal swipe
const COMMIT_Y = 100   // px of travel to count as a vertical swipe
const TAP_MAX = 8      // px of travel still considered a tap
const FLY_MS = 180

export default function SwipeCard({ accent, flipped, onSwipe, onTap, children }) {
  const cardRef = useRef(null)
  const scrollRef = useRef(null)
  const gesture = useRef(null)
  const [drag, setDrag] = useState({ x: 0, y: 0, axis: null })
  const [leaving, setLeaving] = useState(null)
  const [scrollable, setScrollable] = useState(false)

  // Re-measure whether the face overflows whenever it flips or its content changes.
  useEffect(() => {
    const el = scrollRef.current
    if (el) setScrollable(el.scrollHeight > el.clientHeight + 1)
  }, [flipped, children])

  const fly = useCallback((dir) => {
    setLeaving(dir)
    setDrag({ x: 0, y: 0, axis: null })
    setTimeout(() => { setLeaving(null); onSwipe?.(dir) }, FLY_MS)
  }, [onSwipe])

  function onPointerDown(e) {
    if (leaving) return
    gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), axis: null }
    try { cardRef.current?.setPointerCapture?.(e.pointerId) } catch { /* no active pointer (e.g. synthetic events) */ }
  }

  function onPointerMove(e) {
    const s = gesture.current
    if (!s || e.pointerId !== s.id) return
    const dx = e.clientX - s.x0
    const dy = e.clientY - s.y0

    if (!s.axis) {
      if (Math.abs(dx) < AXIS_LOCK && Math.abs(dy) < AXIS_LOCK) return
      if (Math.abs(dx) > Math.abs(dy)) {
        s.axis = 'x'
      } else {
        // Vertical: only hijack for an up/down swipe when the text can't scroll
        // that way — otherwise let the browser scroll the answer.
        const el = scrollRef.current
        const canScroll = el && el.scrollHeight > el.clientHeight + 1
        const atTop = !canScroll || el.scrollTop <= 0
        const atBottom = !canScroll || el.scrollTop + el.clientHeight >= el.scrollHeight - 1
        s.axis = (dy > 0 && atTop) || (dy < 0 && atBottom) ? 'y' : 'scroll'
      }
    }

    if (s.axis === 'x') setDrag({ x: dx, y: 0, axis: 'x' })
    else if (s.axis === 'y') setDrag({ x: 0, y: dy, axis: 'y' })
  }

  function onPointerEnd(e) {
    const s = gesture.current
    if (!s || e.pointerId !== s.id) return
    gesture.current = null
    const dx = e.clientX - s.x0
    const dy = e.clientY - s.y0
    const dt = performance.now() - s.t0

    if (!s.axis || s.axis === 'scroll') {
      if (Math.abs(dx) + Math.abs(dy) < TAP_MAX && dt < 250) onTap?.()
      setDrag({ x: 0, y: 0, axis: null })
      return
    }

    const w = cardRef.current?.offsetWidth || 320
    const vx = dx / dt
    const vy = dy / dt
    let dir = null
    if (s.axis === 'x') {
      if (dx > w * COMMIT_X || vx > 0.5) dir = 'right'
      else if (dx < -w * COMMIT_X || vx < -0.5) dir = 'left'
    } else {
      if (dy < -COMMIT_Y || vy < -0.5) dir = 'up'
      else if (dy > COMMIT_Y || vy > 0.5) dir = 'down'
    }

    if (dir) fly(dir)
    else setDrag({ x: 0, y: 0, axis: null })
  }

  let transform = 'translate(0,0)'
  let transition = 'transform 200ms cubic-bezier(.2,.8,.2,1)'
  if (leaving) {
    const off = { right: 'translate(700px,-60px) rotate(22deg)', left: 'translate(-700px,-60px) rotate(-22deg)', up: 'translate(0,-800px)', down: 'translate(0,800px)' }
    transform = off[leaving]
    transition = `transform ${FLY_MS}ms ease-out`
  } else if (drag.axis) {
    transform = `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 22}deg)`
    transition = 'none'
  }

  const hint =
    leaving ? leaving
      : drag.axis === 'x' ? (drag.x > 24 ? 'right' : drag.x < -24 ? 'left' : null)
      : drag.axis === 'y' ? (drag.y < -24 ? 'up' : drag.y > 24 ? 'down' : null)
      : null
  const hintStrength = hint && !leaving
    ? Math.min((drag.axis === 'x' ? Math.abs(drag.x) : Math.abs(drag.y)) / 120, 1)
    : leaving ? 1 : 0

  return (
    <div className="relative flex-1 min-h-0 select-none">
      {hint && (
        <div
          className={`pointer-events-none absolute z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-gray-900/80 text-sm font-bold ${SWIPES[hint].tone} ${SWIPES[hint].ring} ${
            hint === 'right' ? 'right-4 top-6' : hint === 'left' ? 'left-4 top-6' : 'left-1/2 -translate-x-1/2 ' + (hint === 'up' ? 'top-4' : 'bottom-4')
          }`}
          style={{ opacity: hintStrength }}
        >
          <span>{SWIPES[hint].glyph}</span>{SWIPES[hint].label}
        </div>
      )}

      <div
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        style={{ transform, transition, touchAction: scrollable ? 'pan-y' : 'none' }}
        className={`absolute inset-0 bg-gray-800 rounded-2xl border ${accent.ring} shadow-lg`}
      >
        <div
          ref={scrollRef}
          className={`h-full overflow-y-auto overscroll-contain px-5 py-6 flex flex-col gap-4 ${
            flipped ? 'justify-start text-left' : 'justify-center items-center text-center'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
