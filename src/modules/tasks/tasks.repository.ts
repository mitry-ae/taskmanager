

import pool from "../../db/pool";
import { type TaskPayload, type TaskFilters, UpdateTaskPayload } from "./tasks.dto";
import { withTransaction } from "../../db/withTransaction";

class TasksRepository {
    async createTask(task: TaskPayload, user_id: number) {

        const fields = ["user_id", "title"]
        const placeholders = ["$1", "$2"]

        const values: (number | string | Date)[] = [user_id, task.title]

        if (task.description) {
            fields.push("description")
            placeholders.push(`$${fields.length}`)
            values.push(task.description)
        }

        if (task.priority) {
            fields.push("priority")
            placeholders.push(`$${fields.length}`)
            values.push(task.priority)
        }

        if (task.due_date) {
            fields.push("due_date")
            placeholders.push(`$${fields.length}`)
            values.push(task.due_date)
        }

        const query = {
            text: `INSERT INTO tasks (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`,
            values: values
        }

        const { rows } = await pool.query(query)

        return rows[0]
    }

    async getTasks(user_id: number, filters: TaskFilters) {
        const values: (number | string)[] = [user_id]

        const SORT_COLUMNS: Record<TaskFilters['sort'], string> = {
            created_at: 'created_at',
            priority: 'priority',
            title: 'title',
            due_date: 'due_date'
        }

        const ORDER_COLUMNS = ['asc', 'desc']

        if (!SORT_COLUMNS[filters.sort] || !ORDER_COLUMNS.includes(filters.order.toLocaleLowerCase())) {
            throw new Error("BadRequestException")
        }

        let sqlString = `SELECT tasks.*, array_agg(json_build_object('id', tags.id, 'name', tags.name)) 
        FILTER (WHERE tags.id IS NOT NULL) as tags
        FROM tasks
        LEFT JOIN task_tags ON tasks.id = task_tags.task_id
        LEFT JOIN tags ON task_tags.tag_id = tags.id
        WHERE (tasks.user_id = $1`

        if (filters.status) {
            values.push(filters.status)
            sqlString += ` and tasks.status = $${values.length}`

        }

        if (filters.search) {
            values.push(this._getCorrectSearch(filters.search))
            sqlString += ` and tasks.title ILIKE $${values.length}`
        }

        values.push(filters.limit, (filters.page - 1) * filters.limit)

        sqlString += `) GROUP BY tasks.id
        ORDER BY ${SORT_COLUMNS[filters.sort]} ${filters.order.toUpperCase()} 
        LIMIT $${values.length - 1} OFFSET $${values.length}`

        const query = {
            text: sqlString,
            values: values
        }


        const { rows } = await pool.query(query)


        return rows
    }

    async getTaskById(taskId: number, user_id: number) {

        const query = {
            text: `SELECT t.*, array_agg(json_build_object('id', tg.id, 'name', tg.name)) as tags 
            FROM tasks t
LEFT JOIN task_tags ttg ON t.id = ttg.task_id
LEFT JOIN tags tg ON ttg.tag_id = tg.id
WHERE (t.id = $1 and t.user_id = $2)
GROUP BY t.id`,
            values: [taskId, user_id]
        }

        const { rows } = await pool.query(query)


        return rows[0]
    }

    async updateTask(id: number, user_id: number, updatePayload: UpdateTaskPayload) {

        const values: (number | string | Date)[] = []


        let fields: string[] = []

        for (let [key, value] of Object.entries(updatePayload)) {
            if (value === undefined) continue
            values.push(value)
            fields.push(`${key} = $${values.length}`)

        }

        values.push(id, user_id)

        const query = {
            text: `UPDATE tasks SET ${fields.join(",")} WHERE (id = $${values.length - 1} and user_id = $${values.length}) RETURNING *`,
            values: values
        }

        const { rows } = await pool.query(query)

        return rows[0]

    }

    async deleteTask(id: number, user_id: number) {

        const query = {
            text: "DELETE FROM tasks WHERE (id = $1 and user_id = $2) RETURNING *",
            values: [id, user_id]
        }

        const { rows } = await pool.query(query)

        return rows[0]

    }

    async getStats(user_id: number) {
        const { rows } = await pool.query({
            text: "SELECT status, COUNT (*) FROM tasks WHERE user_id = $1 GROUP BY status",
            values: [user_id]
        })

        return rows
    }

    _getCorrectSearch(searchStr: string): string {

        return `%${searchStr.replace(/[\\\%\_]/g, "\\$&")}%`
    }


}

export default new TasksRepository()