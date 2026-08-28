// Formas que devuelve la API. Varios campos son opcionales porque el backend
// responde con nombres distintos segun el endpoint: /api/accounts/summary usa
// account_id y account_name, mientras que el resto usa id y name.

export type Screen = 'dashboard' | 'activity' | 'wallet' | 'rules' | 'projection' | 'settings'

export interface Account {
  id?: number
  account_id?: number
  name?: string
  account_name?: string
  type?: string
  account_type?: string
  current_balance?: string | number
  closing_date?: number | null
  payment_date?: number | null
}

export interface Transaction {
  id: number
  description: string
  amount: string | number
  type: string
  account_name?: string
  category?: string | null
  date: string
  account_id?: number | null
  debt_id?: number | null
  installments?: number
}

export interface Debt {
  debt_id: number
  debt_name: string
  original_amount: string
  monthly_payment_amount: string
  term_months: number
  total_paid: string
  remaining_amount: string
}

export interface Rule {
  id: number
  description: string
  amount: string
  frequency: string
  type: string
  start_date?: string | null
  end_date?: string | null
  next_execution_date: string
  account_id?: number | null
  category?: string | null
  is_active?: boolean
}

export interface CategoryTotal {
  category: string
  total: string | number
}

export interface MonthlyPayment {
  date: string
  description: string
  amount: string
}

export interface TransactionMeta {
  page: number
  total_pages: number
  total_items: number
}

export interface AppData {
  accounts: Account[]
  transactions: Transaction[]
  transactionMeta?: TransactionMeta | null
  debts: Debt[]
  rules: Rule[]
  categories: CategoryTotal[]
  payments: MonthlyPayment[]
  balance: string | number
}

export interface Filters {
  page: number
  type: string
  category: string
  date_from: string
  date_to: string
}

/**
 * Lo que edita un formulario. El dialogo es uno solo para las cuatro
 * entidades, asi que el item puede traer campos de cualquiera de ellas, y
 * puede venir a medias cuando se abre para crear en vez de editar.
 */
export interface EditableItem {
  id?: number
  name?: string
  type?: string
  description?: string
  amount?: string | number
  category?: string | null
  date?: string
  installments?: number
  account_id?: number | string | null
  account_name?: string
  account_type?: string
  current_balance?: string | number
  closing_date?: number | string | null
  payment_date?: number | string | null
  debt_id?: number | null
  debt_name?: string
  original_amount?: string
  monthly_payment_amount?: string
  term_months?: number
  first_payment_date?: string
  frequency?: string
  start_date?: string | null
  end_date?: string | null
  next_execution_date?: string
  is_active?: boolean
}

export interface DialogState {
  type: 'transaction' | 'account' | 'debt' | 'rule'
  item?: EditableItem
}

// La API devuelve una forma distinta por endpoint; cada llamada la interpreta.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestFn = (method: string, url: string, body?: unknown) => Promise<any>
export type SaveFn = (
  method: string,
  url: string,
  payload: unknown,
  success: string,
) => Promise<void>
export type RemoveFn = (url: string, label: string) => Promise<void>
export type OpenFn = (dialog: DialogState | null) => void

export interface SimulationEvent {
  date: string
  description: string
  amount: string | number
}

export interface ProjectionResult {
  projected_balance_end: string | number
  projection_start_date: string
  projection_end_date: string
  simulation_log?: SimulationEvent[]
}
