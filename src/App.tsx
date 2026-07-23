// @ts-nocheck
import { useEffect, useMemo, useState } from 'react'
import {
  FiActivity, FiArrowDownLeft, FiArrowUpRight, FiBarChart2, FiCalendar,
  FiCreditCard, FiEdit3, FiHome, FiLogOut, FiMenu, FiPlus, FiRefreshCw,
  FiRepeat, FiSettings, FiSliders, FiTrash2, FiTrendingUp, FiX,
} from 'react-icons/fi'
import api from './services/api'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
const today = new Date().toISOString().slice(0, 10)
const emptyData = { accounts: [], transactions: [], debts: [], rules: [], categories: [], payments: [], balance: '0.00' }

const accountNames = { cash: 'Efectivo', debit_card: 'Débito', credit_card: 'Crédito' }
const frequencyNames = { once: 'Una vez', daily: 'Diaria', weekly: 'Semanal', bi_weekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' }

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [screen, setScreen] = useState('dashboard')
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [dialog, setDialog] = useState(null)
  const [transactionFilters, setTransactionFilters] = useState({ page: 1, type: '', category: '', date_from: '', date_to: '' })

  const request = async (method, url, body) => {
    const result = await api({ method, url, data: body })
    return result.data
  }

  const load = async () => {
    if (!token) return
    setLoading(true)
    const transactionQuery = new URLSearchParams({ page: String(transactionFilters.page), per_page: '25' })
    Object.entries(transactionFilters).forEach(([key, value]) => { if (value && key !== 'page') transactionQuery.set(key, value) })
    const calls = await Promise.allSettled([
      request('get', '/api/accounts/summary'), request('get', `/api/transactions?${transactionQuery}`),
      request('get', '/api/debts/'), request('get', '/api/rules/'), request('get', '/api/summary/categories'),
      request('get', '/api/summary/monthly_payments'), request('get', '/api/transactions/balance'),
    ])
    const failures = calls.filter((call) => call.status === 'rejected')
    const expiredSession = failures.length === calls.length && failures.every((call) => call.reason?.status === 401)
    if (expiredSession) {
      localStorage.removeItem('token')
      setData(emptyData)
      setLoading(false)
      setToken('')
      return
    }
    const value = (index, fallback) => calls[index].status === 'fulfilled' ? calls[index].value : fallback
    const transactionResult = value(1, [])
    const accounts = value(0, [])
    const balanceFromAccounts = accounts
      .filter((item) => ['cash', 'debit_card'].includes(item.account_type || item.type))
      .reduce((total, item) => total + Number(item.current_balance || 0), 0)
    setData({
      accounts, transactions: Array.isArray(transactionResult) ? transactionResult : transactionResult.items || [],
      transactionMeta: Array.isArray(transactionResult) ? null : transactionResult.pagination,
      debts: value(2, []), rules: value(3, []), categories: value(4, []), payments: value(5, []),
      balance: value(6, null)?.current_balance ?? balanceFromAccounts,
    })
    if (failures.length) setNotice('Parte de tu información no se pudo actualizar. Toca recargar para intentarlo otra vez.')
    setLoading(false)
  }

  useEffect(() => { load() }, [token, transactionFilters])

  const message = (text) => { setNotice(text); window.setTimeout(() => setNotice(''), 3500) }
  const logout = () => { localStorage.removeItem('token'); setToken(''); setData(emptyData) }
  const login = (newToken) => { localStorage.setItem('token', newToken); setToken(newToken) }

  const save = async (method, url, payload, success) => {
    try { await request(method, url, payload); setDialog(null); message(success); await load() }
    catch (error) { message(error.message) }
  }
  const remove = async (url, label) => {
    if (!window.confirm(`¿Eliminar ${label}? Esta acción no se puede deshacer.`)) return
    try { await request('delete', url); message('Eliminado correctamente.'); await load() } catch (error) { message(error.message) }
  }
  const processRules = async () => {
    try { const result = await request('post', '/api/rules/process', { until: today }); message(`${result.created_transactions || 0} movimientos recurrentes procesados.`); await load() }
    catch (error) { message(error.message) }
  }

  if (!token) return <Auth onLogin={login} />

  const content = {
    dashboard: <Dashboard data={data} open={setDialog} go={setScreen} />,
    activity: <Activity data={data} filters={transactionFilters} setFilters={setTransactionFilters} open={setDialog} remove={remove} />,
    wallet: <Wallet data={data} open={setDialog} remove={remove} request={request} processRules={processRules} />,
    rules: <Rules data={data} open={setDialog} remove={remove} processRules={processRules} />,
    projection: <Projection request={request} balance={data.balance} />,
    settings: <Settings logout={logout} />,
  }[screen]

  return <div className="app-layout">
    <FloatingNav screen={screen} setScreen={setScreen} open={setDialog} logout={logout} />
    <main className="main-content">
      <Topbar title={screen} onRefresh={load} loading={loading} />
      {notice && <div className="toast">{notice}<button onClick={() => setNotice('')}>×</button></div>}
      {content}
    </main>
    <ActionDock screen={screen} setScreen={setScreen} open={setDialog} logout={logout} />
    {dialog && <Dialog type={dialog.type} item={dialog.item} accounts={data.accounts} onClose={() => setDialog(null)} save={save} />}
  </div>
}

