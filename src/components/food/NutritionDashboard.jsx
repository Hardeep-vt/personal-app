import { useState, useMemo, useEffect } from 'react'
import indianFoods from '../../data/indianFoods'

const PERIODS = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
]

function lookupHealth(foodName) {
  const match = indianFoods.find(f => f.name.toLowerCase() === foodName?.toLowerCase())
  return match?.health || null
}

function dateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function shortDay(dateString) {
  const d = new Date(dateString + 'T00:00:00')
  return d.toLocaleDateString('en', { weekday: 'narrow' })
}

function shortDate(dateString) {
  const d = new Date(dateString + 'T00:00:00')
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

function combineDateTime(dateString, timeString) {
  return new Date(`${dateString}T${timeString}:00`).getTime()
}

function formatTime12(timeString) {
  const [h, m] = timeString.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

function formatDuration(ms) {
  const totalMin = Math.max(0, Math.round(ms / 60000))
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
}

function useFastingStats(mealTimes) {
  return useMemo(() => {
    const byDate = {}
    mealTimes.forEach(t => {
      if (!t.time) return
      if (!byDate[t.date]) byDate[t.date] = []
      byDate[t.date].push(t.time)
    })
    Object.values(byDate).forEach(arr => arr.sort())
    const dates = Object.keys(byDate).sort()
    if (dates.length === 0) return null

    const lastDate = dates[dates.length - 1]
    const lastDateTimes = byDate[lastDate]
    const firstOfLast = lastDateTimes[0]
    const lastOfLast = lastDateTimes[lastDateTimes.length - 1]
    const lastMealEpoch = combineDateTime(lastDate, lastOfLast)

    let overnightMs = null
    if (dates.length > 1) {
      const prevDate = dates[dates.length - 2]
      const prevLastTime = byDate[prevDate][byDate[prevDate].length - 1]
      overnightMs = combineDateTime(lastDate, firstOfLast) - combineDateTime(prevDate, prevLastTime)
    }

    return {
      lastDate,
      lastOfLast,
      lastMealEpoch,
      overnightMs,
    }
  }, [mealTimes])
}

export default function NutritionDashboard({ rows, mealTimes = [] }) {
  const [period, setPeriod] = useState(7)
  const [now, setNow] = useState(() => Date.now())
  const fasting = useFastingStats(mealTimes)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const { days, avgCal, avgP, avgF, avgC, maxCal, healthPct, daysLogged, topFoods } = useMemo(() => {
    const now = new Date()
    const dates = []
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      dates.push(dateStr(d))
    }

    const days = dates.map(date => {
      const dayRows = rows.filter(r => r.date === date)
      return {
        date,
        cal: dayRows.reduce((s, r) => s + (parseFloat(r.calories) || 0), 0),
        p: dayRows.reduce((s, r) => s + (parseFloat(r.protein) || 0), 0),
        f: dayRows.reduce((s, r) => s + (parseFloat(r.fat) || 0), 0),
        c: dayRows.reduce((s, r) => s + (parseFloat(r.carbs) || 0), 0),
        count: dayRows.length,
        rows: dayRows,
      }
    })

    const activeDays = days.filter(d => d.count > 0)
    const daysLogged = activeDays.length
    const totalCal = activeDays.reduce((s, d) => s + d.cal, 0)
    const totalP = activeDays.reduce((s, d) => s + d.p, 0)
    const totalF = activeDays.reduce((s, d) => s + d.f, 0)
    const totalC = activeDays.reduce((s, d) => s + d.c, 0)
    const avgCal = daysLogged > 0 ? totalCal / daysLogged : 0
    const avgP = daysLogged > 0 ? totalP / daysLogged : 0
    const avgF = daysLogged > 0 ? totalF / daysLogged : 0
    const avgC = daysLogged > 0 ? totalC / daysLogged : 0
    const maxCal = Math.max(...days.map(d => d.cal), 1)

    const allPeriodRows = rows.filter(r => dates.includes(r.date))
    let green = 0, orange = 0, red = 0
    allPeriodRows.forEach(r => {
      const h = r.health || lookupHealth(r.food_name)
      if (h === 'green') green++
      else if (h === 'orange') orange++
      else if (h === 'red') red++
    })
    const total = green + orange + red || 1
    const healthPct = {
      green: Math.round((green / total) * 100),
      orange: Math.round((orange / total) * 100),
      red: Math.round((red / total) * 100),
    }

    const foodCount = {}
    allPeriodRows.forEach(r => {
      const name = r.food_name
      if (!foodCount[name]) foodCount[name] = { name, count: 0, cal: 0 }
      foodCount[name].count++
      foodCount[name].cal += parseFloat(r.calories) || 0
    })
    const topFoods = Object.values(foodCount).sort((a, b) => b.count - a.count).slice(0, 5)

    return { days, avgCal, avgP, avgF, avgC, maxCal, healthPct, daysLogged, topFoods }
  }, [rows, period])

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === p.days ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Fasting */}
      {fasting && (
        <div className="bg-gray-800 rounded-xl p-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Fasting</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-amber-400 text-xl font-bold">{formatDuration(now - fasting.lastMealEpoch)}</div>
              <div className="text-gray-500 text-xs mt-0.5">
                since last meal at {formatTime12(fasting.lastOfLast)}
                {fasting.lastDate !== dateStr(new Date()) ? ` (${fasting.lastDate})` : ''}
              </div>
            </div>
            {fasting.overnightMs !== null && (
              <div className="text-right">
                <div className="text-indigo-400 text-sm font-semibold">{formatDuration(fasting.overnightMs)}</div>
                <div className="text-gray-500 text-xs">last fast</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-indigo-400">{Math.round(avgCal)}</div>
          <div className="text-gray-500 text-xs">avg kcal/day</div>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{daysLogged}<span className="text-gray-500 text-lg">/{period}</span></div>
          <div className="text-gray-500 text-xs">days logged</div>
        </div>
      </div>

      {/* Avg macros */}
      <div className="bg-gray-800 rounded-xl p-3">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Daily Averages</h3>
        <div className="flex justify-around text-center">
          <div>
            <div className="text-blue-400 text-lg font-bold">{Math.round(avgP)}g</div>
            <div className="text-gray-500 text-xs">Protein</div>
          </div>
          <div>
            <div className="text-amber-400 text-lg font-bold">{Math.round(avgF)}g</div>
            <div className="text-gray-500 text-xs">Fat</div>
          </div>
          <div>
            <div className="text-green-400 text-lg font-bold">{Math.round(avgC)}g</div>
            <div className="text-gray-500 text-xs">Carbs</div>
          </div>
        </div>
      </div>

      {/* Calorie bar chart - stacked by macro source */}
      <div className="bg-gray-800 rounded-xl p-3">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Daily Calories</h3>
        <div className="flex gap-3 mb-3 flex-wrap">
          <span className="text-[9px] text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-green-500 inline-block" />Protein</span>
          <span className="text-[9px] text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-500 inline-block" />Fat</span>
          <span className="text-[9px] text-amber-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-amber-500 inline-block" />Carbs</span>
          <span className="text-[9px] text-gray-400 flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-gray-500 inline-block" />Other</span>
        </div>
        <div className="flex items-end gap-0.5" style={{ height: 120 }}>
          {days.map(d => {
            const pCal = d.p * 4
            const fCal = d.f * 9
            const cCal = d.c * 4
            const oCal = Math.max(0, d.cal - pCal - fCal - cCal)
            const totalPct = maxCal > 0 ? (d.cal / maxCal) * 100 : 0
            const barH = Math.max(totalPct, d.cal > 0 ? 4 : 1)
            const sum = pCal + fCal + cCal + oCal || 1
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
                <span className="text-gray-500 text-[8px] leading-none">{d.cal > 0 ? Math.round(d.cal) : ''}</span>
                <div className="w-full flex items-end" style={{ height: 90 }}>
                  <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${barH}%` }}>
                    {d.cal === 0 ? (
                      <div className="w-full h-full bg-gray-700" />
                    ) : (
                      <>
                        <div className="w-full bg-green-500" style={{ height: `${(pCal / sum) * 100}%` }} />
                        <div className="w-full bg-blue-500" style={{ height: `${(fCal / sum) * 100}%` }} />
                        <div className="w-full bg-amber-500" style={{ height: `${(cCal / sum) * 100}%` }} />
                        {oCal > 0 && <div className="w-full bg-gray-500" style={{ height: `${(oCal / sum) * 100}%` }} />}
                      </>
                    )}
                  </div>
                </div>
                <span className="text-gray-600 text-[8px] leading-none">{period <= 14 ? shortDay(d.date) : ''}</span>
              </div>
            )
          })}
        </div>
        {period > 14 && (
          <div className="flex justify-between mt-1">
            <span className="text-gray-600 text-[9px]">{shortDate(days[0].date)}</span>
            <span className="text-gray-600 text-[9px]">{shortDate(days[days.length - 1].date)}</span>
          </div>
        )}
      </div>

      {/* Health ratio */}
      <div className="bg-gray-800 rounded-xl p-3">
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Food Quality</h3>
        <div className="flex rounded-full overflow-hidden h-4 mb-2">
          {healthPct.green > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${healthPct.green}%` }} />}
          {healthPct.orange > 0 && <div className="bg-amber-500 transition-all" style={{ width: `${healthPct.orange}%` }} />}
          {healthPct.red > 0 && <div className="bg-red-400 transition-all" style={{ width: `${healthPct.red}%` }} />}
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {healthPct.green}% healthy
          </span>
          <span className="text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            {healthPct.orange}%
          </span>
          <span className="text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            {healthPct.red}%
          </span>
        </div>
      </div>

      {/* Top foods */}
      {topFoods.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-3">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Most Eaten</h3>
          <div className="space-y-1.5">
            {topFoods.map((f, i) => (
              <div key={f.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs w-4">{i + 1}.</span>
                  <span className="text-white text-sm">{f.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-xs">{f.count}x</span>
                  <span className="text-indigo-400 text-xs">{Math.round(f.cal)} kcal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
