import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from './api'
import type { Task, TaskPayload, TaskPriority, TaskStatus, User } from './types'

const statusNames: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
}

const priorityNames: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
}

function Brand() {
  return <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>Task Manager</div>
}

function Orbit() {
  return <div className="orbit" aria-hidden="true">
    <div className="planet">{Array.from({ length: 11 }, (_, index) => <i key={index} style={{ width: `${10 + index * 8}%` }} />)}</div>
    <span className="ring" /><span className="star" />
  </div>
}

function getSavedUser(): User | null {
  const value = localStorage.getItem('taskmanager-user')
  if (!value) return null
  try {
    return JSON.parse(value) as User
  } catch {
    localStorage.removeItem('taskmanager-user')
    return null
  }
}

function App() {
  const [user, setUser] = useState<User | null>(getSavedUser)

  function handleAuthenticatedUser(nextUser: User, token: string) {
    localStorage.setItem('taskmanager-token', token)
    localStorage.setItem('taskmanager-user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  function logout() {
    localStorage.removeItem('taskmanager-token')
    localStorage.removeItem('taskmanager-user')
    setUser(null)
  }

  return user ? <Dashboard user={user} onLogout={logout} /> : <AuthForm onAuthenticated={handleAuthenticatedUser} />
}

function AuthForm({ onAuthenticated }: { onAuthenticated: (user: User, token: string) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      if (mode === 'register') {
        await api.register(email, password)
      }
      const response = await api.login(email, password)
      onAuthenticated(response.data.user, response.data.token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить запрос')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
      <aside className="auth-art"><Brand /><Orbit /></aside>
      <section className="auth-card">
        <h1>{mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}</h1>
        <p className="muted">{mode === 'login' ? 'Войдите, чтобы открыть свои задачи.' : 'Укажите почту и придумайте пароль.'}</p>
        <form onSubmit={submit} className="stack">
          <label>Электронная почта<input type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Пароль<input type="password" placeholder={mode === 'register' ? 'Минимум 6 символов' : 'Введите пароль'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === 'register' ? 6 : 1} required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={isSubmitting}>{isSubmitting ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}<span aria-hidden="true">↗</span></button>
        </form>
        <div className="auth-switch">{mode === 'login' ? 'Нет аккаунта?' : 'Уже есть аккаунт?'} <button disabled={isSubmitting} className="link-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
          {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
        </button></div>
      </section>
      </div>
    </main>
  )
}

const statuses = Object.keys(statusNames) as TaskStatus[]
const priorities = Object.keys(priorityNames) as TaskPriority[]
const moveLabels: Record<TaskStatus, string> = { todo: 'В план', in_progress: 'В работу', done: 'Завершить' }

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState({ todo: 0, in_progress: 0, done: 0 })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [revision, setRevision] = useState(0)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const timer = window.setTimeout(async () => {
      try {
        const [items, counts] = await Promise.all([
          api.getTasks({ search: search.trim() || undefined, status: status || undefined }),
          api.getStats(),
        ])
        if (active) { setTasks(items); setStats(counts) }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи')
      } finally {
        if (active) setLoading(false)
      }
    }, search ? 220 : 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [search, status, revision])

  async function changeTask(id: number, target?: TaskStatus) {
    setBusy(id)
    setError('')
    try {
      if (target) await api.updateTask(id, { status: target })
      else await api.deleteTask(id)
      setRevision(value => value + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось изменить задачу')
    } finally {
      setBusy(null)
    }
  }

  const total = statuses.reduce((sum, key) => sum + Number(stats[key] || 0), 0)
  const percent = total ? Math.round(stats.done * 100 / total) : 0
  return <main className="studio">
    <header className="mast"><Brand /><div className="account"><span>{user.email}</span><button className="quiet" onClick={onLogout}>Выйти ↗</button></div></header>
    <div className="workspace">
      <section className="cover">
        <div className="contours" aria-hidden="true">{Array.from({length: 18}, (_, i) => <i key={i} style={{ transform: `rotate(${i * 4}deg) scale(${1 - i * .027})` }} />)}</div>
        <div className="cover-copy"><h1>Мои задачи</h1>
          <div className="completion"><progress aria-label="Доля выполненных задач" value={percent} max={100} /><span>Завершено {stats.done} из {total}</span></div>
        </div>
      </section>
      <div className="board-tools">
        <nav className="views" aria-label="Фильтр задач">{(['', ...statuses] as const).map(key =>
          <button key={key} aria-pressed={status === key} onClick={() => setStatus(key)}>{key ? statusNames[key] : 'Все задачи'}</button>
        )}</nav>
        <div className="board-actions"><label className="search-box"><span aria-hidden="true" /><input type="search" aria-label="Поиск задач" placeholder="Поиск задач" value={search} onChange={event => setSearch(event.target.value)} /></label>
        <button className="create" onClick={() => setCreating(true)}>＋ Новая задача</button></div>
      </div>
      {error && <p className="error" role="alert">{error} <button className="quiet" onClick={() => setRevision(value => value + 1)}>Повторить</button></p>}
      <div className="board" aria-busy={loading}>
        {statuses.filter(key => !status || key === status).map(key => {
          const items = tasks.filter(task => task.status === key)
          return <section key={key} className={`lane ${key}`}>
            <header className="lane-head"><span className="status-symbol" aria-hidden="true" /><h2>{statusNames[key]}</h2><span className="count">{loading ? '…' : items.length}</span></header>
            <ul>{items.map(task => <li key={task.id} className="ticket">
              <div className="ticket-top"><span className={`priority ${task.priority}`}>{priorityNames[task.priority]} приоритет</span>
              <button className="trash" disabled={busy !== null || loading} aria-label={`Удалить задачу «${task.title}»`} title="Удалить задачу" onClick={() => void changeTask(task.id)}>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 10v7m4-7v7"/></svg>
              </button></div>
              <h3>{task.title}</h3>{task.description && <p>{task.description}</p>}
              <div className="metadata">{task.due_date && <time dateTime={task.due_date}>До {new Date(task.due_date).toLocaleDateString('ru-RU')}</time>}{task.tags?.map(tag => <span key={tag.id}>#{tag.name}</span>)}</div>
              <footer>{statuses.filter(target => target !== key).map(target => <button key={target} disabled={busy !== null || loading} onClick={() => void changeTask(task.id, target)}>{moveLabels[target]} <span aria-hidden="true">↗</span></button>)}</footer>
            </li>)}</ul>
            {!items.length && <p className="lane-empty">{loading ? 'Загрузка…' : error ? 'Данные недоступны' : search.trim() ? 'Совпадений нет' : 'Пока нет задач'}</p>}
          </section>
        })}
      </div>
    </div>
    {creating && <TaskForm onClose={() => setCreating(false)} onCreate={async payload => {
      await api.createTask(payload)
      setRevision(value => value + 1)
    }} />}
  </main>
}

function TaskForm({ onCreate, onClose }: { onCreate: (payload: TaskPayload) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onCreate({ title, ...(description && { description }), priority, ...(dueDate && { due_date: dueDate }) })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать задачу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <dialog ref={dialog} className="composer" aria-labelledby="composer-title" onCancel={(event) => { event.preventDefault(); if (!isSubmitting) onClose() }}>
      <header><h2 id="composer-title">Новая задача</h2><button className="quiet" disabled={isSubmitting} onClick={onClose} aria-label="Закрыть">×</button></header>
      <form onSubmit={submit} className="stack">
        <label>Название<input autoFocus placeholder="Что нужно сделать?" value={title} onChange={(event) => setTitle(event.target.value)} minLength={4} maxLength={100} required /></label>
        <label>Описание<textarea placeholder="Добавьте подробности" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <fieldset><legend>Приоритет</legend><div className="choices">
          {priorities.map((item) => <label key={item}><input type="radio" name="priority" checked={priority === item} onChange={() => setPriority(item)} /><span className={item}>{priorityNames[item]}</span></label>)}
        </div></fieldset>
        <label>Срок<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={isSubmitting}>{isSubmitting ? 'Создание…' : 'Добавить задачу'}<span aria-hidden="true">＋</span></button>
      </form>
    </dialog>
  )
}

export default App