function Auth({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault(); setError('')
    try {
      const response = await api.post('/api/auth/login', { username, password }); onLogin(response.data.token)
    } catch (e) { setError(e.message) }
  }
  return <div className="auth-page auth-simple-page">
    <section className="auth-card auth-simple-card"><h1>Entrar a mis finanzas</h1>
      <form onSubmit={submit} className="form-stack"><Field label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu usuario" required />
        <Field label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        <button className="button primary wide">Entrar <FiArrowUpRight /></button></form>
      {error && <p className="form-error">{error}</p>}
    </section></div>
}

function Brand() { return <div className="brand"><span>f</span><b>floréa</b></div> }
function Topbar({ title, onRefresh, loading }) { const titles = { dashboard: ['Hola de nuevo', 'Tu resumen de hoy'], activity: ['Movimientos', 'Cada detalle cuenta'], wallet: ['Mi dinero', 'Cuentas y compromisos'], rules: ['Reglas fijas', 'Tus pagos en automático'], projection: ['Proyección', 'Mira con calma hacia adelante'], settings: ['Ajustes', 'Hazlo tuyo'] }; return <header className="topbar"><div><p className="eyebrow">{titles[title][1]}</p><h1>{titles[title][0]}</h1></div><button className="icon-button" onClick={onRefresh} aria-label="Actualizar"> <FiRefreshCw className={loading ? 'spin' : ''} /></button></header> }

