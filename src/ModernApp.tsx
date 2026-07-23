// @ts-nocheck
import { useEffect, useState } from 'react'
import { HiChartBar as BarChart3, HiBanknotes as CircleDollarSign, HiHome as HomeIcon, HiCreditCard as Landmark, HiPlus as Plus, HiReceiptPercent as ReceiptText, HiScale as Scale, HiCog6Tooth as SettingsIcon, HiCreditCard as WalletCards } from 'react-icons/hi2'
import { request } from './modernApi'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const today = new Date().toISOString().slice(0, 10)

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input {...props} /></label> }

function Auth({ onLogin }) {
  const [register, setRegister] = useState(false); const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  async function submit(event) { event.preventDefault(); setError(''); try { if (register) await request('/api/auth/register', { method: 'POST', body: { username, password } }); const result = await request('/api/auth/login', { method: 'POST', body: { username, password } }); onLogin(result.token, username) } catch (e) { setError(e.message) } }
  return <main className="auth"><section className="auth-card"><div className="brand-mark">f</div><p className="eyebrow">TU ESPACIO FINANCIERO</p><h1>Tu dinero, a tu manera.</h1><p className="auth-copy">Una forma clara y bonita de llevar tus cuentas.</p><form onSubmit={submit}><Field label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} required /><Field label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button className="primary-button">{register ? 'Crear mi cuenta' : 'Entrar a mi cuenta'}</button></form>{error && <p className="error">{error}</p>}<button className="text-button" onClick={() => setRegister(!register)}>{register ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}</button></section></main>
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('finance_token'))
  const [username, setUsername] = useState(() => localStorage.getItem('finance_username'))
  const [data, setData] = useState({ accounts: [], transactions: [], debts: [], rules: [], payments: [], balance: null })
  const [active, setActive] = useState('home')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [quickOpen, setQuickOpen] = useState(false)
  const [composer, setComposer] = useState(null)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  function logout() { localStorage.removeItem('finance_token'); localStorage.removeItem('finance_username'); setToken(''); setUsername('') }
  async function refresh() {
    if (!token) return
    setLoading(true); setNotice('')
    try {
      const [accounts, transactions, debts, rules, payments, balance] = await Promise.all([request('/api/accounts/summary', { token }), request('/api/transactions?limit=30', { token }), request('/api/debts/', { token }), request('/api/rules/', { token }), request('/api/summary/monthly_payments', { token }), request('/api/transactions/balance', { token })])
      setData({ accounts, transactions, debts, rules, payments, balance })
    } catch (e) { setNotice(e.message); if (e.message.toLowerCase().includes('token')) logout() } finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [token])
  function login(newToken, newUsername) { localStorage.setItem('finance_token', newToken); localStorage.setItem('finance_username', newUsername); setToken(newToken); setUsername(newUsername) }
  async function save(path, body) { try { await request(path, { token, method: 'POST', body }); setNotice('Listo, guardamos tus cambios.'); setComposer(null); refresh() } catch (e) { setNotice(e.message) } }
  function openComposer(kind) { setQuickOpen(false); setComposer(kind) }
  if (!token) return <Auth onLogin={login} />
  return <main className="app-shell">
    <header className="topbar"><div className="avatar">{username?.slice(0, 1).toUpperCase()}</div><div><p className="welcome">Hola, {username}</p><p className="date-label">Así van tus finanzas</p></div><button className="icon-button" onClick={refresh} title="Actualizar">↻</button></header>
    {notice && <p className="notice">{notice}</p>}
    {active === 'home' && <Home data={data} onNavigate={setActive} />}
    {active === 'upcoming' && <UpcomingExpenses data={data} onBack={() => setActive('home')} />}
    {active === 'more' && <More onNavigate={setActive} />}
    {active === 'accounts' && <Accounts data={data} onSave={save} onOpenAccount={(account) => { setSelectedAccount(account); setActive('account-detail') }} />}
    {active === 'account-detail' && <AccountMovements account={selectedAccount} token={token} onBack={() => setActive('accounts')} />}
    {active === 'projection' && <Projection token={token} balance={data.balance} />}
    {active === 'settings' && <Settings username={username} onLogout={logout} />}
    {composer && <Composer kind={composer} accounts={data.accounts} onSave={save} onClose={() => setComposer(null)} />}
    <BottomBar active={active} onNavigate={setActive} quickOpen={quickOpen} onQuickToggle={() => setQuickOpen(!quickOpen)} onQuickAction={openComposer} />
    {loading && <div className="loading">Actualizando…</div>}
  </main>
}

