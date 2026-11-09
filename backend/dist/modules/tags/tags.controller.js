"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../common/errors");
const tags_dto_1 = require("./tags.dto");
const tags_service_1 = __importDefault(require("./tags.service"));
class TagsController {
    async getTags(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const resultValid = tags_dto_1.tagsFiltersShema.safeParse(req.query);
        if (!resultValid.success)
            throw new errors_1.ValidationError(resultValid.error.issues[0]?.message);
        const tags = await tags_service_1.default.getTags(userPayload.id, resultValid.data);
        res.json({ status: "success", data: {
                tags
            } });
    }
    async createTag(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const resultValid = tags_dto_1.createTagSchema.safeParse(req.body);
        if (!resultValid.success)
            throw new errors_1.ValidationError(resultValid.error.issues[0]?.message);
        const tag = await tags_service_1.default.createTag(resultValid.data, userPayload.id);
        res.json({ status: "success", data: { tag } });
    }
    async deleteTag(req, res, next) {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const tagId = Number(req.params.id);
        if (!tagId)
            throw new errors_1.ValidationError("expected taskId");
        await tags_service_1.default.deleteTag(userPayload.id, tagId);
        return res.json({ status: "success", data: { message: "Tag was deleted" } });
    }
}
exports.default = new TagsController();