function FloatingNav({ screen, setScreen, open, logout }) { const nav = [[FiHome, 'dashboard', 'Ahora'], [FiActivity, 'activity', 'Bitácora'], [FiCreditCard, 'wallet', 'Bolsillos'], [FiRepeat, 'rules', 'Rituales'], [FiTrendingUp, 'projection', 'Mañana']]; return <header className="floating-nav"><Brand /><nav>{nav.map(([Icon, id, label]) => <button key={id} className={screen === id ? 'selected' : ''} onClick={() => setScreen(id)}><Icon /><span>{label}</span></button>)}</nav><div className="nav-end"><button className="nav-add" onClick={() => open({ type: 'transaction' })}><FiPlus /><span>Apuntar</span></button><button className="nav-settings" onClick={() => setScreen('settings')} aria-label="Ajustes"><FiSettings /></button><button className="nav-logout" onClick={logout} aria-label="Salir"><FiLogOut /></button></div></header> }
function ActionDock({ screen, setScreen, open, logout }) {
  const [panel, setPanel] = useState(null)
  const navigate = (destination) => { setScreen(destination); setPanel(null) }
  const create = (type, item) => { setPanel(null); open({ type, item }) }
  return <>
    {panel === 'add' && <section className="mobile-more mobile-add" aria-label="Agregar">
      <button onClick={() => create('transaction', { type: 'expense' })}><span className="more-pink">↑</span><div><b>Agregar gasto</b><small>Registra una salida</small></div></button>
      <button onClick={() => create('transaction', { type: 'income' })}><span className="more-green">↓</span><div><b>Agregar ingreso</b><small>Registra una entrada</small></div></button>
      <button onClick={() => create('account')}><span className="more-lilac"><FiCreditCard /></span><div><b>Agregar cuenta</b><small>Tarjeta, débito o efectivo</small></div></button>
      <button onClick={() => create('rule')}><span className="more-yellow"><FiRepeat /></span><div><b>Agregar regla</b><small>Automatiza un movimiento</small></div></button>
    </section>}
    {panel === 'more' && <section className="mobile-more" aria-label="Más opciones">
      <button onClick={() => navigate('activity')}><span className="more-lilac"><FiActivity /></span><div><b>Movimientos</b><small>Tu historial completo</small></div></button>
      <button onClick={() => navigate('settings')}><span className="more-pink"><FiSettings /></span><div><b>Ajustes</b><small>Tu espacio</small></div></button>
      <button className="mobile-logout" onClick={logout}><span><FiLogOut /></span><div><b>Cerrar sesión</b><small>Salir de esta cuenta</small></div></button>
    </section>}
    <nav className="action-dock">
      <button className={screen === 'dashboard' ? 'selected' : ''} onClick={() => navigate('dashboard')}><FiHome /><small>Inicio</small></button>
      <button className={screen === 'wallet' ? 'selected' : ''} onClick={() => navigate('wallet')}><FiCreditCard /><small>Cuentas</small></button>
      <button className={panel === 'add' ? 'selected dock-add' : 'dock-add'} onClick={() => setPanel(panel === 'add' ? null : 'add')}><FiPlus /><small>Agregar</small></button>
      <button className={screen === 'projection' ? 'selected' : ''} onClick={() => navigate('projection')}><FiTrendingUp /><small>Proyección</small></button>
      <button className={panel === 'more' ? 'selected dock-menu' : 'dock-menu'} onClick={() => setPanel(panel === 'more' ? null : 'more')}><FiMenu /><small>Menú</small></button>
    </nav>
  </>
}

function Dashboard({ data, open, go }) {
  const balance = Number(data.balance || 0)
  const monthlyExpense = data.transactions.filter((item) => Number(item.amount) < 0).reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0)
  const cards = data.accounts.slice(0, 3)
  return <section className="page finance-home">
    <section className="available-balance"><p>Saldo total disponible</p><h2>{money.format(balance)}</h2><small><i /> 1.2% más que el mes pasado</small></section>
    <section className="quick-section"><div className="mobile-section-head"><h3>Acciones rápidas</h3></div><div className="quick-grid"><button onClick={() => open({ type: 'transaction', item: { type: 'income' } })}><span className="quick-green">↓</span>Ingresar</button><button onClick={() => open({ type: 'transaction', item: { type: 'expense' } })}><span className="quick-pink">↑</span>Gastar</button><button onClick={() => open({ type: 'rule' })}><span className="quick-lilac">↻</span>Automatizar</button><button onClick={() => go('projection')}><span className="quick-yellow">✦</span>Planear</button></div></section>
    <section className="pocket-section"><div className="mobile-section-head"><h3>Mis bolsillos</h3><button onClick={() => go('wallet')}>Ver todos</button></div><div className="pocket-scroll">{cards.length ? cards.map((item, index) => <button className={`pocket pocket-${index + 1}`} key={accountId(item)} onClick={() => go('wallet')}><span>{index === 0 ? '◫' : index === 1 ? '◇' : '○'}</span><small>{item.account_name || item.name}</small><b>{money.format(Number(item.current_balance || 0))}</b><em>{accountNames[item.account_type || item.type] || 'Cuenta'}</em></button>) : <button className="pocket pocket-new" onClick={() => open({ type: 'account' })}><span>＋</span><small>Crear</small><b>bolsillo</b></button>}</div></section>
    <section className="spending-card"><div className="mobile-section-head"><div><h3>Gastos este mes</h3><p>Así se movió tu dinero</p></div><button onClick={() => go('activity')}>Detalle ›</button></div><div className="spending-body"><div className="donut"><div><small>Total</small><b>{money.format(monthlyExpense)}</b></div></div><div className="spending-legend">{data.categories.length ? data.categories.slice(0, 4).map((item, index) => <div key={`${item.category}-${index}`}><i className={`legend-${index + 1}`} /><span>{item.category}</span><b>{Math.round(Number(item.total) / Math.max(monthlyExpense, 1) * 100)}%</b></div>) : <p>Agrega gastos para ver tus categorías.</p>}</div></div></section>
    <section className="recent-card"><div className="mobile-section-head"><div><h3>Lo último</h3><p>Movimientos recientes</p></div><button onClick={() => go('activity')}>Ver todo</button></div><div className="recent-list">{data.transactions.length ? data.transactions.slice(0, 5).map((item) => <button key={item.id} onClick={() => go('activity')}><span className={Number(item.amount) < 0 ? 'recent-expense' : 'recent-income'}>{Number(item.amount) < 0 ? '↗' : '↙'}</span><div><b>{item.description}</b><small>{item.category || item.account_name || 'Movimiento'}</small></div><strong className={Number(item.amount) < 0 ? 'negative' : 'positive'}>{signedMoney(item.amount)}</strong></button>) : <Empty text="Tu actividad aparecerá aquí." />}</div></section>
  </section>
}
function Metric({ label, value, icon, tone }) { return <article className={`metric ${tone}`}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></article> }
function Surface({ title, action, onAction, children }) { return <section className="surface"><header><h2>{title}</h2>{action && <button className="surface-action" onClick={onAction}>{action} <FiArrowUpRight /></button>}</header>{children}</section> }