function Home({ data, onNavigate }) {
  const balance = Number(data.balance?.current_balance || 0); const expenses = data.transactions.filter((item) => Number(item.amount) < 0); const expenseTotal = expenses.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0)
  return <section className="screen"><section className="balance-card"><div><p>Saldo disponible</p><strong>{money.format(balance)}</strong><small>En efectivo y débito</small></div><span className="balance-orbit">◌</span><div className="balance-footer"><span>Actualizado ahora</span><span>•••</span></div></section><section className="summary-grid"><article><span>Total de gastos</span><strong>{money.format(expenseTotal)}</strong><button onClick={() => onNavigate('upcoming')}>Ver próximos gastos →</button></article><article><span>Tu panorama</span><strong>{data.accounts.length}</strong><button onClick={() => onNavigate('more')}>Ver mis cuentas →</button></article></section><ExpenseChart items={expenses} /><Panel title="Próximos gastos"><Rows items={data.payments.slice(0, 5)} kind="payments" /></Panel></section>
}

function ExpenseChart({ items }) { const total = items.reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0) || 1; return <Panel title="Gastos por categoría"><div className="expense-chart">{items.slice(0, 5).map((item, index) => <div key={`${item.id}-${index}`}><span>{item.category || 'Otros'}</span><i style={{ width: `${Math.max(12, (Math.abs(Number(item.amount)) / total) * 100)}%` }} /><b>{money.format(Math.abs(Number(item.amount)))}</b></div>) || <p className="empty">Aún no hay gastos para graficar.</p>}</div></Panel> }
function UpcomingExpenses({ data, onBack }) { return <section className="screen"><button className="text-button" onClick={onBack}>← Volver al inicio</button><SectionHeading title="Próximos gastos" subtitle="Pagos programados por venir" /><Panel title="Agenda de gastos"><Rows items={data.payments} kind="payments" /></Panel></section> }
function More({ onNavigate }) { return <section className="screen"><SectionHeading title="Más" subtitle="Organiza tus finanzas" /><Panel title="Organización"><button className="settings-row" onClick={() => onNavigate('accounts')}>Cuentas <span>›</span></button><button className="settings-row" onClick={() => onNavigate('accounts')}>Reglas fijas <span>›</span></button></Panel></section> }

function Accounts({ data, onSave, onOpenAccount }) {
  const expenses = data.transactions.filter((item) => Number(item.amount) < 0)
  return <section className="screen"><SectionHeading title="Cuentas" subtitle="Tus cuentas, reglas e historial" /><AccountForm onSave={onSave} /><Panel title="Mis cuentas">{data.accounts.length ? <div className="rows">{data.accounts.map((account) => <button key={account.account_id} className="settings-row" onClick={() => onOpenAccount(account)}><span><b>{account.account_name}</b><small>{account.account_type}</small></span><strong>{money.format(Number(account.current_balance || 0))} ›</strong></button>)}</div> : <p className="empty">Aún no hay cuentas.</p>}</Panel><Panel title="Reglas fijas"><Rows items={data.rules} kind="rules" /></Panel><Panel title="Historial de gastos"><Rows items={expenses} kind="transactions" /></Panel></section>
}

function AccountMovements({ account, token, onBack }) {
  const [transactions, setTransactions] = useState([]); const [error, setError] = useState('');
  useEffect(() => { if (!account) return; request(`/api/accounts/${account.account_id}/transactions`, { token }).then((result) => setTransactions(result.transactions || [])).catch((e) => setError(e.message)) }, [account, token]);
  if (!account) return null;
  return <section className="screen"><button className="text-button" onClick={onBack}>← Volver a cuentas</button><SectionHeading title={account.account_name} subtitle={account.account_type} /><section className="projection-hero"><span>Saldo actual</span><strong>{money.format(Number(account.current_balance || 0))}</strong></section><Panel title="Movimientos">{error ? <p className="error">{error}</p> : <Rows items={transactions} kind="transactions" />}</Panel></section>
}

