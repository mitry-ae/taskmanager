import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedError, ValidationError } from "../common/errors";
import tasksService from "../modules/tasks/tasks.service";

export async function verifyTaskOwnership(req: Request, res: Response, next: NextFunction) {
    const userPayload = req.user
    if (!userPayload) throw new UnauthorizedError()

    const taskId = Number(req.params.taskId)
    if (!taskId) throw new ValidationError("Task Id is invalid")

    await tasksService.getTaskById(taskId, userPayload.id)

    next()
}