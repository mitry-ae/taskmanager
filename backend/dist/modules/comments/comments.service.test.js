"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const comments_repository_1 = __importDefault(require("./comments.repository"));
const comments_service_1 = __importDefault(require("./comments.service"));
const errors_1 = require("../../common/errors");
vitest_1.vi.mock("./comments.repository", () => ({
    default: {
        createComment: vitest_1.vi.fn(),
        getComments: vitest_1.vi.fn(),
        updateComment: vitest_1.vi.fn(),
        deleteComment: vitest_1.vi.fn()
    }
}));
const comment = {
    id: 6,
    task_id: 2,
    user_id: 3,
    content: "just content",
    created_at: "2026-07-23T09:19:37.469Z"
};
const comments = [
    {
        id: 6,
        task_id: 2,
        user_id: 3,
        content: "just content",
        created_at: "2026-07-23T09:19:37.469Z"
    },
    {
        id: 1,
        task_id: 2,
        user_id: 3,
        content: "just content 2",
        created_at: "2026-07-23T09:19:37.469Z"
    }
];
(0, vitest_1.describe)("comments service test", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("createComment return correct comment", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.createComment).mockResolvedValue(comment);
        (0, vitest_1.expect)(await comments_service_1.default.createComment({ content: comment.content }, 3, 2)).toEqual(comment);
        (0, vitest_1.expect)(comments_repository_1.default.createComment).toHaveBeenCalledWith({ content: comment.content }, 3, 2);
    });
    (0, vitest_1.it)("getComments return correct comments", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.getComments).mockResolvedValue(comments);
        (0, vitest_1.expect)(await comments_service_1.default.getComments(3, 2, { limit: 2, page: 1 })).toEqual(comments);
        (0, vitest_1.expect)(comments_repository_1.default.getComments).toHaveBeenCalledWith(3, 2, { limit: 2, page: 1 });
    });
    (0, vitest_1.it)("getComments return empty array when comments not found", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.getComments).mockResolvedValue([]);
        (0, vitest_1.expect)(await comments_service_1.default.getComments(3, 2, { limit: 2, page: 1 })).toEqual([]);
        (0, vitest_1.expect)(comments_repository_1.default.getComments).toHaveBeenCalledWith(3, 2, { limit: 2, page: 1 });
    });
    (0, vitest_1.it)("updateComment return correct comment", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.updateComment).mockResolvedValue(comment);
        (0, vitest_1.expect)(await comments_service_1.default.updateComment(6, 3, 2, { content: comment.content })).toEqual(comment);
        (0, vitest_1.expect)(comments_repository_1.default.updateComment).toHaveBeenCalledWith(6, 3, 2, { content: comment.content });
    });
    (0, vitest_1.it)("updateComment return error if updateComment undefined", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.updateComment).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(comments_service_1.default.updateComment(6, 3, 2, { content: comment.content })).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(comments_repository_1.default.updateComment).toHaveBeenCalledWith(6, 3, 2, { content: comment.content });
    });
    (0, vitest_1.it)("deleteComment return true", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.deleteComment).mockResolvedValue(comment);
        (0, vitest_1.expect)(await comments_service_1.default.deleteComment(6, 3, 2)).toBe(true);
        (0, vitest_1.expect)(comments_repository_1.default.deleteComment).toHaveBeenCalledWith(6, 3, 2);
    });
    (0, vitest_1.it)("deleteComment return error if comment not found", async () => {
        vitest_1.vi.mocked(comments_repository_1.default.deleteComment).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(comments_service_1.default.deleteComment(6, 3, 2)).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(comments_repository_1.default.deleteComment).toHaveBeenCalledWith(6, 3, 2);
    });
});