function Projection({ token, balance }) {
  const [months, setMonths] = useState(3); const [result, setResult] = useState(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(false)
  async function calculate() { setLoading(true); setError(''); try { setResult(await request(`/api/projection?months_ahead=${months}`, { token })) } catch (e) { setResult(null); setError(e.message) } finally { setLoading(false) } }
  return <section className="screen"><SectionHeading title="Proyección" subtitle="Mira hacia dónde va tu dinero" /><section className="projection-hero"><span>Saldo actual</span><strong>{money.format(Number(balance?.current_balance || 0))}</strong><p>Usamos tus reglas fijas, cuentas y fechas de pago.</p></section><section className="form-card"><div className="projection-control"><Field label="Meses a proyectar" type="number" min="1" max="24" value={months} onChange={(e) => setMonths(e.target.value)} /><button className="primary-button" onClick={calculate}>{loading ? 'Calculando…' : 'Ver mi proyección'}</button></div></section>{error && <p className="error">{error}</p>}{result && <><section className="projection-result"><span>Saldo estimado al final</span><strong>{money.format(Number(result.projected_balance_end))}</strong><small>{result.projection_start_date} → {result.projection_end_date}</small></section><Panel title="Eventos proyectados"><Rows items={result.simulation_log} kind="projection" /></Panel></>}</section>
}

function Settings({ username, onLogout }) { return <section className="screen"><SectionHeading title="Ajustes" subtitle="Tu espacio, tus preferencias" /><section className="profile-card"><div className="profile-avatar">{username?.slice(0, 1).toUpperCase()}</div><div><b>{username}</b><span>Cuenta personal</span></div></section><Panel title="Aplicación"><button className="settings-row">Tema rosita <span>✓</span></button><button className="settings-row">Notificaciones <span>›</span></button></Panel><button className="logout-button" onClick={onLogout}>Cerrar sesión</button></section> }

function BottomBar({ active, onNavigate, quickOpen, onQuickToggle, onQuickAction }) {
  const items = [{ id: 'home', Icon: HomeIcon, label: 'Inicio' }, { id: 'more', Icon: WalletCards, label: 'Más' }, { id: 'projection', Icon: BarChart3, label: 'Proyección' }, { id: 'settings', Icon: SettingsIcon, label: 'Ajustes' }]
  const actions = [{ id: 'rule', Icon: Scale, label: 'Regla' }, { id: 'debt', Icon: ReceiptText, label: 'Deuda' }, { id: 'income', Icon: CircleDollarSign, label: 'Ingreso' }, { id: 'expense', Icon: Landmark, label: 'Gasto' }]
  return <>{quickOpen && <button className="quick-backdrop" aria-label="Cerrar menú" onClick={onQuickToggle} />}<div className={`quick-actions ${quickOpen ? 'is-open' : ''}`}>{actions.map((action, index) => <button key={action.id} className={`quick-action action-${index + 1}`} onClick={() => onQuickAction(action.id)}><span><action.Icon size={27} strokeWidth={2.2} /></span><small>{action.label}</small></button>)}</div><nav className="bottom-bar" aria-label="Navegación principal"><div className="bar-items"><div className="nav-group">{items.slice(0, 2).map((item) => <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} />)}</div><div className="quick-wrap"><button className={`quick-button ${quickOpen ? 'open' : ''}`} onClick={onQuickToggle} aria-label="Agregar"><Plus size={32} strokeWidth={2.4} /></button></div><div className="nav-group">{items.slice(2).map((item) => <NavItem key={item.id} item={item} active={active === item.id} onClick={() => onNavigate(item.id)} />)}</div></div></nav></>
}
function NavItem({ item, active, onClick }) { return <button className={`nav-item ${active ? 'selected' : ''}`} onClick={onClick}><item.Icon size={20} strokeWidth={active ? 2.6 : 2} /><small>{item.label}</small></button> }

function Composer({ kind, accounts, onSave, onClose }) { const names = { income: 'Agregar ingreso', expense: 'Agregar gasto', rule: 'Agregar regla fija', debt: 'Agregar deuda' }; return <div className="modal-backdrop"><section className="composer"><div className="composer-head"><div><p className="eyebrow">NUEVO REGISTRO</p><h2>{names[kind]}</h2></div><button onClick={onClose}>×</button></div>{(kind === 'income' || kind === 'expense') && <TransactionForm key={kind} type={kind === 'income' ? 'income' : 'expense'} accounts={accounts} onSave={onSave} />}{kind === 'rule' && <RuleForm onSave={onSave} />}{kind === 'debt' && <DebtForm onSave={onSave} />}</section></div> }

