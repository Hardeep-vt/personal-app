const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

function getToken() {
  return sessionStorage.getItem('gtoken')
}

async function req(url, options = {}) {
  const token = getToken()
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : {}
}

export async function getOrCreateSpreadsheet(name, storageKey = 'spreadsheet_id') {
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    await ensureSheets(stored)
    return stored
  }

  const search = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${name}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    { headers: { Authorization: `Bearer ${getToken()}` } }
  ).then(r => r.json())

  if (search.files?.length > 0) {
    const id = search.files[0].id
    localStorage.setItem(storageKey, id)
    await ensureSheets(id)
    return id
  }

  const created = await req('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    body: JSON.stringify({
      properties: { title: name },
      sheets: [
        { properties: { title: 'food_log' } },
        { properties: { title: 'exercise_log' } },
        { properties: { title: 'notes' } },
        { properties: { title: 'todos' } },
        { properties: { title: 'people' } },
        { properties: { title: 'interactions' } },
        { properties: { title: 'meal_times' } },
        { properties: { title: 'trash' } },
        { properties: { title: 'calendar_events' } },
        { properties: { title: 'recurring_templates' } },
        { properties: { title: 'habit_completions' } },
      ],
    }),
  })

  await writeHeaders(created.spreadsheetId)
  localStorage.setItem(storageKey, created.spreadsheetId)
  return created.spreadsheetId
}

async function ensureSheets(spreadsheetId) {
  const meta = await req(`${BASE}/${spreadsheetId}`)
  const existing = meta.sheets.map(s => s.properties.title)
  const needed = ['people', 'interactions', 'meal_times', 'trash', 'calendar_events', 'recurring_templates', 'habit_completions']
  const toCreate = needed.filter(n => !existing.includes(n))
  if (toCreate.length > 0) {
    await req(`${BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: toCreate.map(title => ({ addSheet: { properties: { title } } })),
      }),
    })
    if (toCreate.includes('people') || toCreate.includes('interactions')) await writePeopleHeaders(spreadsheetId)
    if (toCreate.includes('meal_times')) await writeMealTimesHeaders(spreadsheetId)
    if (toCreate.includes('trash')) await writeTrashHeaders(spreadsheetId)
    if (toCreate.includes('calendar_events')) await writeCalendarHeaders(spreadsheetId)
    if (toCreate.includes('recurring_templates')) await writeRecurringTemplateHeaders(spreadsheetId)
    if (toCreate.includes('habit_completions')) await writeHabitCompletionHeaders(spreadsheetId)
  }
  await ensureFoodMacroHeaders(spreadsheetId)
  await ensureCalendarEventHeaders(spreadsheetId)
  await ensureRecurringTemplateHeaders(spreadsheetId)
}

async function writeTrashHeaders(spreadsheetId) {
  await req(`${BASE}/${spreadsheetId}/values/trash!A1:E1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['id', 'sheet', 'original_id', 'data', 'deleted_at']] }),
  })
}

async function writeCalendarHeaders(spreadsheetId) {
  await req(`${BASE}/${spreadsheetId}/values/calendar_events!A1:I1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['id', 'title', 'date', 'start_time', 'end_time', 'todo_id', 'status', 'category', 'description']] }),
  })
}

async function writeRecurringTemplateHeaders(spreadsheetId) {
  await req(`${BASE}/${spreadsheetId}/values/recurring_templates!A1:H1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['id', 'title', 'days_of_week', 'start_time', 'end_time', 'category', 'active', 'description']] }),
  })
}

