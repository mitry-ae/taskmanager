"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTaskOwnership = verifyTaskOwnership;
const errors_1 = require("../common/errors");
const tasks_service_1 = __importDefault(require("../modules/tasks/tasks.service"));
async function verifyTaskOwnership(req, res, next) {
    const userPayload = req.user;
    if (!userPayload)
        throw new errors_1.UnauthorizedError();
    const taskId = Number(req.params.taskId);
    if (!taskId)
        throw new errors_1.ValidationError("Task Id is invalid");
    await tasks_service_1.default.getTaskById(taskId, userPayload.id);
    next();
}
