import type { Tag, Task, TaskPayload, TaskStatus, User } from './types'

const apiUrl = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

type ApiFailure = { message?: string }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('taskmanager-token')
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const failure = (await response.json().catch(() => ({}))) as ApiFailure
    throw new Error(failure.message ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  async login(email: string, password: string) {
    return request<{ data: { user: User; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async register(email: string, password: string) {
    return request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async getTasks(filters: { status?: TaskStatus; search?: string }) {
    const query = new URLSearchParams({ limit: '100', sort: 'created_at', order: 'desc' })
    if (filters.status) query.set('status', filters.status)
    if (filters.search) query.set('search', filters.search)
    const response = await request<{ data: { tasks: Task[] } }>(`/tasks?${query}`)
    return response.data.tasks
  },

  async createTask(payload: TaskPayload) {
    const response = await request<{ data: { task: Task } }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return response.data.task
  },

  async updateTask(id: number, payload: Partial<TaskPayload> & { status?: TaskStatus }) {
    const response = await request<{ data: { task: Task } }>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
    return response.data.task
  },

  async deleteTask(id: number) {
    await request(`/tasks/${id}`, { method: 'DELETE' })
  },

  async getStats() {
    const response = await request<{ data: { stats: Record<TaskStatus, number> } }>('/tasks/stats')
    return response.data.stats
  },

  async getTags() {
    const response = await request<{ data: { tags: Tag[] } }>('/tags?limit=100')
    return response.data.tags
  },
}