function TransactionForm({ type = 'expense', accounts, onSave }) { const [description, setDescription] = useState(''); const [amount, setAmount] = useState(''); const [category, setCategory] = useState(''); const [account, setAccount] = useState(''); function submit(event) { event.preventDefault(); onSave('/api/transactions/new', { description, amount, category, type, account_id: account || undefined, date: `${today}T12:00:00` }) } return <form className="form-grid" onSubmit={submit}><Field label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} required /><Field label="Importe" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required /><Field label="Categoría" value={category} onChange={(e) => setCategory(e.target.value)} /><label className="field"><span>Cuenta</span><select value={account} onChange={(e) => setAccount(e.target.value)}><option value="">Efectivo automático</option>{accounts.map((a) => <option key={a.account_id} value={a.account_id}>{a.account_name}</option>)}</select></label><button className="primary-button">Guardar {type === 'income' ? 'ingreso' : 'gasto'}</button></form> }
function AccountForm({ onSave }) { const [type, setType] = useState('cash'); function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); onSave('/api/accounts/new', { name: form.get('name'), type, closing_date: form.get('closing_date') || undefined, payment_date: form.get('payment_date') || undefined }) } return <section className="form-card"><h2>Agregar cuenta</h2><form className="form-grid" onSubmit={submit}><Field label="Nombre de la cuenta" name="name" required /><label className="field"><span>Tipo</span><select value={type} onChange={(e) => setType(e.target.value)}><option value="cash">Efectivo</option><option value="debit_card">Débito</option><option value="credit_card">Crédito</option></select></label>{type === 'credit_card' && <><Field label="Día de corte" name="closing_date" type="number" min="1" max="31" required /><Field label="Día de pago" name="payment_date" type="number" min="1" max="31" required /></>}<button className="primary-button">Crear cuenta</button></form></section> }
function RuleForm({ onSave }) { function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); onSave('/api/rules/new', { description: form.get('description'), amount: form.get('amount'), type: 'expense', frequency: form.get('frequency'), first_execution_date: form.get('date') }) } return <form className="form-grid" onSubmit={submit}><Field label="Descripción" name="description" required /><Field label="Importe" name="amount" type="number" step="0.01" min="0.01" required /><label className="field"><span>Frecuencia</span><select name="frequency"><option value="monthly">Mensual</option><option value="weekly">Semanal</option><option value="yearly">Anual</option></select></label><Field label="Primer cargo" name="date" type="date" defaultValue={today} required /><button className="primary-button">Guardar regla</button></form> }
function DebtForm({ onSave }) { function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); onSave('/api/debts/new', { debt_name: form.get('debt_name'), original_amount: form.get('original_amount'), monthly_payment_amount: form.get('monthly_payment_amount'), term_months: Number(form.get('term_months')), frequency: form.get('frequency'), first_payment_date: form.get('first_payment_date') }) } return <form className="form-grid" onSubmit={submit}><Field label="Nombre de la deuda" name="debt_name" required /><Field label="Monto original" name="original_amount" type="number" step="0.01" min="0.01" required /><Field label="Pago mensual" name="monthly_payment_amount" type="number" step="0.01" min="0.01" required /><Field label="Plazo en meses" name="term_months" type="number" min="1" required /><label className="field"><span>Frecuencia</span><select name="frequency"><option value="monthly">Mensual</option><option value="weekly">Semanal</option></select></label><Field label="Primer pago" name="first_payment_date" type="date" defaultValue={today} required /><button className="primary-button">Guardar deuda</button></form> }
function SectionHeading({ title, subtitle }) { return <div className="section-heading"><h1>{title}</h1><p>{subtitle}</p></div> }
function Panel({ title, children }) { return <section className="panel"><div className="panel-head"><h2>{title}</h2></div>{children}</section> }
function Rows({ items, kind }) { if (!items.length) return <p className="empty">Aún no hay información por aquí.</p>; return <ul className="rows">{items.map((item, index) => { const amount = kind === 'accounts' ? item.current_balance : kind === 'debts' ? item.remaining_amount : kind === 'rules' ? item.amount : kind === 'projection' ? item.amount : item.amount; const title = kind === 'accounts' ? item.account_name : kind === 'debts' ? item.debt_name : item.description; const detail = kind === 'transactions' ? `${item.account_name} · ${item.category || 'Sin categoría'}` : kind === 'payments' ? item.date : kind === 'accounts' ? item.account_type : kind === 'rules' ? `${item.frequency} · ${item.next_execution_date}` : kind === 'projection' ? item.date : `Pagado ${money.format(Number(item.total_paid))}`; const symbol = kind === 'accounts' ? '▣' : kind === 'payments' || kind === 'rules' || kind === 'projection' ? '◷' : kind === 'debts' ? '◒' : Number(amount) < 0 ? '↙' : '↗'; return <li key={item.id || item.account_id || item.debt_id || `${title}-${index}`}><span className={`row-icon ${Number(amount) < 0 || kind === 'debts' ? 'expense' : ''}`}>{symbol}</span><div><b>{title}</b><span>{detail}</span></div><em className={Number(amount) < 0 || kind === 'debts' ? 'negative' : 'positive'}>{money.format(Number(amount))}</em></li> })}</ul> }
export default App
