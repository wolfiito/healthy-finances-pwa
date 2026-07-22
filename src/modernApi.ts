// @ts-nocheck
const baseUrl = import.meta.env.VITE_API_URL || 'https://tazcito.pythonanywhere.com'

export async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'x-access-token': token } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error || 'No fue posible completar la solicitud.')
  return payload
}

export { baseUrl }
