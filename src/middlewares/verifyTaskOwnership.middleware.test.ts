import { it, describe, vi, beforeEach, expect } from 'vitest'
import tasksService from '../modules/tasks/tasks.service'
import { verifyTaskOwnership } from './verifyTaskOwnership.middleware'
import { NextFunction, Request, Response } from 'express'
import { UnauthorizedError, ValidationError, NotFoundError } from '../common/errors'

vi.mock("../modules/tasks/tasks.service", () => ({
    default: {

        getTaskById: vi.fn()
    }
}))


const req = { user: { id: 1 }, params: { taskId: 1 } } as unknown as Request
const res = {} as Response
const next = vi.fn() as NextFunction

describe("verifyTaskOwnership middleware test", () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    it("req.user undefined that return error", async () => {
        const req = {} as Request

        await expect(verifyTaskOwnership(req, res, next)).rejects.toThrow(UnauthorizedError)
        expect(next).not.toHaveBeenCalled()
    })

    it("req.params.taskId was not digit that return validation error", async () => {
        const req = { user: { id: 1 }, params: { taskId: "abc" } } as unknown as Request

        await expect(verifyTaskOwnership(req, res, next)).rejects.toThrow(ValidationError)
        expect(next).not.toHaveBeenCalled()
    })

    it("tasksService.getTaskById resolved and next called", async () => {

        vi.mocked(tasksService.getTaskById).mockResolvedValue({
            id: 1,
            user_id: 1,
            title: "priority",
            description: null,
            status: "todo",
            priority: "high",
            due_date: "2026-07-15T17:10:00.000Z",
            created_at: "2026-07-21T17:51:38.250Z"
        })
        await verifyTaskOwnership(req, res, next)

        expect(next).toHaveBeenCalled()
    })

    it("tasksService.getTaskById reject not found and next not called", async () => {

        vi.mocked(tasksService.getTaskById).mockRejectedValue(new NotFoundError())
        await expect(verifyTaskOwnership(req, res, next)).rejects.toThrow(NotFoundError)

        expect(next).not.toHaveBeenCalled()
    })
})
