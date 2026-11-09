"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../common/errors");
const comments_repository_1 = __importDefault(require("./comments.repository"));
class CommentsService {
    createComment = async (comment, user_id, task_id) => {
        return await comments_repository_1.default.createComment(comment, user_id, task_id);
    };
    getComments = async (user_id, task_id, filters) => {
        return await comments_repository_1.default.getComments(user_id, task_id, filters);
    };
    updateComment = async (id, user_id, task_id, updateComment) => {
        const comment = await comments_repository_1.default.updateComment(id, user_id, task_id, updateComment);
        if (!comment)
            throw new errors_1.NotFoundError();
        return comment;
    };
    deleteComment = async (id, user_id, task_id) => {
        const comment = await comments_repository_1.default.deleteComment(id, user_id, task_id);
        if (!comment)
            throw new errors_1.NotFoundError();
        return true;
    };
}
exports.default = new CommentsService();
