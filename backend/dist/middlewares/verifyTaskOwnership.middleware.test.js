"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tasks_service_1 = __importDefault(require("../modules/tasks/tasks.service"));
const verifyTaskOwnership_middleware_1 = require("./verifyTaskOwnership.middleware");
const errors_1 = require("../common/errors");
vitest_1.vi.mock("../modules/tasks/tasks.service", () => ({
    default: {
        getTaskById: vitest_1.vi.fn()
    }
}));
const req = { user: { id: 1 }, params: { taskId: 1 } };
const res = {};
const next = vitest_1.vi.fn();
(0, vitest_1.describe)("verifyTaskOwnership middleware test", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("req.user undefined that return error", async () => {
        const req = {};
        await (0, vitest_1.expect)((0, verifyTaskOwnership_middleware_1.verifyTaskOwnership)(req, res, next)).rejects.toThrow(errors_1.UnauthorizedError);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("req.params.taskId was not digit that return validation error", async () => {
        const req = { user: { id: 1 }, params: { taskId: "abc" } };
        await (0, vitest_1.expect)((0, verifyTaskOwnership_middleware_1.verifyTaskOwnership)(req, res, next)).rejects.toThrow(errors_1.ValidationError);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
    (0, vitest_1.it)("tasksService.getTaskById resolved and next called", async () => {
        vitest_1.vi.mocked(tasks_service_1.default.getTaskById).mockResolvedValue({
            id: 1,
            user_id: 1,
            title: "priority",
            description: null,
            status: "todo",
            priority: "high",
            due_date: "2026-07-15T17:10:00.000Z",
            created_at: "2026-07-21T17:51:38.250Z"
        });
        await (0, verifyTaskOwnership_middleware_1.verifyTaskOwnership)(req, res, next);
        (0, vitest_1.expect)(next).toHaveBeenCalled();
    });
    (0, vitest_1.it)("tasksService.getTaskById reject not found and next not called", async () => {
        vitest_1.vi.mocked(tasks_service_1.default.getTaskById).mockRejectedValue(new errors_1.NotFoundError());
        await (0, vitest_1.expect)((0, verifyTaskOwnership_middleware_1.verifyTaskOwnership)(req, res, next)).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(next).not.toHaveBeenCalled();
    });
});
