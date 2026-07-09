export const METRIC_TYPES = ['number', 'boolean', 'scale', 'text']

export const METRIC_TYPE_LABELS = {
  number: 'Number',
  boolean: 'Yes / No',
  scale: 'Scale (1–5)',
  text: 'Free text',
}

export const METRIC_EXAMPLES = [
  { name: 'Social media (min)', type: 'number', unit: 'min' },
  { name: 'Phone pickups', type: 'number', unit: 'times' },
  { name: 'Slept well', type: 'boolean', unit: '' },
  { name: 'Mood', type: 'scale', unit: '' },
  { name: "Today's notes", type: 'text', unit: '' },
]

export function sortMetrics(metrics) {
  return [...metrics].sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
}
