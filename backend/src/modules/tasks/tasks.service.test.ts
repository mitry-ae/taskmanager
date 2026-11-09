import { it, test, describe, expect, vi, beforeEach } from 'vitest'
import tasksRepository from './tasks.repository'
import tasksService from './tasks.service'
import { TaskPayload } from './tasks.dto'
import { NotFoundError } from '../../common/errors'
import { withTransaction } from '../../db/withTransaction'
import tagsService from '../tags/tags.service'
import tagsRepository from '../tags/tags.repository'


vi.mock("./tasks.repository", () => ({
    default: {
        createTask: vi.fn(),
        getTasks: vi.fn(),
        getTaskById: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
        getStats: vi.fn(),
        replaceTags: vi.fn()
    }
}))

vi.mock('../tags/tags.repository', () => ({
    default: { replaceTags: vi.fn() }
}))

vi.mock('../tags/tags.service', () => ({
    default: { assertAllBelongToUser: vi.fn() }
}))

vi.mock('../../db/withTransaction', () => ({
    withTransaction: vi.fn()
}))

const TASK = {
    id: 1,
    user_id: 1,
    title: "priority",
    description: null,
    status: "todo",
    priority: "high",
    due_date: "2026-07-15T17:10:00.000Z",
    created_at: "2026-07-21T17:51:38.250Z"
}

const tasks = [
    {
        id: 1,
        user_id: 1,
        title: "priority",
        description: null,
        status: "todo",
        priority: "high",
        due_date: "2026-07-15T17:10:00.000Z",
        created_at: "2026-07-21T17:51:38.250Z"
    },
    {
        id: 2,
        user_id: 1,
        title: "another task",
        description: null,
        status: "todo",
        priority: "low",
        due_date: "2026-07-15T17:10:00.000Z",
        created_at: "2026-07-21T17:51:38.250Z"
    }
]

describe("tasks service tests", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("create task return correct task", async () => {
        vi.mocked(tasksRepository.createTask).mockResolvedValue(TASK)

        const task = await tasksService.createTask({ title: TASK.title, priority: TASK.priority, due_date: new Date("2026-07-15T21:10") } as TaskPayload, TASK.user_id)

        expect(task).toEqual(TASK)
    })

    it("getTask return correct array tasks", async () => {
        vi.mocked(tasksRepository.getTasks).mockResolvedValue(tasks)
        const result = await tasksService.getTask(1, { limit: 15, page: 1, sort: 'created_at', order: 'desc' })

        expect(result).toEqual(tasks)
    })

    it("getTask return empty array if tasks not found", async () => {
        vi.mocked(tasksRepository.getTasks).mockResolvedValue([])

        expect(await tasksService.getTask(1, { limit: 15, page: 1, sort: 'created_at', order: 'desc' })).toStrictEqual([])
    })

    it("getTaskById return correct task", async () => {
        vi.mocked(tasksRepository.getTaskById).mockResolvedValue(TASK)

        expect(await tasksService.getTaskById(1, 1)).toEqual(TASK)
    })

    it("getTaskById throw NotFoundError if task not found", async () => {
        vi.mocked(tasksRepository.getTaskById).mockResolvedValue(undefined)

        await expect(tasksService.getTaskById(1, 1)).rejects.toThrow(NotFoundError)
    })

    it("updateTask return correct task", async () => {
        vi.mocked(tasksRepository.updateTask).mockResolvedValue(TASK)

        expect(await tasksService.updateTask(1, 1, { status: "todo" })).toEqual(TASK)
    })

    it("updateTask throw NotFoundError if task not found or task's another user", async () => {
        vi.mocked(tasksRepository.updateTask).mockResolvedValue(undefined)

        await expect(tasksService.updateTask(1, 1, { status: "todo" })).rejects.toThrow(NotFoundError)
    })

    it("updateTask used id, user_id and updatePayload", async () => {
        vi.mocked(tasksRepository.updateTask).mockResolvedValue(TASK)
        await tasksService.updateTask(1, 1, { status: "todo" })
        expect(tasksRepository.updateTask).toHaveBeenCalledWith(1, 1, { status: "todo" })
    })

    it("deleteTask return correct task", async () => {
        vi.mocked(tasksRepository.deleteTask).mockResolvedValue(TASK)

        expect(await tasksService.deleteTask(1, 1)).toBe(true)
    })

    it("deleteTask throw NotFoundError if task not found or task's another user", async () => {
        vi.mocked(tasksRepository.deleteTask).mockResolvedValue(undefined)

        await expect(tasksService.deleteTask(1, 1)).rejects.toThrow(NotFoundError)
    })

    it("getStats return correct data with all statuses", async () => {
        vi.mocked(tasksRepository.getStats).mockResolvedValue([
            {status: "todo", count: "1"},
            {status: "in_progress", count: "2"},
            {status: "done", count: "3"}
        ])

        expect (await tasksService.getStats(1)).toEqual({todo: 1, in_progress: 2, done: 3})
        expect(tasksRepository.getStats).toHaveBeenCalledWith(1)
    })

    it("getStats return correct data without several statuses", async () => {
        vi.mocked(tasksRepository.getStats).mockResolvedValue([
            {status: "todo", count: "1"},
            {status: "done", count: "3"}
        ])

        expect (await tasksService.getStats(1)).toEqual({todo: 1, in_progress: 0, done: 3})
        expect(tasksRepository.getStats).toHaveBeenCalledWith(1)
    })

    it("getStats return correct empty array", async () => {
        vi.mocked(tasksRepository.getStats).mockResolvedValue([])

        expect (await tasksService.getStats(1)).toEqual({todo: 0, in_progress: 0, done: 0})
        expect(tasksRepository.getStats).toHaveBeenCalledWith(1)
    })
})

describe("replaceTags", () => {
    const mockClient = {} as any

    beforeEach(() => {
        vi.resetAllMocks()

        vi.mocked(withTransaction).mockImplementation((fn) => fn(mockClient))
    })

     it('replaceTags вызывает tagsRepository.replaceTags с client из транзакции', async () => {
        vi.mocked(tagsService.assertAllBelongToUser).mockResolvedValue(undefined)

        await tasksService.replaceTags(5, 1, [10, 20])

        expect(tagsRepository.replaceTags).toHaveBeenCalledWith(5, [10, 20], mockClient)
    })

    it('если assertAllBelongToUser кидает NotFoundError, транзакция не открывается', async () => {
        vi.mocked(tagsService.assertAllBelongToUser).mockRejectedValue(new NotFoundError())

        await expect(tasksService.replaceTags(5, 1, [10, 20])).rejects.toThrow(NotFoundError)

        expect(withTransaction).not.toHaveBeenCalled()
        expect(tagsRepository.replaceTags).not.toHaveBeenCalled()
    })
})