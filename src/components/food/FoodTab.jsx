import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRows, appendRow, updateRow, deleteRow } from '../../services/sheets'
import { SHEETS } from '../../config'
import indianFoods from '../../data/indianFoods'
import NutritionDashboard from './NutritionDashboard'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function today() {
  return new Date().toISOString().split('T')[0]
}

function uid() {
  return Date.now().toString(36)
}

const HEALTH_COLORS = {
  green: { bg: 'border-l-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-400' },
  orange: { bg: 'border-l-amber-500', dot: 'bg-amber-500', text: 'text-amber-400' },
  red: { bg: 'border-l-red-400', dot: 'bg-red-400', text: 'text-red-400' },
}

function lookupHealth(foodName) {
  const match = indianFoods.find(f => f.name.toLowerCase() === foodName?.toLowerCase())
  return match?.health || null
}

function MacroBar({ label, value, color, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-gray-500 text-xs">{label}</span>
        <span className={`text-xs font-medium ${color}`}>{Math.round(value)}g</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [apiResults, setApiResults] = useState([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef(null)

  function handleChange(val) {
    setQuery(val)
    if (!val.trim()) {
      setSuggestions([])
      setApiResults([])
      return
    }

    const q = val.toLowerCase()
    const local = indianFoods
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, 8)
    setSuggestions(local)

    clearTimeout(debounceRef.current)
    if (local.length < 3 && val.length >= 3) {
      debounceRef.current = setTimeout(() => searchAPI(val), 500)
    }
  }

  async function searchAPI(q) {
    setSearching(true)
    try {
      const res = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(q)}`, {
        headers: { 'X-Api-Key': 'free' },
      })
      if (res.ok) {
        const data = await res.json()
        const mapped = (data.items || []).map(item => ({
          name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
          calories: Math.round(item.calories),
          protein: Math.round(item.protein_g || 0),
          fat: Math.round(item.fat_total_g || 0),
          carbs: Math.round(item.carbohydrates_total_g || 0),
          unit: 'serving',
          quantity: 1,
          fromAPI: true,
        }))
        setApiResults(mapped.slice(0, 5))
      }
    } catch (e) {
      console.error(e)
    }
    setSearching(false)
  }

  const allResults = [...suggestions, ...apiResults.filter(a => !suggestions.some(s => s.name.toLowerCase() === a.name.toLowerCase()))]

  return (
    <div>
      <input
        placeholder="Search food (e.g. roti, dal, biryani)…"
        value={query}
        onChange={e => handleChange(e.target.value)}
        className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
        autoFocus
      />
      {query.trim() && (
        <div className="mt-1 max-h-48 overflow-y-auto rounded-lg bg-gray-800 border border-gray-700">
          {allResults.length === 0 && !searching && (
            <div className="px-3 py-2 text-gray-500 text-xs">No matches. Type the name and enter calories manually.</div>
          )}
          {allResults.map((item, i) => {
            const hc = HEALTH_COLORS[item.health] || {}
            return (
              <button
                key={item.name + i}
                type="button"
                onClick={() => { onSelect(item); setQuery(''); setSuggestions([]); setApiResults([]) }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-700 active:bg-gray-700 border-b border-gray-700 last:border-0 ${item.health ? 'border-l-2 ' + hc.bg : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.health && <div className={`w-2 h-2 rounded-full shrink-0 ${hc.dot}`} />}
                    <span className="text-white text-sm">{item.name}</span>
                    <span className="text-gray-500 text-xs">per {item.unit}</span>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium">{item.calories} kcal</span>
                </div>
                <div className="flex gap-3 mt-0.5 text-xs ml-4">
                  <span className="text-blue-400">P {item.protein}g</span>
                  <span className="text-amber-400">F {item.fat}g</span>
                  <span className="text-green-400">C {item.carbs}g</span>
                </div>
              </button>
            )
          })}
          {searching && (
            <div className="px-3 py-2 text-gray-500 text-xs flex items-center gap-2">
              <div className="w-3 h-3 border border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Searching online…
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function FoodTab() {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ meal_type: 'Breakfast', food_name: '', quantity: '', unit: 'g', calories: '', protein: '', fat: '', carbs: '', health: '' })
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())
  const [view, setView] = useState('log')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await getRows(spreadsheetId, SHEETS.FOOD)
      setRows(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this entry?')) return
    try {
      const allRows = await getRows(spreadsheetId, SHEETS.FOOD)
      const idx = allRows.findIndex(r => r.id === id)
      if (idx !== -1) await deleteRow(spreadsheetId, SHEETS.FOOD, idx)
      setRows(prev => prev.filter(r => r.id !== id))
    } catch (e) { console.error(e) }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        const allRows = await getRows(spreadsheetId, SHEETS.FOOD)
        const idx = allRows.findIndex(r => r.id === editingId)
        if (idx !== -1) {
          const row = [editingId, selectedDate, form.meal_type, form.food_name, form.quantity, form.unit, form.calories, form.protein || '0', form.fat || '0', form.carbs || '0', form.health || '']
          await updateRow(spreadsheetId, SHEETS.FOOD, idx, row)
        }
      } else {
        const row = [uid(), selectedDate, form.meal_type, form.food_name, form.quantity, form.unit, form.calories, form.protein || '0', form.fat || '0', form.carbs || '0', form.health || '']
        await appendRow(spreadsheetId, SHEETS.FOOD, row)
      }
      await load()
      closeForm()
    } catch (e) {
      console.error(e)
      alert('Failed to save. Please try again.')
    }
    setSaving(false)
  }

  function closeForm() {
    baseRef.current = null
    setEditingId(null)
    setForm({ meal_type: 'Breakfast', food_name: '', quantity: '', unit: 'g', calories: '', protein: '', fat: '', carbs: '', health: '' })
    setShowForm(false)
  }

  function handleEdit(r) {
    setEditingId(r.id)
    setForm({
      meal_type: r.meal_type,
      food_name: r.food_name,
      quantity: r.quantity,
      unit: r.unit,
      calories: r.calories,
      protein: r.protein || '0',
      fat: r.fat || '0',
      carbs: r.carbs || '0',
      health: r.health || '',
    })
    baseRef.current = null
    setShowForm(true)
  }

  const baseRef = useRef(null)

  function handleFoodSelect(item) {
    const base = { calories: item.calories, protein: item.protein || 0, fat: item.fat || 0, carbs: item.carbs || 0, quantity: item.quantity || 1 }
    baseRef.current = base
    setForm(f => ({
      ...f,
      food_name: item.name,
      quantity: String(base.quantity),
      unit: item.unit,
      calories: String(base.calories),
      protein: String(base.protein),
      fat: String(base.fat),
      carbs: String(base.carbs),
      health: item.health || '',
    }))
  }

  function handleQuantityChange(val) {
    const qty = parseFloat(val)
    if (baseRef.current && !isNaN(qty)) {
      const b = baseRef.current
      const ratio = qty / b.quantity
      setForm(f => ({
        ...f,
        quantity: val,
        calories: String(Math.round(b.calories * ratio)),
        protein: String(Math.round(b.protein * ratio)),
        fat: String(Math.round(b.fat * ratio)),
        carbs: String(Math.round(b.carbs * ratio)),
      }))
    } else {
      setForm(f => ({ ...f, quantity: val }))
    }
  }

  const todayRows = rows.filter(r => r.date === selectedDate)
  const totalCalories = todayRows.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0)
  const totalProtein = todayRows.reduce((sum, r) => sum + (parseFloat(r.protein) || 0), 0)
  const totalFat = todayRows.reduce((sum, r) => sum + (parseFloat(r.fat) || 0), 0)
  const totalCarbs = todayRows.reduce((sum, r) => sum + (parseFloat(r.carbs) || 0), 0)

  const byMeal = MEAL_TYPES.reduce((acc, m) => {
    acc[m] = todayRows.filter(r => r.meal_type === m)
    return acc
  }, {})

  return (
    <div className="px-4 py-4">
      {/* View toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setView('log')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'log' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Daily Log
        </button>
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
          }`}
        >
          Dashboard
        </button>
      </div>

      {view === 'dashboard' ? (
        loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <NutritionDashboard rows={rows} />
        )
      ) : (
      <>
      <div className="flex items-center justify-between mb-3">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700"
        />
        <div className="text-right">
          <div className="text-2xl font-bold text-indigo-400">{Math.round(totalCalories)}</div>
          <div className="text-gray-500 text-xs">kcal today</div>
        </div>
      </div>

      {/* Macro summary */}
      <div className="flex gap-3 mb-4">
        <MacroBar label="Protein" value={totalProtein} color="text-blue-400" max={150} />
        <MacroBar label="Fat" value={totalFat} color="text-amber-400" max={80} />
        <MacroBar label="Carbs" value={totalCarbs} color="text-green-400" max={300} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {MEAL_TYPES.map(meal => (
            <div key={meal} className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{meal}</h3>
                <span className="text-gray-600 text-xs">
                  {Math.round(byMeal[meal].reduce((s, r) => s + (parseFloat(r.calories) || 0), 0))} kcal
                </span>
              </div>
              {byMeal[meal].length === 0 ? (
                <p className="text-gray-700 text-xs py-2">Nothing logged</p>
              ) : (
                <div className="space-y-1">
                  {byMeal[meal].map(r => {
                    const health = r.health || lookupHealth(r.food_name)
                    const hc = HEALTH_COLORS[health] || {}
                    return (
                    <div key={r.id} onClick={() => handleEdit(r)} className={`bg-gray-800 rounded-lg px-3 py-2 active:bg-gray-700 cursor-pointer ${health ? 'border-l-2 ' + hc.bg : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {health && <div className={`w-2 h-2 rounded-full shrink-0 ${hc.dot}`} />}
                          <span className="text-white text-sm">{r.food_name}</span>
                          <span className="text-gray-500 text-xs">{r.quantity} {r.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 text-sm font-medium">{r.calories} kcal</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(r.id) }} className="text-gray-600 active:text-red-400 text-base px-1">🗑</button>
                        </div>
                      </div>
                      {(r.protein || r.fat || r.carbs) && (
                        <div className="flex gap-3 mt-0.5 text-xs ml-4">
                          <span className="text-blue-400">P {r.protein}g</span>
                          <span className="text-amber-400">F {r.fat}g</span>
                          <span className="text-green-400">C {r.carbs}g</span>
                        </div>
                      )}
                    </div>
                  )})}

                </div>
              )}
            </div>
          ))}
        </>
      )}
      </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={closeForm}>
          <form
            onSubmit={handleAdd}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto"
          >
            <h2 className="text-white font-semibold text-base mb-1">{editingId ? 'Edit Food' : 'Log Food'}</h2>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(m => (
                <button
                  key={m} type="button"
                  onClick={() => setForm(f => ({ ...f, meal_type: m }))}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.meal_type === m ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <FoodSearch onSelect={handleFoodSelect} />

            {form.food_name && (
              <div className="bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-sm">{form.food_name}</span>
                  <button type="button" onClick={() => { baseRef.current = null; setForm(f => ({ ...f, food_name: '', calories: '', quantity: '', unit: 'g', protein: '', fat: '', carbs: '', health: '' })) }} className="text-gray-500 text-xs">✕ Clear</button>
                </div>
                {(form.protein || form.fat || form.carbs) && (
                  <div className="flex gap-3 mt-0.5 text-xs">
                    <span className="text-blue-400">P {form.protein}g</span>
                    <span className="text-amber-400">F {form.fat}g</span>
                    <span className="text-green-400">C {form.carbs}g</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <input
                placeholder="Qty" type="number" step="any"
                value={form.quantity} onChange={e => handleQuantityChange(e.target.value)}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
              />
              <select
                value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              >
                {['g', 'ml', 'oz', 'cup', 'tbsp', 'piece', 'plate', 'glass', 'serving', 'slice', 'medium', 'can', 'bottle', 'pint', 'scoop', 'ear', '6 inch', '30ml peg', '30ml shot', '6 pieces', '10 pieces', '4 pieces', '7 halves', 'handful', 'packet', 'scoop+milk', 'leg+thigh', '100g', 'tsp'].map(u => <option key={u}>{u}</option>)}
              </select>
              <input
                required placeholder="kcal" type="number"
                value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-blue-400 text-xs mb-0.5 block">Protein (g)</label>
                <input
                  placeholder="0" type="number"
                  value={form.protein} onChange={e => setForm(f => ({ ...f, protein: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-amber-400 text-xs mb-0.5 block">Fat (g)</label>
                <input
                  placeholder="0" type="number"
                  value={form.fat} onChange={e => setForm(f => ({ ...f, fat: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-green-400 text-xs mb-0.5 block">Carbs (g)</label>
                <input
                  placeholder="0" type="number"
                  value={form.carbs} onChange={e => setForm(f => ({ ...f, carbs: e.target.value }))}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 outline-none focus:border-green-500"
                />
              </div>
            </div>

            <button
              type="submit" disabled={saving || !form.food_name}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : editingId ? 'Update Entry' : 'Add Entry'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => { setEditingId(null); setForm({ meal_type: 'Breakfast', food_name: '', quantity: '', unit: 'g', calories: '', protein: '', fat: '', carbs: '', health: '' }); setShowForm(true) }}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform z-40"
      >
        +
      </button>
    </div>
  )
}