function Activity({ data, filters, setFilters, open, remove }) { const set = (field, value) => setFilters({ ...filters, [field]: value, page: field === 'page' ? value : 1 }); return <section className="page"><div className="section-line"><div><h2>Historial sin misterio</h2><p>Filtra, corrige o elimina cualquier movimiento.</p></div><button className="button primary" onClick={() => open({ type: 'transaction' })}><FiPlus /> Agregar</button></div><section className="filter-card"><FiSliders /><select value={filters.type} onChange={(e) => set('type', e.target.value)}><option value="">Todos los tipos</option><option value="expense">Gastos</option><option value="income">Ingresos</option><option value="debt_payment">Pago de deuda</option></select><input type="date" value={filters.date_from} onChange={(e) => set('date_from', e.target.value)} /><input type="date" value={filters.date_to} onChange={(e) => set('date_to', e.target.value)} /><input placeholder="Categoría" value={filters.category} onChange={(e) => set('category', e.target.value)} /></section><Surface title={`${data.transactionMeta?.total_items ?? data.transactions.length} movimientos`}><div className="transaction-table">{data.transactions.length ? data.transactions.map((item) => <article key={item.id} className="transaction-row"><span className={Number(item.amount) < 0 ? 'round expense' : 'round income'}>{Number(item.amount) < 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}</span><div className="transaction-info"><b>{item.description}</b><small>{item.account_name || 'Efectivo'} · {item.category || 'Sin categoría'} · {formatDate(item.date)}</small></div><strong className={Number(item.amount) < 0 ? 'negative' : 'positive'}>{signedMoney(item.amount)}</strong><div className="row-actions"><button onClick={() => open({ type: 'transaction', item })}><FiEdit3 /></button><button onClick={() => remove(`/api/transactions/${item.id}`, 'este movimiento')}><FiTrash2 /></button></div></article>) : <Empty text="No encontramos movimientos con esos filtros." />}</div>{data.transactionMeta && <div className="pagination"><button disabled={filters.page === 1} onClick={() => set('page', filters.page - 1)}>Anterior</button><span>Página {data.transactionMeta.page} de {data.transactionMeta.total_pages || 1}</span><button disabled={filters.page >= data.transactionMeta.total_pages} onClick={() => set('page', filters.page + 1)}>Siguiente</button></div>}</Surface></section> }

