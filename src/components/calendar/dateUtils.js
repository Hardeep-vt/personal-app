export function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr() {
  return toDateStr(new Date())
}

export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

// Returns the 7 date strings (Sun-Sat) of the week containing dateStr.
export function weekDates(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const sunday = addDays(dateStr, -d.getDay())
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i))
}

export function timeToMinutes(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function formatTimeLabel(hour) {
  const h = hour % 24
  const period = h < 12 ? 'AM' : 'PM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display} ${period}`
}

export function formatTimeRange(start, end) {
  const fmt = (t) => {
    const [h, m] = t.split(':').map(Number)
    const period = h < 12 ? 'AM' : 'PM'
    const display = h % 12 === 0 ? 12 : h % 12
    return m ? `${display}:${String(m).padStart(2, '0')} ${period}` : `${display} ${period}`
  }
  return `${fmt(start)} – ${fmt(end)}`
}

export function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

// Assigns each tile a {_col, _cols} pair so overlapping tiles split into side-by-side columns
// instead of stacking on top of each other. Tiles must have start_time/end_time fields.
export function layoutTiles(items) {
  const withRange = items.map(it => {
    const start = timeToMinutes(it.start_time)
    const end = Math.max(timeToMinutes(it.end_time), start + 1)
    return { ...it, _start: start, _end: end }
  })
  const sorted = [...withRange].sort((a, b) => a._start - b._start)

  const clusters = []
  let current = []
  let clusterMaxEnd = -Infinity
  for (const item of sorted) {
    if (current.length === 0 || item._start < clusterMaxEnd) {
      current.push(item)
      clusterMaxEnd = Math.max(clusterMaxEnd, item._end)
    } else {
      clusters.push(current)
      current = [item]
      clusterMaxEnd = item._end
    }
  }
  if (current.length) clusters.push(current)

  const result = []
  for (const cluster of clusters) {
    const columnEnds = [] // columnEnds[c] = end time of the last item placed in column c
    for (const item of cluster) {
      let col = columnEnds.findIndex(end => end <= item._start)
      if (col === -1) {
        col = columnEnds.length
        columnEnds.push(item._end)
      } else {
        columnEnds[col] = item._end
      }
      item._col = col
    }
    for (const item of cluster) {
      item._cols = columnEnds.length
      result.push(item)
    }
  }
  return result
}
