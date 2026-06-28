export const CATEGORIES = ['Work', 'Personal', 'Play']

// Tile background, used regardless of done state — done is indicated separately (checkmark + dim).
export const CATEGORY_COLORS = {
  Work: 'bg-blue-600/80 text-white',
  Personal: 'bg-purple-600/80 text-white',
  Play: 'bg-green-600/80 text-white',
}

export const CATEGORY_DOT = {
  Work: 'bg-blue-500',
  Personal: 'bg-purple-500',
  Play: 'bg-green-500',
}

export const DEFAULT_TILE_COLOR = 'bg-gray-700/80 text-gray-200'

export function tileColorFor(category) {
  return CATEGORY_COLORS[category] || DEFAULT_TILE_COLOR
}