function Wallet({ data, open, remove, request, processRules }) {
  const [tab, setTab] = useState('accounts')
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountTransactions, setAccountTransactions] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const [accountError, setAccountError] = useState('')
  useEffect(() => {
    if (!selectedAccount) return
    setLoadingTransactions(true); setAccountError('')
    request('get', `/api/accounts/${accountId(selectedAccount)}/transactions`)
      .then((result) => setAccountTransactions(Array.isArray(result) ? result : result.items || result.transactions || []))
      .catch((error) => setAccountError(error.message))
      .finally(() => setLoadingTransactions(false))
  }, [selectedAccount])
  const changeTab = (nextTab) => { setTab(nextTab); setSelectedAccount(null) }
  if (selectedAccount) return <section className="page account-detail"><button className="back-button" onClick={() => setSelectedAccount(null)}>← Volver a cuentas</button><div className="section-line"><div><p className="eyebrow">{accountNames[selectedAccount.account_type || selectedAccount.type] || 'Cuenta'}</p><h2>{selectedAccount.account_name || selectedAccount.name}</h2><strong>{money.format(Number(selectedAccount.current_balance || 0))}</strong></div><div className="split-buttons"><button className="button soft" onClick={() => open({ type: 'account', item: selectedAccount })}><FiEdit3 /> Editar</button><button className="button soft danger-soft" onClick={() => remove(`/api/accounts/${accountId(selectedAccount)}`, 'esta cuenta')}><FiTrash2 /></button></div></div><Surface title="Movimientos de esta cuenta"><div className="transaction-table">{loadingTransactions ? <Empty text="Cargando movimientos…" /> : accountError ? <Empty text={accountError} /> : accountTransactions.length ? accountTransactions.map((item) => <article key={item.id} className="transaction-row"><span className={Number(item.amount) < 0 ? 'round expense' : 'round income'}>{Number(item.amount) < 0 ? <FiArrowUpRight /> : <FiArrowDownLeft />}</span><div className="transaction-info"><b>{item.description}</b><small>{item.category || 'Sin categoría'} · {formatDate(item.date)}</small></div><strong className={Number(item.amount) < 0 ? 'negative' : 'positive'}>{signedMoney(item.amount)}</strong><div className="row-actions"><button onClick={() => open({ type: 'transaction', item })}><FiEdit3 /></button><button onClick={() => remove(`/api/transactions/${item.id}`, 'este movimiento')}><FiTrash2 /></button></div></article>) : <Empty text="Aún no hay movimientos en esta cuenta." />}</div></Surface></section>
  const add = () => open({ type: tab === 'accounts' ? 'account' : tab === 'debts' ? 'debt' : 'rule' })
  return <section className="page"><div className="section-line"><div><h2>Mis finanzas</h2><p>Consulta y administra cada parte de tu dinero.</p></div><button className="button primary" onClick={add}><FiPlus /> Agregar</button></div><div className="segmented segmented-three"><button className={tab === 'accounts' ? 'active' : ''} onClick={() => changeTab('accounts')}>Cuentas</button><button className={tab === 'debts' ? 'active' : ''} onClick={() => changeTab('debts')}>Deudas</button><button className={tab === 'rules' ? 'active' : ''} onClick={() => changeTab('rules')}>Reglas</button></div>{tab === 'accounts' ? <div className="card-grid">{data.accounts.length ? data.accounts.map((item) => <article key={accountId(item)} className="account-card account-open" onClick={() => setSelectedAccount(item)}><span className="account-icon"><FiCreditCard /></span><p>{accountNames[item.account_type || item.type] || item.account_type}</p><h3>{item.account_name || item.name}</h3><strong>{money.format(Number(item.current_balance || 0))}</strong><div><button onClick={(event) => { event.stopPropagation(); open({ type: 'account', item }) }}><FiEdit3 /> Editar</button><button onClick={(event) => { event.stopPropagation(); remove(`/api/accounts/${accountId(item)}`, 'esta cuenta') }}><FiTrash2 /></button></div></article>) : <Empty text="Agrega una cuenta de efectivo, débito o crédito." />}</div> : tab === 'debts' ? <Surface title="Mis deudas"><div className="debt-list">{data.debts.length ? data.debts.map((item) => { const original = Number(item.original_amount); const remaining = Number(item.remaining_amount); const percent = original ? Math.min(100, (original - remaining) / original * 100) : 0; return <article key={item.debt_id} className="debt-card"><div><span className="round expense"><FiCreditCard /></span><div><h3>{item.debt_name}</h3><small>Pago mensual {money.format(Number(item.monthly_payment_amount))}</small></div></div><strong>{money.format(remaining)}</strong><i><em style={{ width: `${percent}%` }} /></i><footer><span>{percent.toFixed(0)}% liquidado</span><div><button onClick={() => open({ type: 'debt', item })}><FiEdit3 /></button><button onClick={() => remove(`/api/debts/${item.debt_id}`, 'esta deuda')}><FiTrash2 /></button></div></footer></article> }) : <Empty text="Aquí aparecerán las deudas que registres." />}</div></Surface> : <><div className="split-buttons wallet-rule-actions"><button className="button soft" onClick={processRules}><FiRefreshCw /> Procesar hoy</button></div><div className="rule-grid">{data.rules.length ? data.rules.map((item) => <article className={`rule-card ${item.is_active === false ? 'inactive' : ''}`} key={item.id}><div className="rule-top"><span className="round lilac"><FiRepeat /></span><button onClick={() => remove(`/api/rules/${item.id}`, 'esta regla')}><FiTrash2 /></button></div><h3>{item.description}</h3><strong>{money.format(Number(item.amount))}</strong><p>{frequencyNames[item.frequency] || item.frequency} · {item.is_active === false ? 'Pausada' : 'Activa'}</p><div className="rule-dates"><span><small>Inicia</small>{formatDate(item.start_date || item.next_execution_date)}</span><span><small>Finaliza</small>{item.end_date ? formatDate(item.end_date) : 'Sin final'}</span></div><footer><button onClick={() => open({ type: 'rule', item })}><FiEdit3 /> Editar</button><button onClick={() => open({ type: 'transaction', item: { description: item.description, amount: Math.abs(Number(item.amount)), type: item.type, account_id: item.account_id, category: item.category } })}>Registrar ahora</button></footer></article>) : <Empty text="Crea una regla y deja que la app recuerde por ti." />}</div></>}</section>
}

