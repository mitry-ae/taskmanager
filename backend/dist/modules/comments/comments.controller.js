"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comments_dto_1 = require("./comments.dto");
const comments_service_1 = __importDefault(require("./comments.service"));
const errors_1 = require("../../common/errors");
class CommentsController {
    createComment = async (req, res) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const taskId = Number(req.params.taskId);
        const result = comments_dto_1.createCommentSchema.safeParse(req.body);
        if (!result.success) {
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        }
        const comment = result.data;
        const createdComment = await comments_service_1.default.createComment(comment, userPayload.id, taskId);
        res.json({ status: "success", data: { comment: createdComment } });
    };
    getComments = async (req, res) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const taskId = Number(req.params.taskId);
        const result = comments_dto_1.commentsFiltersShema.safeParse(req.query);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const comments = await comments_service_1.default.getComments(userPayload.id, taskId, result.data);
        res.json({ status: "success", data: { comments } });
    };
    updateComment = async (req, res) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const taskId = Number(req.params.taskId);
        const commentId = Number(req.params.commentId);
        if (!commentId)
            throw new errors_1.ValidationError("Comment id is invalid");
        const result = comments_dto_1.updateCommentSchema.safeParse(req.body);
        if (!result.success)
            throw new errors_1.ValidationError(result.error.issues[0]?.message);
        const updatedComment = await comments_service_1.default.updateComment(commentId, userPayload.id, taskId, result.data);
        res.json({ status: "success", data: { comment: updatedComment } });
    };
    deleteComment = async (req, res) => {
        const userPayload = req.user;
        if (!userPayload)
            throw new errors_1.UnauthorizedError();
        const taskId = Number(req.params.taskId);
        const commentId = Number(req.params.commentId);
        if (!commentId)
            throw new errors_1.ValidationError("Comment id is invalid");
        const deletedComment = await comments_service_1.default.deleteComment(commentId, userPayload.id, taskId);
        res.json({ status: "success", data: deletedComment });
    };
}
exports.default = new CommentsController();
