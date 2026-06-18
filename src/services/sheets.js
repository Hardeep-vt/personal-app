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
  return res.json()
}

export async function getOrCreateSpreadsheet(name) {
  const stored = localStorage.getItem('spreadsheet_id')
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
    localStorage.setItem('spreadsheet_id', id)
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
      ],
    }),
  })

  await writeHeaders(created.spreadsheetId)
  localStorage.setItem('spreadsheet_id', created.spreadsheetId)
  return created.spreadsheetId
}

async function ensureSheets(spreadsheetId) {
  const meta = await req(`${BASE}/${spreadsheetId}`)
  const existing = meta.sheets.map(s => s.properties.title)
  const needed = ['people', 'interactions']
  const toCreate = needed.filter(n => !existing.includes(n))
  if (toCreate.length === 0) return

  await req(`${BASE}/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({
      requests: toCreate.map(title => ({ addSheet: { properties: { title } } })),
    }),
  })
  await writePeopleHeaders(spreadsheetId)
}

async function writeHeaders(spreadsheetId) {
  const headers = [
    { range: 'food_log!A1', values: [['id', 'date', 'meal_type', 'food_name', 'quantity', 'unit', 'calories']] },
    { range: 'exercise_log!A1', values: [['id', 'date', 'exercise_type', 'duration_min', 'sets', 'reps', 'weight_kg', 'notes']] },
    { range: 'notes!A1', values: [['id', 'title', 'body', 'tags', 'created_at', 'updated_at']] },
    { range: 'todos!A1', values: [['id', 'title', 'description', 'horizon', 'context', 'priority', 'due_date', 'status', 'created_at']] },
    { range: 'people!A1', values: [['id', 'name', 'birthday', 'relationship', 'how_met', 'location', 'tags', 'notes', 'created_at', 'updated_at']] },
    { range: 'interactions!A1', values: [['id', 'person_id', 'date', 'summary', 'created_at']] },
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