// Backfills the description/category columns for calendar_events sheets created before they existed.
async function ensureCalendarEventHeaders(spreadsheetId) {
  const data = await req(`${BASE}/${spreadsheetId}/values/calendar_events!1:1`)
  const headers = data.values?.[0] || []
  if (headers.includes('description') && headers.includes('category')) return
  const newHeaders = ['id', 'title', 'date', 'start_time', 'end_time', 'todo_id', 'status', 'category', 'description']
  await req(`${BASE}/${spreadsheetId}/values/calendar_events!A1:I1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [newHeaders] }),
  })
}

// Backfills the description column for recurring_templates sheets created before it existed.
async function ensureRecurringTemplateHeaders(spreadsheetId) {
  const data = await req(`${BASE}/${spreadsheetId}/values/recurring_templates!1:1`)
  const headers = data.values?.[0] || []
  if (headers.includes('description')) return
  const newHeaders = ['id', 'title', 'days_of_week', 'start_time', 'end_time', 'category', 'active', 'description']
  await req(`${BASE}/${spreadsheetId}/values/recurring_templates!A1:H1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [newHeaders] }),
  })
}

async function writeHabitCompletionHeaders(spreadsheetId) {
  await req(`${BASE}/${spreadsheetId}/values/habit_completions!A1:C1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['template_id', 'date', 'completed_at']] }),
  })
}

async function writeMealTimesHeaders(spreadsheetId) {
  await req(`${BASE}/${spreadsheetId}/values/meal_times!A1:C1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [['date', 'meal_type', 'time']] }),
  })
}

async function ensureFoodMacroHeaders(spreadsheetId) {
  const data = await req(`${BASE}/${spreadsheetId}/values/food_log!1:1`)
  const headers = data.values?.[0] || []
  if (headers.includes('health')) return
  const newHeaders = ['id', 'date', 'meal_type', 'food_name', 'quantity', 'unit', 'calories', 'protein', 'fat', 'carbs', 'health']
  await req(`${BASE}/${spreadsheetId}/values/food_log!A1:K1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [newHeaders] }),
  })
}

async function writeHeaders(spreadsheetId) {
  const headers = [
    { range: 'food_log!A1', values: [['id', 'date', 'meal_type', 'food_name', 'quantity', 'unit', 'calories', 'protein', 'fat', 'carbs', 'health']] },
    { range: 'exercise_log!A1', values: [['id', 'date', 'exercise_type', 'duration_min', 'sets', 'reps', 'weight_kg', 'notes']] },
    { range: 'notes!A1', values: [['id', 'title', 'body', 'tags', 'created_at', 'updated_at']] },
    { range: 'todos!A1', values: [['id', 'title', 'description', 'horizon', 'context', 'priority', 'due_date', 'status', 'created_at']] },
    { range: 'people!A1', values: [['id', 'name', 'birthday', 'relationship', 'how_met', 'location', 'tags', 'notes', 'created_at', 'updated_at']] },
    { range: 'interactions!A1', values: [['id', 'person_id', 'date', 'summary', 'created_at']] },
    { range: 'meal_times!A1', values: [['date', 'meal_type', 'time']] },
    { range: 'trash!A1', values: [['id', 'sheet', 'original_id', 'data', 'deleted_at']] },
    { range: 'calendar_events!A1', values: [['id', 'title', 'date', 'start_time', 'end_time', 'todo_id', 'status', 'category', 'description']] },
    { range: 'recurring_templates!A1', values: [['id', 'title', 'days_of_week', 'start_time', 'end_time', 'category', 'active', 'description']] },
    { range: 'habit_completions!A1', values: [['template_id', 'date', 'completed_at']] },
  ]
  await req(`${BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ valueInputOption: 'RAW', data: headers }),
  })
}

async function writePeopleHeaders(spreadsheetId) {
  const headers = [
    { range: 'people!A1', values: [['id', 'name', 'birthday', 'relationship', 'how_met', 'location', 'tags', 'notes', 'created_at', 'updated_at']] },
    { range: 'interactions!A1', values: [['id', 'person_id', 'date', 'summary', 'created_at']] },
  ]
  await req(`${BASE}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ valueInputOption: 'RAW', data: headers }),
  })
}

export async function getRows(spreadsheetId, sheet) {
  const data = await req(`${BASE}/${spreadsheetId}/values/${sheet}`)
  const rows = data.values || []
  if (rows.length < 2) return []
  const [headers, ...body] = rows
  return body.map(row => Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ''])))
}

export async function appendRow(spreadsheetId, sheet, row) {
  await req(`${BASE}/${spreadsheetId}/values/${sheet}!A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    method: 'POST',
    body: JSON.stringify({ values: [row] }),
  })
}

