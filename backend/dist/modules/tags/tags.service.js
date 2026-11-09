"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../common/errors");
const tags_repository_1 = __importDefault(require("./tags.repository"));
class TagsService {
    async createTag(tagPayload, userId) {
        const tag = await tags_repository_1.default.createTag(tagPayload, userId);
        return tag;
    }
    async getTags(userId, filters) {
        const tags = await tags_repository_1.default.getTags(userId, filters);
        return tags;
    }
    async assertAllBelongToUser(userId, tagIds) {
        const ownedIds = await tags_repository_1.default.findOwnedTagIds(userId, tagIds);
        if (ownedIds.length !== tagIds.length)
            throw new errors_1.NotFoundError();
    }
    async deleteTag(userId, tagId) {
        const deleteTag = await tags_repository_1.default.deleteTag(userId, tagId);
        if (!deleteTag)
            throw new errors_1.NotFoundError();
        return true;
    }
}
exports.default = new TagsService();