function Rules({ data, open, remove, processRules }) { return <section className="page"><div className="section-line"><div><h2>Tu dinero en piloto automático</h2><p>Reglas con fecha de inicio, fecha final y frecuencia.</p></div><div className="split-buttons"><button className="button soft" onClick={processRules}><FiRefreshCw /> Procesar hoy</button><button className="button primary" onClick={() => open({ type: 'rule' })}><FiPlus /> Nueva regla</button></div></div><Surface title="Reglas programadas"><div className="rule-grid">{data.rules.length ? data.rules.map((item) => <article className={`rule-card ${item.is_active === false ? 'inactive' : ''}`} key={item.id}><div className="rule-top"><span className="round lilac"><FiRepeat /></span><button onClick={() => remove(`/api/rules/${item.id}`, 'esta regla')}><FiTrash2 /></button></div><h3>{item.description}</h3><strong>{money.format(Number(item.amount))}</strong><p>{frequencyNames[item.frequency] || item.frequency} · {item.is_active === false ? 'Pausada' : 'Activa'}</p><div className="rule-dates"><span><small>Inicia</small>{formatDate(item.start_date || item.next_execution_date)}</span><span><small>Finaliza</small>{item.end_date ? formatDate(item.end_date) : 'Sin final'}</span></div><footer><button onClick={() => open({ type: 'rule', item })}><FiEdit3 /> Editar</button><button onClick={() => open({ type: 'transaction', item: { description: item.description, amount: Math.abs(Number(item.amount)), type: item.type, account_id: item.account_id, category: item.category } })}>Registrar ahora</button></footer></article>) : <Empty text="Crea una regla y deja que la app recuerde por ti." />}</div></Surface></section> }

function Projection({ request, balance }) { const [months, setMonths] = useState(3); const [result, setResult] = useState(null); const [error, setError] = useState(''); const calculate = async () => { try { setError(''); setResult(await request('get', `/api/projection?months_ahead=${months}`)) } catch (e) { setError(e.message) } }; return <section className="page"><section className="projection-banner"><div><p className="eyebrow">MIRA HACIA ADELANTE</p><h2>Que el futuro no te tome por sorpresa.</h2><p>Usamos tus reglas, tarjetas y pagos para estimar tu flujo de efectivo.</p></div><div><small>Saldo actual</small><strong>{money.format(Number(balance))}</strong></div></section><Surface title="Calcula tu proyección"><div className="projection-controls"><label>¿Cuántos meses quieres mirar?<input type="range" min="1" max="24" value={months} onChange={(e) => setMonths(Number(e.target.value))} /><b>{months} meses</b></label><button className="button primary" onClick={calculate}><FiTrendingUp /> Ver proyección</button></div></Surface>{error && <p className="form-error">{error}</p>}{result && <><div className="forecast-total"><span>Saldo estimado al final</span><strong>{money.format(Number(result.projected_balance_end))}</strong><small>{formatDate(result.projection_start_date)} — {formatDate(result.projection_end_date)}</small></div><Surface title="Tu línea de tiempo"><List items={result.simulation_log || []} icon={<FiCalendar />} render={(item) => <><div><b>{item.description}</b><small>{formatDate(item.date)}</small></div><strong className={Number(item.amount) < 0 ? 'negative' : 'positive'}>{signedMoney(item.amount)}</strong></>} empty="No hay eventos dentro de ese periodo." /></Surface></>}</section> }

