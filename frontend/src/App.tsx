import { useEffect, useMemo, useState } from 'react'
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
      <section className="auth-card">
        <p className="eyebrow">Task Manager API</p>
        <h1>{mode === 'login' ? 'Войти в задачи' : 'Создать аккаунт'}</h1>
        <p className="muted">Интерфейс для учебного API.</p>
        <form onSubmit={submit} className="stack">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={mode === 'register' ? 6 : 1} required /></label>
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={isSubmitting}>{isSubmitting ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</button>
        </form>
        <button className="link-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
          {mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </section>
    </main>
  )
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<Record<TaskStatus, number>>({ todo: 0, in_progress: 0, done: 0 })
  const [status, setStatus] = useState<TaskStatus | ''>('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  async function load() {
    setIsLoading(true)
    setError('')
    try {
      const [nextTasks, nextStats] = await Promise.all([api.getTasks({ status: status || undefined, search: search || undefined }), api.getStats()])
      setTasks(nextTasks)
      setStats(nextStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [status])

  const total = useMemo(() => Object.values(stats).reduce((sum, value) => sum + value, 0), [stats])

  async function createTask(payload: TaskPayload) {
    await api.createTask(payload)
    await load()
  }

  async function updateStatus(task: Task, nextStatus: TaskStatus) {
    await api.updateTask(task.id, { status: nextStatus })
    await load()
  }

  async function removeTask(id: number) {
    await api.deleteTask(id)
    await load()
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div><p className="eyebrow">Task Manager</p><h1>Мои задачи</h1></div>
        <div className="user-actions"><span>{user.email}</span><button className="secondary" onClick={onLogout}>Выйти</button></div>
      </header>
      <section className="stats" aria-label="Статистика задач">
        <Stat label="Всего" value={total} />
        <Stat label="К выполнению" value={stats.todo} />
        <Stat label="В работе" value={stats.in_progress} />
        <Stat label="Готово" value={stats.done} />
      </section>
      <section className="content-grid">
        <TaskForm onCreate={createTask} />
        <section className="tasks-panel">
          <div className="filters">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по задачам" />
            <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | '')}>
              <option value="">Все статусы</option>
              {Object.entries(statusNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
            <button className="secondary" onClick={() => void load()}>Найти</button>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          {isLoading ? <p className="muted">Загрузка…</p> : <TaskList tasks={tasks} onStatusChange={updateStatus} onDelete={removeTask} />}
        </section>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong></div>
}

function TaskForm({ onCreate }: { onCreate: (payload: TaskPayload) => Promise<void> }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await onCreate({ title, ...(description && { description }), priority, ...(dueDate && { due_date: dueDate }) })
      setTitle(''); setDescription(''); setPriority('medium'); setDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать задачу')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="task-form-panel">
      <h2>Новая задача</h2>
      <form onSubmit={submit} className="stack">
        <label>Название<input value={title} onChange={(event) => setTitle(event.target.value)} minLength={4} maxLength={100} required /></label>
        <label>Описание<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label>Приоритет<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>{Object.entries(priorityNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Срок<input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={isSubmitting}>{isSubmitting ? 'Создание…' : 'Добавить задачу'}</button>
      </form>
    </section>
  )
}

function TaskList({ tasks, onStatusChange, onDelete }: { tasks: Task[]; onStatusChange: (task: Task, status: TaskStatus) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  if (tasks.length === 0) return <p className="empty">Задач пока нет.</p>
  return <ul className="task-list">
    {tasks.map((task) => <li className="task-card" key={task.id}>
      <div className="task-card-main">
        <div className="task-title-row"><h3>{task.title}</h3><span className={`priority ${task.priority}`}>{priorityNames[task.priority]}</span></div>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta"><span>{task.due_date ? `Срок: ${new Date(task.due_date).toLocaleDateString('ru-RU')}` : 'Без срока'}</span>{task.tags?.map((tag) => <span className="tag" key={tag.id}>{tag.name}</span>)}</div>
      </div>
      <div className="task-card-actions">
        <select aria-label={`Статус задачи ${task.title}`} value={task.status} onChange={(event) => void onStatusChange(task, event.target.value as TaskStatus)}>{Object.entries(statusNames).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select>
        <button className="danger" onClick={() => void onDelete(task.id)}>Удалить</button>
      </div>
    </li>)}
  </ul>
}

export default App
