// Cloudflare Worker — Whoop OAuth token proxy
// Deploy at: https://workers.cloudflare.com
// Set environment variable: WHOOP_CLIENT_SECRET
// Set environment variable: WHOOP_CLIENT_ID

const ALLOWED_ORIGINS = ['https://hardeep-vt.github.io', 'http://localhost:5173']
const TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token'

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || ''

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) })
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response('Invalid JSON', { status: 400 })
    }

    const { code, code_verifier, redirect_uri } = body
    if (!code || !code_verifier || !redirect_uri) {
      return new Response('Missing code, code_verifier, or redirect_uri', { status: 400 })
    }

    // Exchange code for token using secret stored in Cloudflare (never in browser)
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: env.WHOOP_CLIENT_ID,
      client_secret: env.WHOOP_CLIENT_SECRET,
      code_verifier,
    })

    const whoopRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const data = await whoopRes.json()

    return new Response(JSON.stringify(data), {
      status: whoopRes.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    })
  },
}
