import { type Request, type Response, type NextFunction } from "express";
import { UnauthorizedError, ValidationError, AppError } from "../../common/errors";
import tasksService from "./tasks.service";
import { TaskFilters, UpdateTaskPayload, taskFiltersSchema, taskPayloadSchema, UpdateTaskPayloadSchema, replaceTagsSchema } from "./tasks.dto";
import { z } from "zod"
import tagsService from "../tags/tags.service";


class TasksController {

    createTask = async (req: Request, res: Response, next: NextFunction) => {

        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const result = taskPayloadSchema.safeParse(req.body)

        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

        const taskPayload = result.data

        const task = await tasksService.createTask(taskPayload, userPayload.id)

        res.json({ status: "success", data: { task } })
    }

    getTasks = async (req: Request, res: Response, next: NextFunction) => {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const result = taskFiltersSchema.safeParse(req.query)

        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

        const query = result.data


        const tasks = await tasksService.getTask(userPayload.id, query)

        res.json({ status: "success", data: { tasks } })

    }

    async getTaskById(req: Request, res: Response, next: NextFunction) {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const id = Number(req.params.id)
        if (!Number.isFinite(id)) throw new ValidationError("Invalid id")

        const task = await tasksService.getTaskById(id, userPayload.id)

        res.json({ status: "success", data: { task: task } })

    }

    updateTask = async (req: Request, res: Response, next: NextFunction) => {

        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const id = Number(req.params.id)
        if (!Number.isFinite(id)) throw new ValidationError("Invalid id")

        const result = UpdateTaskPayloadSchema.safeParse(req.body)

        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)

        const payload = result.data

        if (Object.keys(payload).length === 0) throw new ValidationError("no parameters were passed for updating")

        const task = await tasksService.updateTask(id, userPayload.id, payload)

        res.json({ status: "success", data: { message: "task is udpdated", task } })
    }

    async deleteTask(req: Request, res: Response, next: NextFunction) {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const id = Number(req.params.id)
        if (!Number.isFinite(id)) throw new ValidationError("Invalid id")

        await tasksService.deleteTask(id, userPayload.id)

        res.json({ status: "success", data: { message: "task is deleted" } })

    }

    getStats = async (req: Request, res: Response, next: NextFunction) => {
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const stats = await tasksService.getStats(userPayload.id)

        return res.json({ status: "success", data: { stats: stats } })
    }


    async replaceTags(req: Request, res: Response, next: NextFunction) {
        
        const userPayload = req.user
        if (!userPayload) throw new UnauthorizedError()

        const taskId = Number(req.params.taskId)
        if (!taskId) throw new ValidationError("Expected task id")

        const result = replaceTagsSchema.safeParse(req.body)
        if (!result.success) throw new ValidationError(result.error.issues[0]?.message)
        
        await tasksService.replaceTags(taskId, userPayload.id, result.data.tagIds) 

        return res.json({status: "success", data: {message: true}})
    }
}

export default new TasksController()