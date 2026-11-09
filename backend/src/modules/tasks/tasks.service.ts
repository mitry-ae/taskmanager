import { ValidationError, NotFoundError } from "../../common/errors";
import { withTransaction } from "../../db/withTransaction";
import tagsRepository from "../tags/tags.repository";
import tagsService from "../tags/tags.service";
import { type TaskPayload, type TaskFilters, type UpdateTaskPayload, StatusTask } from "./tasks.dto";
import tasksRepository from "./tasks.repository";



class TasksService {
    async createTask(task: TaskPayload, user_id: number) {

        const createdTask = await tasksRepository.createTask(task, user_id)

        return createdTask

    }

    async getTask(user_id: number, filters: TaskFilters) {
        const tasks = await tasksRepository.getTasks(user_id, filters)

        return tasks
    }

    async getTaskById(id: number, user_id: number) {
        const task = await tasksRepository.getTaskById(id, user_id)
        
        if (!task) throw new NotFoundError()
        return task
    }

    async updateTask(id: number, user_id: number, updatePayload: UpdateTaskPayload) {
        const task = await tasksRepository.updateTask(id, user_id, updatePayload)

        if (!task) throw new NotFoundError()
        return task
    }

    async deleteTask(id: number, user_id: number) {

        const task = await tasksRepository.deleteTask(id, user_id)
        if (!task) throw new NotFoundError()

        return true
    }

    async getStats(user_id: number) {
        const statsData = await tasksRepository.getStats(user_id)
        const stats: Record<Exclude<StatusTask, undefined>, number> = {
            todo: 0,
            in_progress: 0,
            done: 0,
        }

        for (let item of statsData) {
            if (item.status === 'todo') stats.todo = Number(item.count)
            if (item.status === 'in_progress') stats.in_progress = Number(item.count)
            if (item.status === 'done') stats.done = Number(item.count)
        }

        return stats
    }

    async replaceTags(taskId: number, userId: number, tagIds: number[]) {
        await tagsService.assertAllBelongToUser(userId, tagIds)

        return await withTransaction(async (client) => {
            await tagsRepository.replaceTags(taskId, tagIds,  client)
        })
    }

}

export default new TasksService()