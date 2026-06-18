import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getRows, appendRow } from '../../services/sheets'
import { SHEETS } from '../../config'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

function today() {
  return new Date().toISOString().split('T')[0]
}

function uid() {
  return Date.now().toString(36)
}

export default function FoodTab() {
  const { spreadsheetId } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ meal_type: 'Breakfast', food_name: '', quantity: '', unit: 'g', calories: '' })
  const [saving, setSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())

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

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const row = [uid(), selectedDate, form.meal_type, form.food_name, form.quantity, form.unit, form.calories]
      await appendRow(spreadsheetId, SHEETS.FOOD, row)
      await load()
      setForm({ meal_type: 'Breakfast', food_name: '', quantity: '', unit: 'g', calories: '' })
      setShowForm(false)
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  const todayRows = rows.filter(r => r.date === selectedDate)
  const totalCalories = todayRows.reduce((sum, r) => sum + (parseFloat(r.calories) || 0), 0)

  const byMeal = MEAL_TYPES.reduce((acc, m) => {
    acc[m] = todayRows.filter(r => r.meal_type === m)
    return acc
  }, {})

  return (
    <div className="px-4 py-4">
      {/* Date picker + summary */}
      <div className="flex items-center justify-between mb-4">
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
                  {byMeal[meal].map(r => (
                    <div key={r.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                      <div>
                        <span className="text-white text-sm">{r.food_name}</span>
                        <span className="text-gray-500 text-xs ml-2">{r.quantity}{r.unit}</span>
                      </div>
                      <span className="text-indigo-400 text-sm font-medium">{r.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Add form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleAdd}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 w-full rounded-t-2xl p-5 space-y-3"
          >
            <h2 className="text-white font-semibold text-base mb-1">Log Food</h2>
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
            <input
              required placeholder="Food name"
              value={form.food_name} onChange={e => setForm(f => ({ ...f, food_name: e.target.value }))}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <input
                placeholder="Qty" type="number"
                value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
              />
              <select
                value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700"
              >
                {['g', 'ml', 'oz', 'cup', 'tbsp', 'piece'].map(u => <option key={u}>{u}</option>)}
              </select>
              <input
                required placeholder="kcal" type="number"
                value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))}
                className="w-1/3 bg-gray-800 text-white rounded-lg px-3 py-2.5 text-sm border border-gray-700 outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit" disabled={saving}
              className="w-full bg-indigo-600 text-white font-medium py-3 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Entry'}
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-600 text-white rounded-full text-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  )
}