export async function updateRow(spreadsheetId, sheet, rowIndex, row) {
  const sheetRow = rowIndex + 2
  const colLetter = String.fromCharCode(64 + row.length)
  await req(`${BASE}/${spreadsheetId}/values/${sheet}!A${sheetRow}:${colLetter}${sheetRow}?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({ values: [row] }),
  })
}

export async function deleteRow(spreadsheetId, sheet, rowIndex) {
  const meta = await req(`${BASE}/${spreadsheetId}`)
  const sheetMeta = meta.sheets.find(s => s.properties.title === sheet)
  const sheetId = sheetMeta.properties.sheetId

  await req(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex + 1, endIndex: rowIndex + 2 },
        },
      }],
    }),
  })
}

function trashId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// Moves a row to the trash sheet instead of permanently deleting it.
export async function softDeleteRow(spreadsheetId, sheet, rowIndex, rowObj) {
  const trashRow = [trashId(), sheet, rowObj.id || '', JSON.stringify(rowObj), new Date().toISOString()]
  await appendRow(spreadsheetId, 'trash', trashRow)
  await deleteRow(spreadsheetId, sheet, rowIndex)
}

export async function getTrash(spreadsheetId) {
  return getRows(spreadsheetId, 'trash')
}

// Restores a trashed row back to its original sheet, then removes it from trash.
export async function restoreTrashRow(spreadsheetId, trashRowIndex, trashRowObj) {
  const data = JSON.parse(trashRowObj.data)
  const headerData = await req(`${BASE}/${spreadsheetId}/values/${trashRowObj.sheet}!1:1`)
  const headers = headerData.values?.[0] || Object.keys(data)
  const row = headers.map(h => data[h] ?? '')
  await appendRow(spreadsheetId, trashRowObj.sheet, row)
  await deleteRow(spreadsheetId, 'trash', trashRowIndex)
}

export async function purgeTrashRow(spreadsheetId, trashRowIndex) {
  await deleteRow(spreadsheetId, 'trash', trashRowIndex)
}

// Permanently removes trash entries older than maxAgeDays.
export async function purgeOldTrash(spreadsheetId, maxAgeDays = 30) {
  const rows = await getTrash(spreadsheetId)
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  const toDelete = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => new Date(r.deleted_at).getTime() < cutoff)
    .sort((a, b) => b.i - a.i)
  for (const { i } of toDelete) {
    await deleteRow(spreadsheetId, 'trash', i)
  }
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

// --- calendar_events ---

export async function createCalendarEvent(spreadsheetId, { title, date, start_time, end_time, todo_id = '', category = '', description = '' }) {
  const row = [genId(), title, date, start_time, end_time, todo_id, 'pending', category, description]
  await appendRow(spreadsheetId, 'calendar_events', row)
}

export async function updateCalendarEvent(spreadsheetId, rowIndex, row) {
  await updateRow(spreadsheetId, 'calendar_events', rowIndex, [
    row.id, row.title, row.date, row.start_time, row.end_time, row.todo_id || '', row.status || 'pending', row.category || '', row.description || '',
  ])
}

export async function setCalendarEventStatus(spreadsheetId, rowIndex, row, status) {
  await updateCalendarEvent(spreadsheetId, rowIndex, { ...row, status })
}

// --- recurring_templates ---

export async function createRecurringTemplate(spreadsheetId, { title, days_of_week, start_time, end_time, category = '', description = '' }) {
  const row = [genId(), title, days_of_week.join(','), start_time, end_time, category, 'true', description]
  await appendRow(spreadsheetId, 'recurring_templates', row)
}

export async function updateRecurringTemplate(spreadsheetId, rowIndex, row) {
  const days = Array.isArray(row.days_of_week) ? row.days_of_week.join(',') : row.days_of_week
  await updateRow(spreadsheetId, 'recurring_templates', rowIndex, [
    row.id, row.title, days, row.start_time, row.end_time, row.category || '', String(row.active), row.description || '',
  ])
}

// --- habit_completions ---

export async function markHabitDone(spreadsheetId, templateId, date) {
  await appendRow(spreadsheetId, 'habit_completions', [templateId, date, new Date().toISOString()])
}

export async function unmarkHabitDone(spreadsheetId, templateId, date) {
  const rows = await getRows(spreadsheetId, 'habit_completions')
  const idx = rows.findIndex(r => r.template_id === templateId && r.date === date)
  if (idx !== -1) await deleteRow(spreadsheetId, 'habit_completions', idx)
}

// Expands active recurring_templates into virtual occurrence tiles for each date in [startDate, endDate] (inclusive, 'YYYY-MM-DD' strings).
// Marks an occurrence done if a matching habit_completions row exists.
export function expandRecurringOccurrences(templates, completions, startDate, endDate) {
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const occurrences = []
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')

  for (const tmpl of templates.filter(t => t.active === 'true' || t.active === true)) {
    const days = (tmpl.days_of_week || '').split(',').map(d => d.trim()).filter(Boolean)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayLabel = DOW[d.getDay()]
      if (!days.includes(dayLabel)) continue
      const date = d.toISOString().slice(0, 10)
      const done = completions.some(c => c.template_id === tmpl.id && c.date === date)
      occurrences.push({
        templateId: tmpl.id,
        title: tmpl.title,
        date,
        start_time: tmpl.start_time,
        end_time: tmpl.end_time,
        category: tmpl.category,
        description: tmpl.description,
        done,
      })
    }
  }
  return occurrences
}

// --- Drive backups ---

const DRIVE_BASE = 'https://www.googleapis.com/drive/v3/files'
const BACKUP_FOLDER_NAME = 'personal-app-backups'
const BACKUP_KEEP = 14

async function getOrCreateBackupFolder() {
  const q = `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const search = await req(`${DRIVE_BASE}?q=${encodeURIComponent(q)}`)
  if (search.files?.length > 0) return search.files[0].id
  const created = await req(DRIVE_BASE, {
    method: 'POST',
    body: JSON.stringify({ name: BACKUP_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }),
  })
  return created.id
}

async function pruneOldBackups(folderId) {
  const q = `'${folderId}' in parents and trashed=false`
  const list = await req(`${DRIVE_BASE}?q=${encodeURIComponent(q)}&orderBy=createdTime&fields=files(id,createdTime)`)
  const files = list.files || []
  const toDelete = files.slice(0, Math.max(0, files.length - BACKUP_KEEP))
  for (const f of toDelete) {
    await req(`${DRIVE_BASE}/${f.id}`, { method: 'DELETE' })
  }
}

// Copies the spreadsheet into a Drive backups folder and prunes old copies beyond BACKUP_KEEP.
export async function backupSpreadsheet(spreadsheetId, spreadsheetName) {
  const folderId = await getOrCreateBackupFolder()
  const stamp = new Date().toISOString().slice(0, 10)
  await req(`${DRIVE_BASE}/${spreadsheetId}/copy`, {
    method: 'POST',
    body: JSON.stringify({ name: `${spreadsheetName} backup ${stamp}`, parents: [folderId] }),
  })
  await pruneOldBackups(folderId)
}

// Runs backupSpreadsheet at most once per calendar day per spreadsheet, tracked in localStorage.
export async function maybeRunDailyBackup(spreadsheetId, spreadsheetName) {
  const key = `last_backup_${spreadsheetId}`
  const today = new Date().toISOString().slice(0, 10)
  if (localStorage.getItem(key) === today) return
  try {
    await backupSpreadsheet(spreadsheetId, spreadsheetName)
    localStorage.setItem(key, today)
  } catch (e) {
    console.error('Daily backup failed', e)
  }
}
