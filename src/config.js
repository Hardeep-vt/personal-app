export const GOOGLE_CLIENT_ID = '1002595393352-moml2mjleukgs1o3p77qjes2j949a0th.apps.googleusercontent.com'

// Fill these in after creating an app at developer.whoop.com
// Redirect URI to set in Whoop app: https://hardeep-vt.github.io/personal-app/
export const WHOOP_CLIENT_ID = 'c76454ec-9188-4546-9ff6-7b116fd9d7e8'
export const WHOOP_REDIRECT_URI = window.location.origin + '/personal-app/'
// Set this to your Cloudflare Worker URL after deploying cloudflare-worker/whoop-token-proxy.js
export const WHOOP_TOKEN_PROXY_URL = 'https://muddy-disk-f411.hardeep240.workers.dev'

export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'

export const SPREADSHEET_NAME = 'MyApp Data'
export const SANDBOX_SPREADSHEET_NAME = 'MyApp Data (Sandbox)'

export const SHEETS = {
  FOOD: 'food_log',
  EXERCISE: 'exercise_log',
  NOTES: 'notes',
  TODOS: 'todos',
  PEOPLE: 'people',
  INTERACTIONS: 'interactions',
  MEAL_TIMES: 'meal_times',
  TRASH: 'trash',
  CALENDAR_EVENTS: 'calendar_events',
  RECURRING_TEMPLATES: 'recurring_templates',
  HABIT_COMPLETIONS: 'habit_completions',
}

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
