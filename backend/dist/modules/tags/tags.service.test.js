"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const tags_service_1 = __importDefault(require("./tags.service"));
const tags_repository_1 = __importDefault(require("./tags.repository"));
const errors_1 = require("../../common/errors");
vitest_1.vi.mock("./tags.repository", () => ({
    default: {
        createTag: vitest_1.vi.fn(),
        getTags: vitest_1.vi.fn(),
        deleteTag: vitest_1.vi.fn(),
        findOwnedTagIds: vitest_1.vi.fn()
    }
}));
const tag = {
    id: 1,
    user_id: 1,
    name: "tag title"
};
const tags = [
    {
        id: 1,
        user_id: 1,
        name: "tag title",
    },
    {
        id: 2,
        user_id: 1,
        name: "tag title 2"
    }
];
(0, vitest_1.describe)("tags service test", () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.it)("create tag return correct tag", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.createTag).mockResolvedValue(tag);
        const tagPayload = { name: tag.name };
        (0, vitest_1.expect)(await tags_service_1.default.createTag(tagPayload, 1)).toEqual(tag);
        (0, vitest_1.expect)(tags_repository_1.default.createTag).toHaveBeenCalledWith(tagPayload, 1);
    });
    (0, vitest_1.it)("get tags return correct tags array", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.getTags).mockResolvedValue(tags);
        const filters = {
            limit: 10,
            page: 1
        };
        (0, vitest_1.expect)(await tags_service_1.default.getTags(1, filters)).toEqual(tags);
        (0, vitest_1.expect)(tags_repository_1.default.getTags).toHaveBeenCalledWith(1, filters);
    });
    (0, vitest_1.it)("delete tag return true", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.deleteTag).mockResolvedValue(true);
        (0, vitest_1.expect)(await tags_service_1.default.deleteTag(1, 1)).toBe(true);
        (0, vitest_1.expect)(tags_repository_1.default.deleteTag).toHaveBeenCalledWith(1, 1);
    });
    (0, vitest_1.it)("delete tag return not found error", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.deleteTag).mockResolvedValue(undefined);
        await (0, vitest_1.expect)(tags_service_1.default.deleteTag(1, 1)).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(tags_repository_1.default.deleteTag).toHaveBeenCalledWith(1, 1);
    });
    (0, vitest_1.it)("assertAllBelongToUser no create error if all ok", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.findOwnedTagIds).mockResolvedValue([1, 2, 3]);
        await tags_service_1.default.assertAllBelongToUser(1, [1, 2, 3]);
        (0, vitest_1.expect)(tags_repository_1.default.findOwnedTagIds).toHaveBeenCalledWith(1, [1, 2, 3]);
    });
    (0, vitest_1.it)("assertAllBelongToUser create not found error ", async () => {
        vitest_1.vi.mocked(tags_repository_1.default.findOwnedTagIds).mockResolvedValue([1, 2]);
        await (0, vitest_1.expect)(tags_service_1.default.assertAllBelongToUser(1, [1, 2, 3])).rejects.toThrow(errors_1.NotFoundError);
        (0, vitest_1.expect)(tags_repository_1.default.findOwnedTagIds).toHaveBeenCalledWith(1, [1, 2, 3]);
    });
});
