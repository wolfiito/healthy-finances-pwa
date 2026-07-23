import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://tazcito.pythonanywhere.com'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers['x-access-token'] = token
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(Object.assign(
    new Error(error.response?.data?.error || 'No fue posible conectar con la API.'),
    { status: error.response?.status },
  )),
)

export default client

// Compatibilidad con componentes antiguos que permanecen en el proyecto pero
// ya no forman parte de la nueva interfaz.
export const getAccountsSummary = () => client.get('/api/accounts/summary')
export const getRules = () => client.get('/api/rules/')
export const deleteRule = (ruleId: number) => client.delete(`/api/rules/${ruleId}`)