function Settings({ logout }) { return <section className="page settings-page"><Surface title="Tu cuenta"><div className="profile"><span>f</span><div><h3>Mi espacio financiero</h3><p>Tu sesión está protegida con token.</p></div></div></Surface><Surface title="Apariencia"><div className="setting-row"><div><b>Tema floréa</b><small>Rosa moderno, suave y luminoso</small></div><span className="theme-dots"><i /><i /><i /></span></div></Surface><button className="danger-button" onClick={logout}><FiLogOut /> Cerrar sesión</button></section> }

function Dialog({ type, item = {}, accounts, onClose, save }) { const titles = { transaction: item.id ? 'Editar movimiento' : 'Nuevo movimiento', account: item.id || item.account_id ? 'Editar cuenta' : 'Nueva cuenta', debt: item.debt_id ? 'Editar deuda' : 'Nueva deuda', rule: item.id ? 'Editar regla' : 'Nueva regla' }; return <div className="dialog-backdrop" onMouseDown={onClose}><section className="dialog" onMouseDown={(e) => e.stopPropagation()}><header><div><p className="eyebrow">TU ESPACIO</p><h2>{titles[type]}</h2></div><button className="close" onClick={onClose}><FiX /></button></header>{type === 'transaction' && <TransactionForm item={item} accounts={accounts} save={save} />}{type === 'account' && <AccountForm item={item} save={save} />}{type === 'debt' && <DebtForm item={item} save={save} />}{type === 'rule' && <RuleForm item={item} accounts={accounts} save={save} />}</section></div> }

