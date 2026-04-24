let accessToken: string | null = null

export function setToken(token: string | null) { accessToken = token }
export function getToken() { return accessToken }

const PLATFORM = import.meta.env.VITE_PLATFORM_URL ?? 'http://localhost:3000'
const ANALYTICS = import.meta.env.VITE_ANALYTICS_URL ?? 'http://localhost:3001'

async function request(
  base: string,
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<Response> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

  const res = await fetch(`${base}${path}`, { ...options, headers, credentials: 'include' })

  if (res.status === 401 && retry && path !== '/api/auth/refresh') {
    const refreshRes = await fetch(`${PLATFORM}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (refreshRes.ok) {
      const data = await refreshRes.json()
      setToken(data.accessToken)
      return request(base, path, options, false)
    } else {
      setToken(null)
      window.location.href = '/login'
    }
  }

  return res
}

function decodeJwt(token: string) {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(base64)) as { userId: string; email: string; role: string }
}

export { decodeJwt }

export const platformApi = {
  get: (path: string) => request(PLATFORM, path),
  post: (path: string, body?: unknown) =>
    request(PLATFORM, path, { method: 'POST', body: JSON.stringify(body) }),
  delete: (path: string) => request(PLATFORM, path, { method: 'DELETE' }),
}

export const analyticsApi = {
  get: (path: string) => request(ANALYTICS, path),
}
