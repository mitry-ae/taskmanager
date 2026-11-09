"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tasks_repository_1 = __importDefault(require("./tasks.repository"));
const tasks_service_1 = __importDefault(require("./tasks.service"));
const errors_1 = require("../../common/errors");
const withTransaction_1 = require("../../db/withTransaction");
const tags_service_1 = __importDefault(require("../tags/tags.service"));
const tags_repository_1 = __importDefault(require("../tags/tags.repository"));
vitest_1.vi.mock("./tasks.repository", () => ({
    default: {
        createTask: vitest_1.vi.fn(),
        getTasks: vitest_1.vi.fn(),
        getTaskById: vitest_1.vi.fn(),
        updateTask: vitest_1.vi.fn(),
        deleteTask: vitest_1.vi.fn(),
        getStats: vitest_1.vi.fn(),
        replaceTags: vitest_1.vi.fn()
    }
}));
vitest_1.vi.mock('../tags/tags.repository', () => ({
    default: { replaceTags: vitest_1.vi.fn() }
}));
vitest_1.vi.mock('../tags/tags.service', () => ({
    default: { assertAllBelongToUser: vitest_1.vi.fn() }
}));
vitest_1.vi.mock('../../db/withTransaction', () => ({
    withTransaction: vitest_1.vi.fn()
}));
const TASK = {
    id: 1,
    user_id: 1,
    title: "priority",
    description: null,
    status: "todo",
    priority: "high",
    due_date: "2026-07-15T17:10:00.000Z",
    created_at: "2026-07-21T17:51:38.250Z"
};
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
];
(0, vitest_1.describe)("tasks service tests", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("create task return correct task", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.createTask).mockResolvedValue(TASK);
        const task = await tasks_service_1.default.createTask({ title: TASK.title, priority: TASK.priority, due_date: new Date("2026-07-15T21:10") }, TASK.user_id);
        (0, vitest_1.expect)(task).toEqual(TASK);
    });
    (0, vitest_1.it)("getTask return correct array tasks", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getTasks).mockResolvedValue(tasks);
        const result = await tasks_service_1.default.getTask(1, { limit: 15, page: 1, sort: 'created_at', order: 'desc' });
        (0, vitest_1.expect)(result).toEqual(tasks);
    });
    (0, vitest_1.it)("getTask return empty array if tasks not found", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getTasks).mockResolvedValue([]);
        (0, vitest_1.expect)(await tasks_service_1.default.getTask(1, { limit: 15, page: 1, sort: 'created_at', order: 'desc' })).toStrictEqual([]);
    });
    (0, vitest_1.it)("getTaskById return correct task", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getTaskById).mockResolvedValue(TASK);
        (0, vitest_1.expect)(await tasks_service_1.default.getTaskById(1, 1)).toEqual(TASK);
    });
    (0, vitest_1.it)("getTaskById throw NotFoundError if task not found", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getTaskById).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(tasks_service_1.default.getTaskById(1, 1)).rejects.toThrow(errors_1.NotFoundError);
    });
    (0, vitest_1.it)("updateTask return correct task", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.updateTask).mockResolvedValue(TASK);
        (0, vitest_1.expect)(await tasks_service_1.default.updateTask(1, 1, { status: "todo" })).toEqual(TASK);
    });
    (0, vitest_1.it)("updateTask throw NotFoundError if task not found or task's another user", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.updateTask).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(tasks_service_1.default.updateTask(1, 1, { status: "todo" })).rejects.toThrow(errors_1.NotFoundError);
    });
    (0, vitest_1.it)("updateTask used id, user_id and updatePayload", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.updateTask).mockResolvedValue(TASK);
        await tasks_service_1.default.updateTask(1, 1, { status: "todo" });
        (0, vitest_1.expect)(tasks_repository_1.default.updateTask).toHaveBeenCalledWith(1, 1, { status: "todo" });
    });
    (0, vitest_1.it)("deleteTask return correct task", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.deleteTask).mockResolvedValue(TASK);
        (0, vitest_1.expect)(await tasks_service_1.default.deleteTask(1, 1)).toBe(true);
    });
    (0, vitest_1.it)("deleteTask throw NotFoundError if task not found or task's another user", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.deleteTask).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(tasks_service_1.default.deleteTask(1, 1)).rejects.toThrow(errors_1.NotFoundError);
    });
    (0, vitest_1.it)("getStats return correct data with all statuses", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getStats).mockResolvedValue([
            { status: "todo", count: "1" },
            { status: "in_progress", count: "2" },
            { status: "done", count: "3" }
        ]);
        (0, vitest_1.expect)(await tasks_service_1.default.getStats(1)).toEqual({ todo: 1, in_progress: 2, done: 3 });
        (0, vitest_1.expect)(tasks_repository_1.default.getStats).toHaveBeenCalledWith(1);
    });
    (0, vitest_1.it)("getStats return correct data without several statuses", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getStats).mockResolvedValue([
            { status: "todo", count: "1" },
            { status: "done", count: "3" }
        ]);
        (0, vitest_1.expect)(await tasks_service_1.default.getStats(1)).toEqual({ todo: 1, in_progress: 0, done: 3 });
        (0, vitest_1.expect)(tasks_repository_1.default.getStats).toHaveBeenCalledWith(1);
    });
    (0, vitest_1.it)("getStats return correct empty array", async () => {
        vitest_1.vi.mocked(tasks_repository_1.default.getStats).mockResolvedValue([]);
        (0, vitest_1.expect)(await tasks_service_1.default.getStats(1)).toEqual({ todo: 0, in_progress: 0, done: 0 });
        (0, vitest_1.expect)(tasks_repository_1.default.getStats).toHaveBeenCalledWith(1);
    });
});
(0, vitest_1.describe)("replaceTags", () => {
    const mockClient = {};
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
        vitest_1.vi.mocked(withTransaction_1.withTransaction).mockImplementation((fn) => fn(mockClient));
    });
    (0, vitest_1.it)('replaceTags вызывает tagsRepository.replaceTags с client из транзакции', async () => {
        vitest_1.vi.mocked(tags_service_1.default.assertAllBelongToUser).mockResolvedValue(undefined);
        await tasks_service_1.default.replaceTags(5, 1, [10, 20]);
        (0, vitest_1.expect)(tags_repository_1.default.replaceTags).toHaveBeenCalledWith(5, [10, 20], mockClient);
    });
    (0, vitest_1.it)('если assertAllBelongToUser кидает NotFoundError, транзакция не открывается', async () => {
        vitest_1.vi.mocked(tags_service_1.default.assertAllBelongToUser).mockRejectedValue(new errors_1.NotFoundError());
        await (0, vitest_1.expect)(tasks_service_1.default.replaceTags(5, 1, [10, 20])).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(withTransaction_1.withTransaction).not.toHaveBeenCalled();
        (0, vitest_1.expect)(tags_repository_1.default.replaceTags).not.toHaveBeenCalled();
    });
});
