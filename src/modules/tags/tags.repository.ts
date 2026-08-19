import pool from "../../db/pool";
import { CreateTag, TagsFilters } from "./tags.dto";
import { withTransaction } from "../../db/withTransaction";
import { PoolClient } from "pg";

class TagsRepository {
    async getTags( user_id: number, filters: TagsFilters) {
        const { rows } = await pool.query( {
            text: "SELECT * FROM tags WHERE user_id = $1 LIMIT $2 OFFSET $3",
            values: [user_id, filters.limit, (filters.page - 1 )* filters.limit]
        })

        return rows
    }

    async createTag(tag: CreateTag, user_id: number) {
        const { rows } = await pool.query({
            text: "INSERT INTO tags (user_id, name) VALUES($1, $2) RETURNING *",
            values: [user_id, tag.name]
        })

        return rows[0]
    }


    async deleteTag( user_id: number, tag_id: number) {
        const { rows } = await pool.query({
            text: "DELETE FROM tags WHERE user_id = $1 AND id = $2 RETURNING *",
            values: [user_id, tag_id]
        })

        return rows[0]
    }

    async findOwnedTagIds( userId: number, tagIds: number[]) {
        const { rows } = await pool.query({
            text: "SELECT * FROM tags WHERE user_id = $1 AND id = ANY($2)",
            values: [userId, tagIds]
        })

        return rows
    }

    async replaceTags(taskId: number, tagIds: number[], client: PoolClient) {
        await client.query({text: "DELETE FROM task_tags WHERE task_id = $1", values:[taskId]})

        if (tagIds.length > 0) {
            let values_strings: string[] = []
            let values: number[] = []

            for (let item of tagIds) {
                values.push(taskId, item)
                values_strings.push(`($${values.length - 1}, $${values.length})`)
            }

            const { rows } = await client.query({
                text: `INSERT INTO task_tags (task_id, tag_id) VALUES ${values_strings.join(',')}`,
                values: values
            })

        }
    }
}

export default new TagsRepository()