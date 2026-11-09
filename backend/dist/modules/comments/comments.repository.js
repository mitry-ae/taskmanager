"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../db/pool"));
class CommentsRepository {
    async createComment(comment, user_id, task_id) {
        const query = {
            text: "INSERT INTO task_comments (task_id, user_id, content) VAlUES ($1, $2, $3) RETURNING *",
            values: [task_id, user_id, comment.content]
        };
        const { rows } = await pool_1.default.query(query);
        return rows[0];
    }
    async getComments(user_id, task_id, filters) {
        const query = {
            text: "SELECT * FROM task_comments WHERE user_id = $1 AND task_id = $2 LIMIT $3 OFFSET $4",
            values: [user_id, task_id, filters.limit, (filters.page - 1) * filters.limit]
        };
        const { rows } = await pool_1.default.query(query);
        return rows;
    }
    async updateComment(id, user_id, task_id, updateComment) {
        const query = {
            text: "UPDATE task_comments SET content = $1 WHERE id = $2 AND task_id = $3 AND user_id = $4 RETURNING *",
            values: [updateComment.content, id, task_id, user_id]
        };
        const { rows } = await pool_1.default.query(query);
        return rows[0];
    }
    async deleteComment(id, user_id, task_id) {
        const query = {
            text: "DELETE FROM task_comments WHERE id = $1 and task_id = $2 AND user_id = $3 RETURNING *",
            values: [id, task_id, user_id]
        };
        const { rows } = await pool_1.default.query(query);
        return rows[0];
    }
}
exports.default = new CommentsRepository();
