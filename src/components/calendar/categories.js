export const CATEGORIES = ['Work', 'Personal', 'Play']

// Tile background for not-yet-done tiles. Done tiles override to green (see DONE_COLOR below),
// so Play uses a different color to stay distinguishable from "done".
export const CATEGORY_COLORS = {
  Work: 'bg-blue-600/80 text-white',
  Personal: 'bg-purple-600/80 text-white',
  Play: 'bg-orange-600/80 text-white',
}

export const CATEGORY_DOT = {
  Work: 'bg-blue-500',
  Personal: 'bg-purple-500',
  Play: 'bg-orange-500',
}

export const DONE_COLOR = 'bg-emerald-600/80 text-white'
export const NOT_DONE_COLOR = 'bg-red-600/80 text-white'

export const DEFAULT_TILE_COLOR = 'bg-gray-700/80 text-gray-200'

export function tileColorFor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_TILE_COLOR
}

// status is 'done' | 'not_done' | 'pending'. Pending falls back to the category color.
export function colorForStatus(status, category) {
  if (status === 'done') return DONE_COLOR
  if (status === 'not_done') return NOT_DONE_COLOR
  return tileColorFor(category)
}
