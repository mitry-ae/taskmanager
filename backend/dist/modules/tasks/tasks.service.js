"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../common/errors");
const withTransaction_1 = require("../../db/withTransaction");
const tags_repository_1 = __importDefault(require("../tags/tags.repository"));
const tags_service_1 = __importDefault(require("../tags/tags.service"));
const tasks_repository_1 = __importDefault(require("./tasks.repository"));
class TasksService {
    async createTask(task, user_id) {
        const createdTask = await tasks_repository_1.default.createTask(task, user_id);
        return createdTask;
    }
    async getTask(user_id, filters) {
        const tasks = await tasks_repository_1.default.getTasks(user_id, filters);
        return tasks;
    }
    async getTaskById(id, user_id) {
        const task = await tasks_repository_1.default.getTaskById(id, user_id);
        if (!task)
            throw new errors_1.NotFoundError();
        return task;
    }
    async updateTask(id, user_id, updatePayload) {
        const task = await tasks_repository_1.default.updateTask(id, user_id, updatePayload);
        if (!task)
            throw new errors_1.NotFoundError();
        return task;
    }
    async deleteTask(id, user_id) {
        const task = await tasks_repository_1.default.deleteTask(id, user_id);
        if (!task)
            throw new errors_1.NotFoundError();
        return true;
    }
    async getStats(user_id) {
        const statsData = await tasks_repository_1.default.getStats(user_id);
        const stats = {
            todo: 0,
            in_progress: 0,
            done: 0,
        };
        for (let item of statsData) {
            if (item.status === 'todo')
                stats.todo = Number(item.count);
            if (item.status === 'in_progress')
                stats.in_progress = Number(item.count);
            if (item.status === 'done')
                stats.done = Number(item.count);
        }
        return stats;
    }
    async replaceTags(taskId, userId, tagIds) {
        await tags_service_1.default.assertAllBelongToUser(userId, tagIds);
        return await (0, withTransaction_1.withTransaction)(async (client) => {
            await tags_repository_1.default.replaceTags(taskId, tagIds, client);
        });
    }
}
exports.default = new TasksService();
