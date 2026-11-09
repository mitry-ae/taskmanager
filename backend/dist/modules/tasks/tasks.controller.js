"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../common/errors");
const tasks_service_1 = __importDefault(require("./tasks.service"));
const tasks_dto_1 = require("./tasks.dto");
class TasksController {
    createTask = async (req, res, next) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const result = tasks_dto_1.taskPayloadSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const taskPayload = result.data;
        const task = await tasks_service_1.default.createTask(taskPayload, userPayload.id);
        res.json({ status: "success", data: { task } });
    };
    getTasks = async (req, res, next) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const result = tasks_dto_1.taskFiltersSchema.safeParse(req.query);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const query = result.data;
        const tasks = await tasks_service_1.default.getTask(userPayload.id, query);
        res.json({ status: "success", data: { tasks } });
    };
    async getTaskById(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new errors_1.ValidationError("Invalid id");
        const task = await tasks_service_1.default.getTaskById(id, userPayload.id);
        res.json({ status: "success", data: { task: task } });
    }
    updateTask = async (req, res, next) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new errors_1.ValidationError("Invalid id");
        const result = tasks_dto_1.UpdateTaskPayloadSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const payload = result.data;
        if (Object.keys(payload).length === 0)
            throw new errors_1.ValidationError("no parameters were passed for updating");
        const task = await tasks_service_1.default.updateTask(id, userPayload.id, payload);
        res.json({ status: "success", data: { message: "task is udpdated", task } });
    };
    async deleteTask(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const id = Number(req.params.id);
        if (!Number.isFinite(id))
            throw new errors_1.ValidationError("Invalid id");
        await tasks_service_1.default.deleteTask(id, userPayload.id);
        res.json({ status: "success", data: { message: "task is deleted" } });
    }
    getStats = async (req, res, next) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const stats = await tasks_service_1.default.getStats(userPayload.id);
        return res.json({ status: "success", data: { stats: stats } });
    };
    async replaceTags(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const taskId = Number(req.params.taskId);
        if (!taskId)
            throw new errors_1.ValidationError("Expected task id");
        const result = tasks_dto_1.replaceTagsSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        await tasks_service_1.default.replaceTags(taskId, userPayload.id, result.data.tagIds);
        return res.json({ status: "success", data: { message: true } });
    }
}
exports.default = new TasksController();