function TransactionForm({ item, accounts, save }) { const [form, setForm] = useState({ description: item.description || '', amount: item.amount ? Math.abs(Number(item.amount)) : '', type: item.type || 'expense', category: item.category || '', account_id: item.account_id || '', installments: item.installments || 1, date: item.date ? item.date.slice(0, 16) : `${today}T12:00` }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); save(item.id ? 'patch' : 'post', item.id ? `/api/transactions/${item.id}` : '/api/transactions/new', { ...form, account_id: form.account_id ? Number(form.account_id) : undefined, amount: String(form.amount) }, 'Movimiento guardado.') }}><Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[['expense', 'Gasto'], ['income', 'Ingreso'], ['debt_payment', 'Pago de deuda']]} /><Field label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><Field label="Monto" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /><Field label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ej. Comida" /><Select label="Cuenta" value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} options={[['', 'Efectivo automático'], ...accounts.map((a) => [String(accountId(a)), a.account_name || a.name])]} /><Field label="Fecha" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /><Field label="Mensualidades" type="number" min="1" value={form.installments} onChange={(e) => setForm({ ...form, installments: Number(e.target.value) })} /><button className="button primary wide">Guardar movimiento <FiArrowUpRight /></button></form> }
function AccountForm({ item, save }) { const [form, setForm] = useState({ name: item.account_name || item.name || '', type: item.account_type || item.type || 'cash', closing_date: item.closing_date || '', payment_date: item.payment_date || '' }); const id = accountId(item); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); const payload = { name: form.name, type: form.type }; if (form.type === 'credit_card' && form.closing_date) { payload.closing_date = Number(form.closing_date); payload.payment_date = Number(form.payment_date) } save(id ? 'patch' : 'post', id ? `/api/accounts/${id}` : '/api/accounts/new', payload, 'Cuenta guardada.') }}><Field label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /><Select label="Tipo de cuenta" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={Object.entries(accountNames)} />{form.type === 'credit_card' && <><Field label="Día de corte" type="number" min="1" max="31" value={form.closing_date} onChange={(e) => setForm({ ...form, closing_date: e.target.value })} required={!id} /><Field label="Día de pago" type="number" min="1" max="31" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} required={!id} /></>}<button className="button primary wide">Guardar cuenta <FiArrowUpRight /></button></form> }
function DebtForm({ item, save }) { const [form, setForm] = useState({ debt_name: item.debt_name || '', original_amount: item.original_amount || '', monthly_payment_amount: item.monthly_payment_amount || '', term_months: item.term_months || 12, frequency: item.frequency || 'monthly', first_payment_date: item.first_payment_date || today }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); const payload = { ...form, term_months: Number(form.term_months) }; save(item.debt_id ? 'patch' : 'post', item.debt_id ? `/api/debts/${item.debt_id}` : '/api/debts/new', payload, 'Deuda guardada.') }}><Field label="Nombre de la deuda" value={form.debt_name} onChange={(e) => setForm({ ...form, debt_name: e.target.value })} required /><Field label="Monto original" type="number" min="0.01" step="0.01" value={form.original_amount} onChange={(e) => setForm({ ...form, original_amount: e.target.value })} required /><Field label="Pago periódico" type="number" min="0.01" step="0.01" value={form.monthly_payment_amount} onChange={(e) => setForm({ ...form, monthly_payment_amount: e.target.value })} required /><Field label="Plazo (meses)" type="number" min="1" value={form.term_months} onChange={(e) => setForm({ ...form, term_months: e.target.value })} required />{!item.debt_id && <><Select label="Frecuencia" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} options={[['monthly', 'Mensual'], ['bi_weekly', 'Quincenal'], ['weekly', 'Semanal']]} /><Field label="Primer pago" type="date" value={form.first_payment_date} onChange={(e) => setForm({ ...form, first_payment_date: e.target.value })} required /></>}<button className="button primary wide">Guardar deuda <FiArrowUpRight /></button></form> }
function RuleForm({ item, accounts, save }) { const [form, setForm] = useState({ description: item.description || '', amount: item.amount ? Math.abs(Number(item.amount)) : '', type: item.type || 'expense', frequency: item.frequency || 'monthly', start_date: item.start_date || item.next_execution_date || today, end_date: item.end_date || '', account_id: item.account_id || '', category: item.category || '', is_active: item.is_active !== false }); return <form className="form-grid" onSubmit={(e) => { e.preventDefault(); const payload = { ...form, amount: String(form.amount), account_id: form.account_id ? Number(form.account_id) : null, end_date: form.end_date || null }; save(item.id ? 'patch' : 'post', item.id ? `/api/rules/${item.id}` : '/api/rules/new', payload, 'Regla guardada.') }}><Field label="Descripción" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /><Field label="Monto" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /><Select label="Es un..." value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[['expense', 'Gasto'], ['income', 'Ingreso']]} /><Select label="Frecuencia" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} options={Object.entries(frequencyNames)} /><Field label="Fecha de inicio" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required /><Field label="Fecha final (opcional)" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /><Select label="Cuenta" value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} options={[['', 'Efectivo automático'], ...accounts.map((a) => [String(accountId(a)), a.account_name || a.name])]} /><Field label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /><label className="toggle"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /><span /> Regla activa</label><button className="button primary wide">Guardar regla <FiArrowUpRight /></button></form> }

function Field({ label, ...props }) { return <label className="field"><span>{label}</span><input {...props} /></label> }
function Select({ label, options, ...props }) { return <label className="field"><span>{label}</span><select {...props}>{options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label> }
function List({ items, render, empty, icon }) { return <div className="list">{items.length ? items.map((item, index) => <article className="list-row" key={item.id || `${item.description}-${index}`}><span className="round lilac">{icon}</span>{render(item)}</article>) : <Empty text={empty} />}</div> }
function Empty({ text }) { return <div className="empty"><span>✦</span><p>{text}</p></div> }
function formatDate(value) { if (!value) return 'Sin fecha'; const date = new Date(value.includes('T') ? value : `${value}T12:00:00`); return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(date) }
function signedMoney(value) { const numeric = Number(value); return `${numeric > 0 ? '+' : '−'}${money.format(Math.abs(numeric))}` }
function accountId(item) { return item?.account_id || item?.id }
export default App
