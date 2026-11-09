"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = __importDefault(require("../../db/pool"));
class TagsRepository {
    async getTags(user_id, filters) {
        const { rows } = await pool_1.default.query({
            text: "SELECT * FROM tags WHERE user_id = $1 LIMIT $2 OFFSET $3",
            values: [user_id, filters.limit, (filters.page - 1) * filters.limit]
        });
        return rows;
    }
    async createTag(tag, user_id) {
        const { rows } = await pool_1.default.query({
            text: "INSERT INTO tags (user_id, name) VALUES($1, $2) RETURNING *",
            values: [user_id, tag.name]
        });
        return rows[0];
    }
    async deleteTag(user_id, tag_id) {
        const { rows } = await pool_1.default.query({
            text: "DELETE FROM tags WHERE user_id = $1 AND id = $2 RETURNING *",
            values: [user_id, tag_id]
        });
        return rows[0];
    }
    async findOwnedTagIds(userId, tagIds) {
        const { rows } = await pool_1.default.query({
            text: "SELECT * FROM tags WHERE user_id = $1 AND id = ANY($2)",
            values: [userId, tagIds]
        });
        return rows;
    }
    async replaceTags(taskId, tagIds, client) {
        await client.query({ text: "DELETE FROM task_tags WHERE task_id = $1", values: [taskId] });
        if (tagIds.length > 0) {
            let values_strings = [];
            let values = [];
            for (let item of tagIds) {
                values.push(taskId, item);
                values_strings.push(`($${values.length - 1}, $${values.length})`);
            }
            const { rows } = await client.query({
                text: `INSERT INTO task_tags (task_id, tag_id) VALUES ${values_strings.join(',')}`,
                values: values
            });
        }
    }
}
exports.default = new TagsRepository();
